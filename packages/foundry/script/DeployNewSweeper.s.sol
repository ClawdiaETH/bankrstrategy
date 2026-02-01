// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/NftSweeper.sol";

interface IBnkrstrToken {
    function setFeeRecipients(address _sweeper, address _rewards, address _devFund) external;
    function sweeper() external view returns (address);
    function rewards() external view returns (address);
    function devFund() external view returns (address);
}

contract DeployNewSweeperScript is Script {
    // Existing contracts
    address constant TOKEN = 0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A;
    
    // Correct Bankr Club NFT address
    address constant BANKR_CLUB_NFT = 0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82;
    
    // NFT treasury (where purchased NFTs go) - using WETH as placeholder or signing wallet
    address constant NFT_TREASURY = 0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== DEPLOY NEW SWEEPER ===");
        console.log("Deployer:", deployer);
        
        IBnkrstrToken token = IBnkrstrToken(TOKEN);
        
        // Get current recipients
        address oldSweeper = token.sweeper();
        address rewards = token.rewards();
        address devFund = token.devFund();
        
        console.log("Old Sweeper:", oldSweeper);
        console.log("Rewards:", rewards);
        console.log("Dev Fund:", devFund);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy new Sweeper with correct NFT address
        NftSweeper newSweeper = new NftSweeper(
            TOKEN,
            BANKR_CLUB_NFT,
            NFT_TREASURY
        );
        console.log("New Sweeper deployed:", address(newSweeper));
        
        // 2. Update token to use new sweeper
        token.setFeeRecipients(address(newSweeper), rewards, devFund);
        console.log("Token updated to use new sweeper");
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== SUMMARY ===");
        console.log("New Sweeper:", address(newSweeper));
        console.log("Bankr Club NFT:", BANKR_CLUB_NFT);
        console.log("NFT Treasury:", NFT_TREASURY);
        console.log("");
        console.log("Don't forget to withdraw ETH from old sweeper:", oldSweeper);
    }
}
