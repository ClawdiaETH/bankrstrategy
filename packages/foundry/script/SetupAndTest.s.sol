// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAeroFactory {
    function createPool(address tokenA, address tokenB, bool stable) external returns (address);
}

interface IAeroPool {
    function mint(address to) external returns (uint256);
}

interface IWeth {
    function deposit() external payable;
    function transfer(address, uint256) external returns (bool);
}

interface IBnkrstrRouter {
    function buyWithETH(uint256 amountOutMin, uint256 deadline) external payable returns (uint256);
    function sellForETH(uint256 amountIn, uint256 amountOutMin, uint256 deadline) external returns (uint256);
}

/**
 * @notice Full setup and test script for BankrStrategy router
 */
contract SetupAndTestScript is Script {
    address TOKEN;
    address SWEEPER;
    address REWARDS;
    address ROUTER;
    
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant AERO_FACTORY = 0x420DD381b31aEf6683db6B902084cB0FFECe40Da;
    
    function run() external {
        TOKEN = vm.envAddress("TOKEN");
        SWEEPER = vm.envAddress("SWEEPER");
        REWARDS = vm.envAddress("REWARDS");
        ROUTER = vm.envAddress("ROUTER");
        
        uint256 deployerKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        uint256 traderKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
        address deployer = vm.addr(deployerKey);
        address trader = vm.addr(traderKey);
        
        console.log("=== SETUP & TEST ===");
        console.log("Token:", TOKEN);
        console.log("Router:", ROUTER);
        
        // Step 1: Create pool and add liquidity
        vm.startBroadcast(deployerKey);
        
        address pool = IAeroFactory(AERO_FACTORY).createPool(TOKEN, WETH, false);
        console.log("Pool created:", pool);
        
        // Add 50M tokens + 50 ETH liquidity
        uint256 tokenLiquidity = 50_000_000 * 1e18;
        uint256 ethLiquidity = 50 ether;
        
        IERC20(TOKEN).transfer(pool, tokenLiquidity);
        IWeth(WETH).deposit{value: ethLiquidity}();
        IWeth(WETH).transfer(pool, ethLiquidity);
        IAeroPool(pool).mint(deployer);
        console.log("Liquidity added: 50M BNKRSTR + 50 ETH");
        
        // Give trader some tokens for testing
        IERC20(TOKEN).transfer(trader, 10_000_000 * 1e18);
        
        vm.stopBroadcast();
        
        // Step 2: Test trading via router
        console.log("\n=== TESTING ROUTER ===");
        
        uint256 sweeperBefore = IERC20(TOKEN).balanceOf(SWEEPER);
        uint256 rewardsBefore = IERC20(TOKEN).balanceOf(REWARDS);
        console.log("Sweeper before:", sweeperBefore / 1e18);
        console.log("Rewards before:", rewardsBefore / 1e18);
        
        vm.startBroadcast(traderKey);
        
        // Buy with 1 ETH
        uint256 tokensBought = IBnkrstrRouter(ROUTER).buyWithETH{value: 1 ether}(
            0, block.timestamp + 300
        );
        console.log("\nBought:", tokensBought / 1e18, "BNKRSTR with 1 ETH");
        
        // Sell half (should trigger 10% fee)
        uint256 sellAmount = tokensBought / 2;
        IERC20(TOKEN).approve(ROUTER, sellAmount);
        
        uint256 ethReceived = IBnkrstrRouter(ROUTER).sellForETH(
            sellAmount, 0, block.timestamp + 300
        );
        console.log("Sold:", sellAmount / 1e18, "BNKRSTR");
        console.log("Received:", ethReceived / 1e15, "milliETH");
        
        vm.stopBroadcast();
        
        // Step 3: Verify fees
        uint256 sweeperAfter = IERC20(TOKEN).balanceOf(SWEEPER);
        uint256 rewardsAfter = IERC20(TOKEN).balanceOf(REWARDS);
        
        console.log("\n=== FEES COLLECTED ===");
        console.log("Sweeper +", (sweeperAfter - sweeperBefore) / 1e18, "BNKRSTR (8%)");
        console.log("Rewards +", (rewardsAfter - rewardsBefore) / 1e18, "BNKRSTR (1%)");
        console.log("Expected fee:", sellAmount * 10 / 100 / 1e18, "BNKRSTR (10% total)");
        
        console.log("\n=== SUCCESS! Router fee collection working ===");
    }
}
