// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/BnkrstrToken.sol";
import "../contracts/MockAerodromePool.sol";
import "../contracts/MockWETH.sol";

contract SetupPoolScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "DEPLOYER_PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);
        
        // Load deployed token address
        address tokenAddr = vm.envOr("BNKRSTR_TOKEN", address(0xfe33719D48c1d269d6941BC64adE285f2DC8958D));
        BnkrstrToken token = BnkrstrToken(tokenAddr);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Setting up liquidity pool...");
        console.log("Token:", tokenAddr);
        
        // 1. Deploy Mock WETH
        MockWETH weth = new MockWETH();
        console.log("MockWETH deployed:", address(weth));
        
        // 2. Deploy Mock Pool
        MockAerodromePool pool = new MockAerodromePool(tokenAddr, address(weth));
        console.log("MockPool deployed:", address(pool));
        
        // 3. Wrap some ETH
        weth.deposit{value: 100 ether}();
        console.log("Wrapped 100 ETH");
        
        // 4. Add liquidity: 100M BNKRSTR + 100 WETH (price: 1 ETH = 1M BNKRSTR)
        uint256 tokenAmount = 100_000_000 * 1e18;
        uint256 wethAmount = 100 * 1e18;
        
        token.approve(address(pool), tokenAmount);
        weth.approve(address(pool), wethAmount);
        
        pool.addLiquidity(tokenAmount, wethAmount);
        console.log("Added liquidity: 100M BNKRSTR + 100 WETH");
        
        // 5. Register pool as trading pair (triggers fees)
        token.setPair(address(pool), true);
        console.log("Pool registered as trading pair");
        
        // 6. Exempt the pool from fees (so we can add/remove liquidity without fees)
        // Actually, we want fees on swaps, not on LP operations
        // The pool itself should be exempt so LP additions don't trigger fees
        token.setExempt(address(pool), true);
        console.log("Pool exempted (LP operations fee-free)");
        
        vm.stopBroadcast();
        
        console.log("\n=== POOL SETUP COMPLETE ===");
        console.log("MockWETH:", address(weth));
        console.log("Pool:", address(pool));
        console.log("Price: 1 ETH = 1,000,000 BNKRSTR");
        console.log("\nTo test fee mechanism:");
        console.log("1. Transfer tokens to another address");
        console.log("2. Have them swap via pool (triggers 10% fee)");
    }
}
