// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/BnkrstrTokenV2.sol";
import "../contracts/NftSweeper.sol";
import "../contracts/HolderRewards.sol";

interface IFactory {
    function getPool(address tokenA, address tokenB, bool stable) external view returns (address);
}

interface IRouter {
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

contract DeployV2Script is Script {
    // Base mainnet addresses
    address constant BANKR_CLUB_NFT = 0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82;
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant AERODROME_ROUTER = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;
    address constant AERODROME_FACTORY = 0x420DD381b31aEf6683db6B902084cB0FFECe40Da;
    
    // Token config
    uint256 constant INITIAL_SUPPLY = 1_000_000_000 * 1e18; // 1 billion
    uint256 constant LP_AMOUNT = 400_000_000 * 1e18; // 400M to LP
    uint256 constant LP_ETH = 0.15 ether; // ETH for LP (using less this time)

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== BANKRSTRATEGY V2 DEPLOYMENT ===");
        console.log("Deployer:", deployer);
        console.log("Deployer ETH balance:", deployer.balance / 1e18);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy placeholder addresses for sweeper/rewards (we'll set token after)
        // Actually, deploy sweeper first with placeholder, then token, then update
        
        // For now, use deployer as temp recipient, we'll deploy real contracts after
        address tempSweeper = deployer;
        address tempRewards = deployer;
        address devFund = deployer;
        
        // 2. Deploy Token V2
        BnkrstrTokenV2 token = new BnkrstrTokenV2(
            INITIAL_SUPPLY,
            tempSweeper,  // will update
            tempRewards,  // will update
            devFund
        );
        console.log("BnkrstrTokenV2 deployed:", address(token));
        
        // 3. Deploy real Sweeper with correct token
        NftSweeper sweeper = new NftSweeper(
            address(token),
            BANKR_CLUB_NFT,
            WETH
        );
        console.log("NftSweeper deployed:", address(sweeper));
        
        // 4. Deploy real HolderRewards with correct token
        HolderRewards rewards = new HolderRewards(address(token), BANKR_CLUB_NFT);
        console.log("HolderRewards deployed:", address(rewards));
        
        // 5. Update token with real fee recipients
        token.setFeeRecipients(address(sweeper), address(rewards), devFund);
        console.log("Fee recipients updated");
        
        // 6. Approve router and add liquidity
        token.approve(AERODROME_ROUTER, LP_AMOUNT);
        
        IRouter(AERODROME_ROUTER).addLiquidityETH{value: LP_ETH}(
            address(token),
            false, // volatile pool
            LP_AMOUNT,
            LP_AMOUNT,
            LP_ETH,
            deployer,
            block.timestamp + 300
        );
        console.log("Liquidity added: 400M BNKRSTR +", LP_ETH / 1e18, "ETH");
        
        // 7. Get pool address and set on token
        address pool = IFactory(AERODROME_FACTORY).getPool(
            address(token),
            WETH,
            false
        );
        console.log("Pool address:", pool);
        
        token.setLpPool(pool);
        console.log("LP pool set on token - FEES ARE NOW ACTIVE");
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== V2 DEPLOYMENT SUMMARY ===");
        console.log("  Token:          ", address(token));
        console.log("  Sweeper:        ", address(sweeper));
        console.log("  HolderRewards:  ", address(rewards));
        console.log("  Pool:           ", pool);
        console.log("  Dev Fund:       ", devFund);
        console.log("");
        console.log("FEE STRUCTURE:");
        console.log("  - 8% to Sweeper (floor sweeps)");
        console.log("  - 1% to HolderRewards");
        console.log("  - 1% to Dev Fund");
        console.log("  = 10% total on sells");
        console.log("");
        console.log("IMPORTANT: Fees ONLY apply to sells (transfers TO the LP pool)");
        console.log("Buys and transfers between wallets are FREE");
    }
}
