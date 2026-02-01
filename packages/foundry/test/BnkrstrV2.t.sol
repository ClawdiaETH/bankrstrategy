// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/BnkrstrTokenV2.sol";

interface IRouter {
    struct Route {
        address from;
        address to;
        bool stable;
        address factory;
    }
    
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external;
    
    function addLiquidityETH(
        address token,
        bool stable,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
}

interface IFactory {
    function getPool(address tokenA, address tokenB, bool stable) external view returns (address);
}

contract BnkrstrV2Test is Test {
    BnkrstrTokenV2 public token;
    
    address constant ROUTER = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;
    address constant FACTORY = 0x420DD381b31aEf6683db6B902084cB0FFECe40Da;
    address constant WETH = 0x4200000000000000000000000000000000000006;
    
    address deployer;
    address user1 = address(0x1111);
    address sweeper = address(0x2222);
    address rewards = address(0x3333);
    address devFund = address(0x9999);
    
    function setUp() public {
        deployer = address(this);
        
        // Fork Base mainnet
        vm.createSelectFork("https://mainnet.base.org");
        
        // Deploy token
        token = new BnkrstrTokenV2(
            1_000_000_000 * 1e18,
            sweeper,
            rewards,
            devFund
        );
        
        // Give user and deployer some ETH
        vm.deal(user1, 10 ether);
        vm.deal(deployer, 10 ether);
    }
    
    function testCreatePoolAndTrade() public {
        // 1. Create LP pool
        uint256 tokenAmount = 400_000_000 * 1e18;
        uint256 ethAmount = 0.25 ether;
        
        token.approve(ROUTER, tokenAmount);
        
        IRouter(ROUTER).addLiquidityETH{value: ethAmount}(
            address(token),
            false, // volatile
            tokenAmount,
            tokenAmount,
            ethAmount,
            deployer,
            block.timestamp + 300
        );
        
        // 2. Get pool address
        address pool = IFactory(FACTORY).getPool(address(token), WETH, false);
        console.log("Pool created:", pool);
        assertTrue(pool != address(0), "Pool not created");
        
        // 3. Set LP pool on token to activate fees
        token.setLpPool(pool);
        console.log("LP pool set");
        
        // 4. Give user1 some tokens
        uint256 userTokens = 1_000_000 * 1e18;
        token.transfer(user1, userTokens);
        
        // 5. Check balances before
        uint256 sweeperBefore = token.balanceOf(sweeper);
        uint256 rewardsBefore = token.balanceOf(rewards);
        uint256 devBefore = token.balanceOf(devFund);
        uint256 userEthBefore = user1.balance;
        
        console.log("User tokens before:", userTokens / 1e18);
        console.log("Sweeper before:", sweeperBefore / 1e18);
        
        // 6. User sells tokens via Aerodrome
        vm.startPrank(user1);
        token.approve(ROUTER, userTokens);
        
        IRouter.Route[] memory routes = new IRouter.Route[](1);
        routes[0] = IRouter.Route({
            from: address(token),
            to: WETH,
            stable: false,
            factory: FACTORY
        });
        
        // Use fee-supporting swap function
        IRouter(ROUTER).swapExactTokensForETHSupportingFeeOnTransferTokens(
            userTokens,
            0, // accept any amount (slippage for test)
            routes,
            user1,
            block.timestamp + 300
        );
        vm.stopPrank();
        
        // 7. Check fees were collected
        uint256 sweeperAfter = token.balanceOf(sweeper);
        uint256 rewardsAfter = token.balanceOf(rewards);
        uint256 devAfter = token.balanceOf(devFund);
        uint256 userEthAfter = user1.balance;
        
        uint256 expectedSweeperFee = (userTokens * 800) / 10000; // 8%
        uint256 expectedRewardsFee = (userTokens * 100) / 10000; // 1%
        uint256 expectedDevFee = (userTokens * 100) / 10000; // 1%
        
        console.log("");
        console.log("=== RESULTS ===");
        console.log("Sweeper received:", (sweeperAfter - sweeperBefore) / 1e18, "BNKRSTR");
        console.log("Expected:        ", expectedSweeperFee / 1e18, "BNKRSTR");
        console.log("Rewards received:", (rewardsAfter - rewardsBefore) / 1e18, "BNKRSTR");
        console.log("Dev received:    ", (devAfter - devBefore) / 1e18, "BNKRSTR");
        console.log("User ETH gained: ", (userEthAfter - userEthBefore) / 1e15, "finney");
        
        // Verify fees
        assertEq(sweeperAfter - sweeperBefore, expectedSweeperFee, "Sweeper fee wrong");
        assertEq(rewardsAfter - rewardsBefore, expectedRewardsFee, "Rewards fee wrong");
        assertEq(devAfter - devBefore, expectedDevFee, "Dev fee wrong");
        
        // User should have received ETH
        assertTrue(userEthAfter > userEthBefore, "User didn't receive ETH");
        
        console.log("");
        console.log("SUCCESS: Fee-on-transfer works with Aerodrome!");
    }
}
