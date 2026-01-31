// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Mock Aerodrome Pool
 * @notice Simple AMM for testing fee mechanism
 * @dev x * y = k constant product formula
 */
contract MockAerodromePool is ERC20 {
    IERC20 public immutable token0; // BNKRSTR
    IERC20 public immutable token1; // WETH
    
    uint256 public reserve0;
    uint256 public reserve1;
    
    uint256 private constant MINIMUM_LIQUIDITY = 1000;
    
    event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out);
    event Mint(address indexed sender, uint256 amount0, uint256 amount1, uint256 liquidity);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, uint256 liquidity);
    
    constructor(address _token0, address _token1) ERC20("BNKRSTR-WETH LP", "BNKRSTR-LP") {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }
    
    /**
     * @notice Add liquidity
     */
    function addLiquidity(uint256 amount0, uint256 amount1) external returns (uint256 liquidity) {
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);
        
        uint256 totalSupply_ = totalSupply();
        if (totalSupply_ == 0) {
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0xdead), MINIMUM_LIQUIDITY); // Lock minimum liquidity
        } else {
            liquidity = min(
                (amount0 * totalSupply_) / reserve0,
                (amount1 * totalSupply_) / reserve1
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        _mint(msg.sender, liquidity);
        
        reserve0 += amount0;
        reserve1 += amount1;
        
        emit Mint(msg.sender, amount0, amount1, liquidity);
    }
    
    /**
     * @notice Swap token0 for token1
     */
    function swap0For1(uint256 amount0In) external returns (uint256 amount1Out) {
        require(amount0In > 0, "Insufficient input");
        require(reserve0 > 0 && reserve1 > 0, "No liquidity");
        
        // Transfer in
        token0.transferFrom(msg.sender, address(this), amount0In);
        
        // Calculate output (0.3% fee)
        uint256 amount0InWithFee = amount0In * 997;
        amount1Out = (amount0InWithFee * reserve1) / (reserve0 * 1000 + amount0InWithFee);
        
        require(amount1Out > 0, "Insufficient output");
        require(amount1Out < reserve1, "Insufficient reserve");
        
        // Transfer out
        token1.transfer(msg.sender, amount1Out);
        
        // Update reserves
        reserve0 += amount0In;
        reserve1 -= amount1Out;
        
        emit Swap(msg.sender, amount0In, 0, 0, amount1Out);
    }
    
    /**
     * @notice Swap token1 for token0
     */
    function swap1For0(uint256 amount1In) external returns (uint256 amount0Out) {
        require(amount1In > 0, "Insufficient input");
        require(reserve0 > 0 && reserve1 > 0, "No liquidity");
        
        // Transfer in
        token1.transferFrom(msg.sender, address(this), amount1In);
        
        // Calculate output (0.3% fee)
        uint256 amount1InWithFee = amount1In * 997;
        amount0Out = (amount1InWithFee * reserve0) / (reserve1 * 1000 + amount1InWithFee);
        
        require(amount0Out > 0, "Insufficient output");
        require(amount0Out < reserve0, "Insufficient reserve");
        
        // Transfer out
        token0.transfer(msg.sender, amount0Out);
        
        // Update reserves
        reserve1 += amount1In;
        reserve0 -= amount0Out;
        
        emit Swap(msg.sender, 0, amount1In, amount0Out, 0);
    }
    
    /**
     * @notice Get quote for token0 → token1
     */
    function getAmountOut(uint256 amount0In) external view returns (uint256) {
        if (reserve0 == 0 || reserve1 == 0) return 0;
        uint256 amount0InWithFee = amount0In * 997;
        return (amount0InWithFee * reserve1) / (reserve0 * 1000 + amount0InWithFee);
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
