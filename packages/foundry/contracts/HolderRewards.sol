// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Holder Rewards
 * @notice Distributes BNKRSTR rewards to Bankr Club NFT holders.
 * 
 * Mechanics:
 * - 1% of all BNKRSTR trades accumulates here
 * - Bankr Club NFT holders can claim proportional share
 * - Snapshot-free: claims based on current NFT ownership
 * 
 * Reward calculation:
 * - Each NFT = 1 share
 * - reward = (totalRewards / 1000) per NFT owned
 */
contract HolderRewards is Ownable, ReentrancyGuard {
    IERC20 public immutable bnkrstr;
    IERC721 public immutable bankrClubNft;
    
    // Total NFT supply for reward calculation
    uint256 public constant TOTAL_NFTS = 1000;
    
    // Track claimed rewards per user to enable fair distribution
    mapping(address => uint256) public lastClaimedAt;
    mapping(address => uint256) public totalClaimed;
    
    // Running total of rewards deposited
    uint256 public totalRewardsDeposited;
    uint256 public totalRewardsClaimed;
    
    // Minimum reward epoch (prevent spam claims)
    uint256 public minClaimInterval = 1 days;
    
    // Events
    event RewardsClaimed(address indexed holder, uint256 amount, uint256 nftsOwned);
    event RewardsDeposited(uint256 amount);
    
    constructor(
        address _bnkrstr,
        address _bankrClubNft
    ) Ownable(msg.sender) {
        bnkrstr = IERC20(_bnkrstr);
        bankrClubNft = IERC721(_bankrClubNft);
    }
    
    /**
     * @notice Claim rewards for held NFTs
     * @dev Reward = (unclaimed pool / 1000) * NFTs owned
     */
    function claim() external nonReentrant {
        require(
            block.timestamp >= lastClaimedAt[msg.sender] + minClaimInterval,
            "Claim too soon"
        );
        
        uint256 nftsOwned = bankrClubNft.balanceOf(msg.sender);
        require(nftsOwned > 0, "No NFTs owned");
        
        uint256 availableRewards = bnkrstr.balanceOf(address(this));
        require(availableRewards > 0, "No rewards available");
        
        // Calculate share: (available / 1000) * NFTs owned
        uint256 rewardPerNft = availableRewards / TOTAL_NFTS;
        uint256 claimAmount = rewardPerNft * nftsOwned;
        
        require(claimAmount > 0, "Reward too small");
        
        // Update state
        lastClaimedAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += claimAmount;
        totalRewardsClaimed += claimAmount;
        
        // Transfer rewards
        bnkrstr.transfer(msg.sender, claimAmount);
        
        emit RewardsClaimed(msg.sender, claimAmount, nftsOwned);
    }
    
    /**
     * @notice Check pending rewards for an address
     */
    function pendingRewards(address holder) external view returns (uint256) {
        uint256 nftsOwned = bankrClubNft.balanceOf(holder);
        if (nftsOwned == 0) return 0;
        
        uint256 availableRewards = bnkrstr.balanceOf(address(this));
        if (availableRewards == 0) return 0;
        
        uint256 rewardPerNft = availableRewards / TOTAL_NFTS;
        return rewardPerNft * nftsOwned;
    }
    
    /**
     * @notice Check if address can claim
     */
    function canClaim(address holder) external view returns (bool) {
        if (bankrClubNft.balanceOf(holder) == 0) return false;
        if (block.timestamp < lastClaimedAt[holder] + minClaimInterval) return false;
        if (bnkrstr.balanceOf(address(this)) == 0) return false;
        return true;
    }
    
    /**
     * @notice Deposit rewards (called by BNKRSTR token on fees)
     */
    function depositRewards(uint256 amount) external {
        bnkrstr.transferFrom(msg.sender, address(this), amount);
        totalRewardsDeposited += amount;
        emit RewardsDeposited(amount);
    }
    
    // Admin functions
    
    function setMinClaimInterval(uint256 interval) external onlyOwner {
        minClaimInterval = interval;
    }
}
