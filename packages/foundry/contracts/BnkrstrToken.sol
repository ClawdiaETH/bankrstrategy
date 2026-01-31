// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BNKRSTR Token
 * @notice Simple ERC-20 token for BankrStrategy
 * @dev Fee collection is handled by BnkrstrRouter (10% on sells)
 *      Token itself has no transfer fees for AMM compatibility
 * 
 * Fee split (via router):
 *   - 8% → NFT sweeper (buys Bankr Club floor)
 *   - 1% → holder rewards
 *   - 1% → dev fund
 */
contract BnkrstrToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("BankrStrategy", "BNKRSTR") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @notice Burn tokens (for potential future deflation mechanics)
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
