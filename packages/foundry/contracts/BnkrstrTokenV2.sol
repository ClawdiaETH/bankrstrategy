// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BNKRSTR Token V2
 * @notice Fee-on-transfer token - fees are taken on ALL transfers to LP
 * @dev 10% fee on sells (transfers TO the LP pool)
 *      - 8% → NFT sweeper
 *      - 1% → holder rewards  
 *      - 1% → dev fund
 */
contract BnkrstrTokenV2 is ERC20, Ownable {
    // Fee recipients
    address public sweeper;      // 8%
    address public rewards;      // 1%
    address public devFund;      // 1%
    
    // LP pool address (fees only on transfers TO this address = sells)
    address public lpPool;
    
    // Fee basis points (10% total = 1000 bps)
    uint256 public constant SWEEPER_FEE = 800;   // 8%
    uint256 public constant REWARDS_FEE = 100;   // 1%
    uint256 public constant DEV_FEE = 100;       // 1%
    uint256 public constant TOTAL_FEE = 1000;    // 10%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Addresses exempt from fees (for adding liquidity, etc)
    mapping(address => bool) public isExempt;
    
    // Events
    event FeeCollected(address indexed from, uint256 sweeperAmount, uint256 rewardsAmount, uint256 devAmount);
    event LpPoolSet(address indexed pool);
    event ExemptionSet(address indexed account, bool exempt);
    
    constructor(
        uint256 initialSupply,
        address _sweeper,
        address _rewards,
        address _devFund
    ) ERC20("BankrStrategy", "BNKRSTR") Ownable(msg.sender) {
        require(_sweeper != address(0), "Invalid sweeper");
        require(_rewards != address(0), "Invalid rewards");
        require(_devFund != address(0), "Invalid dev fund");
        
        sweeper = _sweeper;
        rewards = _rewards;
        devFund = _devFund;
        
        // Owner is exempt (for initial LP setup)
        isExempt[msg.sender] = true;
        
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @notice Set the LP pool address (fees apply on transfers TO this address)
     */
    function setLpPool(address _lpPool) external onlyOwner {
        lpPool = _lpPool;
        emit LpPoolSet(_lpPool);
    }
    
    /**
     * @notice Set fee exemption for an address
     */
    function setExempt(address account, bool exempt) external onlyOwner {
        isExempt[account] = exempt;
        emit ExemptionSet(account, exempt);
    }
    
    /**
     * @notice Update fee recipients
     */
    function setFeeRecipients(address _sweeper, address _rewards, address _devFund) external onlyOwner {
        require(_sweeper != address(0) && _rewards != address(0) && _devFund != address(0), "Invalid address");
        sweeper = _sweeper;
        rewards = _rewards;
        devFund = _devFund;
    }
    
    /**
     * @dev Override _update to implement fee-on-transfer
     * Fees only apply when transferring TO the LP pool (selling)
     */
    function _update(address from, address to, uint256 amount) internal virtual override {
        // Check if this is a sell (transfer to LP pool) and not exempt
        bool isSell = (to == lpPool) && (lpPool != address(0));
        bool shouldTakeFee = isSell && !isExempt[from];
        
        if (shouldTakeFee && amount > 0) {
            // Calculate fees
            uint256 sweeperFee = (amount * SWEEPER_FEE) / FEE_DENOMINATOR;
            uint256 rewardsFee = (amount * REWARDS_FEE) / FEE_DENOMINATOR;
            uint256 devFee = (amount * DEV_FEE) / FEE_DENOMINATOR;
            uint256 totalFees = sweeperFee + rewardsFee + devFee;
            
            // Transfer fees to recipients
            super._update(from, sweeper, sweeperFee);
            super._update(from, rewards, rewardsFee);
            super._update(from, devFund, devFee);
            
            // Transfer remaining to recipient
            super._update(from, to, amount - totalFees);
            
            emit FeeCollected(from, sweeperFee, rewardsFee, devFee);
        } else {
            // No fee - normal transfer
            super._update(from, to, amount);
        }
    }
    
    /**
     * @notice Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
