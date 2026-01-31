// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/BnkrstrToken.sol";
import "../contracts/NftSweeper.sol";
import "../contracts/HolderRewards.sol";
import "../contracts/BnkrstrRouter.sol";

contract DeployScript is Script {
    // Base mainnet addresses
    address constant BANKR_CLUB_NFT = 0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82;
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant AERODROME_ROUTER = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;
    address constant AERODROME_FACTORY = 0x420DD381b31aEf6683db6B902084cB0FFECe40Da;
    
    // Token config
    uint256 constant INITIAL_SUPPLY = 1_000_000_000 * 1e18; // 1 billion

    function run() external {
        uint256 deployerPrivateKey = vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer:", deployer);
        console.log("Deploying BankrStrategy contracts...");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Token (simple ERC-20, no transfer fees)
        BnkrstrToken token = new BnkrstrToken(INITIAL_SUPPLY);
        console.log("BnkrstrToken deployed:", address(token));
        
        // 2. Deploy NFT Sweeper
        NftSweeper sweeper = new NftSweeper(
            address(token),
            BANKR_CLUB_NFT,
            WETH
        );
        console.log("NftSweeper deployed:", address(sweeper));
        
        // 3. Deploy Holder Rewards
        HolderRewards rewards = new HolderRewards(address(token), BANKR_CLUB_NFT);
        console.log("HolderRewards deployed:", address(rewards));
        
        // 4. Deploy Router (handles 10% sell fee)
        BnkrstrRouter router = new BnkrstrRouter(
            address(token),
            WETH,
            AERODROME_ROUTER,
            AERODROME_FACTORY,
            address(sweeper),    // 8% to sweeper
            address(rewards),    // 1% to rewards
            deployer             // 1% to dev
        );
        console.log("BnkrstrRouter deployed:", address(router));
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== DEPLOYMENT SUMMARY ===");
        console.log("  BNKRSTR Token:", address(token));
        console.log("  NFT Sweeper:", address(sweeper));
        console.log("  Holder Rewards:", address(rewards));
        console.log("  Router (fees):", address(router));
        console.log("  Bankr Club NFT:", BANKR_CLUB_NFT);
        console.log("  Dev Fund:", deployer);
        console.log("");
        console.log("Next steps:");
        console.log("  1. Create liquidity pool on Aerodrome");
        console.log("  2. Users trade via BnkrstrRouter for fee collection");
        console.log("  3. Set up keeper for sweeper.sweep()");
    }
}
