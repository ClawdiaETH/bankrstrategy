// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAerodrome.sol";

/**
 * @title NFT Sweeper
 * @notice Accumulates BNKRSTR fees, swaps to ETH via Aerodrome, buys Bankr Club NFTs.
 * Anyone can trigger sweep for 1% reward.
 */
contract NftSweeper is Ownable, ReentrancyGuard {
    IERC20 public immutable bnkrstr;
    IERC721 public immutable bankrClubNft;
    
    // Aerodrome on Base
    IAerodromeRouter public constant AERODROME_ROUTER = IAerodromeRouter(0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43);
    address public constant AERODROME_FACTORY = 0x420DD381b31aEf6683db6B902084cB0FFECe40Da;
    
    // WETH on Base
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    
    // Minimum balance before sweep can trigger
    uint256 public minSweepAmount = 1000 * 1e18; // 1000 BNKRSTR
    
    // Caller reward (basis points)
    uint256 public callerRewardBps = 100; // 1%
    
    // Slippage tolerance (basis points)
    uint256 public slippageBps = 500; // 5% max slippage
    
    // NFT treasury (where purchased NFTs go)
    address public nftTreasury;
    
    // Stats
    uint256 public totalBnkrstrSwapped;
    uint256 public totalEthReceived;
    uint256 public totalNftsPurchased;
    uint256 public totalEthSpentOnNfts;
    
    // Events
    event Swept(address indexed caller, uint256 bnkrstrAmount, uint256 ethReceived, uint256 callerReward);
    event NftPurchased(uint256 indexed tokenId, uint256 ethSpent);
    event EthWithdrawn(address indexed to, uint256 amount);
    event MinSweepAmountUpdated(uint256 newAmount);
    event CallerRewardUpdated(uint256 newBps);
    event SlippageUpdated(uint256 newBps);
    
    constructor(
        address _bnkrstr,
        address _bankrClubNft,
        address _nftTreasury
    ) Ownable(msg.sender) {
        bnkrstr = IERC20(_bnkrstr);
        bankrClubNft = IERC721(_bankrClubNft);
        nftTreasury = _nftTreasury;
    }
    
    /**
     * @notice Trigger a sweep - anyone can call for 1% reward
     * @dev Swaps accumulated BNKRSTR to ETH via Aerodrome
     */
    function sweep() external nonReentrant returns (uint256 ethReceived) {
        uint256 balance = bnkrstr.balanceOf(address(this));
        require(balance >= minSweepAmount, "Insufficient balance");
        
        // Calculate caller reward
        uint256 callerReward = (balance * callerRewardBps) / 10000;
        uint256 swapAmount = balance - callerReward;
        
        // Send caller reward in BNKRSTR
        bnkrstr.transfer(msg.sender, callerReward);
        
        // Get expected output
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
        routes[0] = IAerodromeRouter.Route({
            from: address(bnkrstr),
            to: WETH,
            stable: false,
            factory: AERODROME_FACTORY
        });
        
        uint256[] memory expectedAmounts = AERODROME_ROUTER.getAmountsOut(swapAmount, routes);
        uint256 expectedEth = expectedAmounts[expectedAmounts.length - 1];
        uint256 minOut = (expectedEth * (10000 - slippageBps)) / 10000;
        
        // Approve router
        bnkrstr.approve(address(AERODROME_ROUTER), swapAmount);
        
        // Swap BNKRSTR → ETH
        uint256 ethBefore = address(this).balance;
        AERODROME_ROUTER.swapExactTokensForETH(
            swapAmount,
            minOut,
            routes,
            address(this),
            block.timestamp + 300
        );
        ethReceived = address(this).balance - ethBefore;
        
        // Update stats
        totalBnkrstrSwapped += swapAmount;
        totalEthReceived += ethReceived;
        
        emit Swept(msg.sender, balance, ethReceived, callerReward);
    }
    
    /**
     * @notice Simulate sweep to get expected output
     */
    function previewSweep() external view returns (
        uint256 bnkrstrBalance,
        uint256 callerReward,
        uint256 swapAmount,
        uint256 expectedEth
    ) {
        bnkrstrBalance = bnkrstr.balanceOf(address(this));
        if (bnkrstrBalance == 0) return (0, 0, 0, 0);
        
        callerReward = (bnkrstrBalance * callerRewardBps) / 10000;
        swapAmount = bnkrstrBalance - callerReward;
        
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
        routes[0] = IAerodromeRouter.Route({
            from: address(bnkrstr),
            to: WETH,
            stable: false,
            factory: AERODROME_FACTORY
        });
        
        try AERODROME_ROUTER.getAmountsOut(swapAmount, routes) returns (uint256[] memory amounts) {
            expectedEth = amounts[amounts.length - 1];
        } catch {
            expectedEth = 0;
        }
    }
    
    /**
     * @notice Purchase floor NFT using accumulated ETH
     * @dev Called by keeper with Relay API data
     * @param tokenId NFT token ID to purchase
     * @param maxPrice Maximum ETH to spend
     * @param marketplace Address to send ETH (OpenSea/Blur fulfillment)
     * @param data Calldata for marketplace purchase
     */
    function purchaseNft(
        uint256 tokenId,
        uint256 maxPrice,
        address marketplace,
        bytes calldata data
    ) external onlyOwner nonReentrant {
        require(address(this).balance >= maxPrice, "Insufficient ETH");
        
        uint256 ethBefore = address(this).balance;
        
        // Execute marketplace purchase
        (bool success,) = marketplace.call{value: maxPrice}(data);
        require(success, "Purchase failed");
        
        // Verify we received the NFT
        require(bankrClubNft.ownerOf(tokenId) == address(this), "NFT not received");
        
        uint256 ethSpent = ethBefore - address(this).balance;
        
        // Transfer NFT to treasury
        bankrClubNft.transferFrom(address(this), nftTreasury, tokenId);
        
        // Update stats
        totalNftsPurchased++;
        totalEthSpentOnNfts += ethSpent;
        
        emit NftPurchased(tokenId, ethSpent);
    }
    
    /**
     * @notice Check if sweep is available
     */
    function canSweep() external view returns (bool) {
        return bnkrstr.balanceOf(address(this)) >= minSweepAmount;
    }
    
    /**
     * @notice Get current sweepable balance
     */
    function sweepableBalance() external view returns (uint256) {
        return bnkrstr.balanceOf(address(this));
    }
    
    /**
     * @notice Get ETH available for NFT purchases
     */
    function availableEth() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Get all stats
     */
    function getStats() external view returns (
        uint256 _totalBnkrstrSwapped,
        uint256 _totalEthReceived,
        uint256 _totalNftsPurchased,
        uint256 _totalEthSpentOnNfts,
        uint256 _currentBnkrstr,
        uint256 _currentEth
    ) {
        return (
            totalBnkrstrSwapped,
            totalEthReceived,
            totalNftsPurchased,
            totalEthSpentOnNfts,
            bnkrstr.balanceOf(address(this)),
            address(this).balance
        );
    }
    
    // Admin functions
    
    function setMinSweepAmount(uint256 amount) external onlyOwner {
        minSweepAmount = amount;
        emit MinSweepAmountUpdated(amount);
    }
    
    function setCallerReward(uint256 bps) external onlyOwner {
        require(bps <= 500, "Max 5%");
        callerRewardBps = bps;
        emit CallerRewardUpdated(bps);
    }
    
    function setSlippage(uint256 bps) external onlyOwner {
        require(bps <= 1000, "Max 10%");
        slippageBps = bps;
        emit SlippageUpdated(bps);
    }
    
    function setNftTreasury(address treasury) external onlyOwner {
        nftTreasury = treasury;
    }
    
    function withdrawEth(address to, uint256 amount) external onlyOwner {
        (bool success,) = to.call{value: amount}("");
        require(success, "Transfer failed");
        emit EthWithdrawn(to, amount);
    }
    
    // Allow receiving ETH
    receive() external payable {}
}
