// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/BnkrstrToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAerodromeFactory {
    function createPool(address tokenA, address tokenB, bool stable) external returns (address pool);
    function getPool(address tokenA, address tokenB, bool stable) external view returns (address);
}

interface IAerodromeRouter {
    struct Route {
        address from;
        address to;
        bool stable;
        address factory;
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);
}

interface IWETH {
    function deposit() external payable;
    function approve(address spender, uint256 amount) external returns (bool);
}

contract SetupAerodromeScript is Script {
    address constant AERODROME_FACTORY = 0x420DD381b31aEf6683db6B902084cB0FFECe40Da;
    address constant AERODROME_ROUTER = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant BNKRSTR = 0xfe33719D48c1d269d6941BC64adE285f2DC8958D;
    
    function run() external {
        uint256 deployerKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        vm.startBroadcast(deployerKey);
        
        // 1. Create or get pool
        address pool = IAerodromeFactory(AERODROME_FACTORY).getPool(BNKRSTR, WETH, false);
        if (pool == address(0)) {
            pool = IAerodromeFactory(AERODROME_FACTORY).createPool(BNKRSTR, WETH, false);
            console.log("Created pool:", pool);
        } else {
            console.log("Existing pool:", pool);
        }
        
        // 2. Wrap ETH
        IWETH(WETH).deposit{value: 50 ether}();
        
        // 3. Approve
        IERC20(BNKRSTR).approve(AERODROME_ROUTER, 50_000_000 * 1e18);
        IWETH(WETH).approve(AERODROME_ROUTER, 50 ether);
        
        // 4. Add liquidity (1 ETH = 1M BNKRSTR)
        IAerodromeRouter(AERODROME_ROUTER).addLiquidity(
            BNKRSTR, WETH, false,
            50_000_000 * 1e18, 50 ether,
            0, 0,
            vm.addr(deployerKey),
            block.timestamp + 3600
        );
        console.log("Added liquidity: 50M BNKRSTR + 50 ETH");
        
        // 5. Register as pair
        BnkrstrToken(BNKRSTR).setPair(pool, true);
        console.log("Registered as trading pair");
        
        vm.stopBroadcast();
        
        console.log("\n=== DONE ===");
        console.log("Pool:", pool);
    }
}
