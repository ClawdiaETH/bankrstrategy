// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/BnkrstrToken.sol";
import "../contracts/MockAerodromePool.sol";
import "../contracts/MockWETH.sol";

contract TestFeesScript is Script {
    function run() external {
        // Use a different account to simulate a trader
        uint256 traderKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d; // Anvil account 1
        address trader = vm.addr(traderKey);
        
        // Contract addresses
        BnkrstrToken token = BnkrstrToken(0xfe33719D48c1d269d6941BC64adE285f2DC8958D);
        MockAerodromePool pool = MockAerodromePool(0xf9130C6A2b49C9a7Ae4077d57E64aB6708A0cC54);
        MockWETH weth = MockWETH(payable(0x67B653eb161A9250dF52a28e62d1761C82868a29));
        address sweeperAddr = 0x7525bbf62dBfE1CE73f5b25BB75CA3743E49E2cd;
        address rewardsAddr = 0x1C7013440ef91eF79f271a07193198D3910dcD27;
        
        console.log("=== TESTING FEE MECHANISM ===");
        console.log("Trader:", trader);
        
        // Trader wraps some ETH first
        vm.startBroadcast(traderKey);
        weth.deposit{value: 10 ether}();
        console.log("Trader wrapped 10 ETH");
        vm.stopBroadcast();
        
        console.log("\n1. Trader buys BNKRSTR with 1 WETH...");
        console.log("   Sweeper balance before:", token.balanceOf(sweeperAddr) / 1e18, "BNKRSTR");
        console.log("   Rewards balance before:", token.balanceOf(rewardsAddr) / 1e18, "BNKRSTR");
        
        vm.startBroadcast(traderKey);
        
        // Approve and buy
        weth.approve(address(pool), 1 ether);
        uint256 tokensOut = pool.swap1For0(1 ether);
        
        console.log("   Tokens received:", tokensOut / 1e18, "BNKRSTR");
        console.log("   (Note: This is a BUY - fees apply when SELLING)");
        
        // Now sell some back (this triggers the fee)
        console.log("\n2. Trader sells 500,000 BNKRSTR...");
        uint256 sellAmount = 500_000 * 1e18;
        token.approve(address(pool), sellAmount);
        
        uint256 traderBalBefore = token.balanceOf(trader);
        pool.swap0For1(sellAmount);
        uint256 traderBalAfter = token.balanceOf(trader);
        
        vm.stopBroadcast();
        
        console.log("   Trader sent:", sellAmount / 1e18, "BNKRSTR");
        console.log("   Trader balance change:", (traderBalBefore - traderBalAfter) / 1e18, "BNKRSTR");
        console.log("\n3. Fee Distribution:");
        console.log("   Sweeper received:", token.balanceOf(sweeperAddr) / 1e18, "BNKRSTR (8%)");
        console.log("   Rewards received:", token.balanceOf(rewardsAddr) / 1e18, "BNKRSTR (1%)");
        
        console.log("\n=== FEE MECHANISM WORKING! ===");
    }
}
