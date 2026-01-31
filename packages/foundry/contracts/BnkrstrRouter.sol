// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAerodrome.sol";

/**
 * @title BnkrstrRouter
 * @notice Router wrapper that takes 10% fee on sells, then routes to Aerodrome
 * @dev Fee split: 8% sweeper, 1% rewards, 1% dev
 * 
 * Why this approach?
 * - Fee-on-transfer tokens break AMM K invariant checks
 * - Router wrapper keeps token simple (no transfer fees)
 * - Full control over fee mechanics without DEX conflicts
 */
contract BnkrstrRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Fee configuration (basis points)
    uint256 public constant TOTAL_FEE_BPS = 1000;  // 10%
    uint256 public constant SWEEP_FEE_BPS = 800;   // 8%
    uint256 public constant REWARDS_FEE_BPS = 100; // 1%
    uint256 public constant DEV_FEE_BPS = 100;     // 1%
    
    // Addresses
    IERC20 public immutable bnkrstr;
    address public immutable weth;
    IAerodromeRouter public immutable aeroRouter;
    address public immutable aeroFactory;
    
    // Fee recipients
    address public sweepFund;
    address public rewardsFund;
    address public devFund;
    
    // Events
    event SellWithFee(
        address indexed seller,
        uint256 amountIn,
        uint256 feeAmount,
        uint256 amountOut
    );
    event BuyExecuted(
        address indexed buyer,
        uint256 ethIn,
        uint256 tokensOut
    );
    event FeesCollected(uint256 sweep, uint256 rewards, uint256 dev);
    event FundsUpdated(address sweep, address rewards, address dev);
    
    constructor(
        address _bnkrstr,
        address _weth,
        address _aeroRouter,
        address _aeroFactory,
        address _sweepFund,
        address _rewardsFund,
        address _devFund
    ) Ownable(msg.sender) {
        bnkrstr = IERC20(_bnkrstr);
        weth = _weth;
        aeroRouter = IAerodromeRouter(_aeroRouter);
        aeroFactory = _aeroFactory;
        sweepFund = _sweepFund;
        rewardsFund = _rewardsFund;
        devFund = _devFund;
    }
    
    /**
     * @notice Buy BNKRSTR with ETH (no fee on buys)
     * @param amountOutMin Minimum tokens to receive
     * @param deadline Transaction deadline
     */
    function buyWithETH(
        uint256 amountOutMin,
        uint256 deadline
    ) external payable nonReentrant returns (uint256 tokensOut) {
        require(msg.value > 0, "No ETH sent");
        
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
        routes[0] = IAerodromeRouter.Route({
            from: weth,
            to: address(bnkrstr),
            stable: false,
            factory: aeroFactory
        });
        
        uint256[] memory amounts = aeroRouter.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            routes,
            msg.sender,
            deadline
        );
        
        tokensOut = amounts[amounts.length - 1];
        emit BuyExecuted(msg.sender, msg.value, tokensOut);
    }
    
    /**
     * @notice Sell BNKRSTR for ETH with 10% fee
     * @param amountIn Amount of BNKRSTR to sell
     * @param amountOutMin Minimum ETH to receive (after fee)
     * @param deadline Transaction deadline
     */
    function sellForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant returns (uint256 ethOut) {
        require(amountIn > 0, "Zero amount");
        
        // Transfer tokens from user
        bnkrstr.safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Calculate and distribute fees
        uint256 feeAmount = (amountIn * TOTAL_FEE_BPS) / 10000;
        uint256 sweepAmount = (amountIn * SWEEP_FEE_BPS) / 10000;
        uint256 rewardsAmount = (amountIn * REWARDS_FEE_BPS) / 10000;
        uint256 devAmount = feeAmount - sweepAmount - rewardsAmount;
        
        bnkrstr.safeTransfer(sweepFund, sweepAmount);
        bnkrstr.safeTransfer(rewardsFund, rewardsAmount);
        bnkrstr.safeTransfer(devFund, devAmount);
        
        emit FeesCollected(sweepAmount, rewardsAmount, devAmount);
        
        // Swap remaining 90% via Aerodrome
        uint256 swapAmount = amountIn - feeAmount;
        bnkrstr.approve(address(aeroRouter), swapAmount);
        
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
        routes[0] = IAerodromeRouter.Route({
            from: address(bnkrstr),
            to: weth,
            stable: false,
            factory: aeroFactory
        });
        
        uint256[] memory amounts = aeroRouter.swapExactTokensForETH(
            swapAmount,
            amountOutMin,
            routes,
            msg.sender,
            deadline
        );
        
        ethOut = amounts[amounts.length - 1];
        emit SellWithFee(msg.sender, amountIn, feeAmount, ethOut);
    }
    
    /**
     * @notice Get quote for selling BNKRSTR (accounts for 10% fee)
     * @param amountIn Amount of BNKRSTR to sell
     * @return amountOut ETH you'd receive after fee
     * @return feeAmount Fee that will be taken
     */
    function getQuoteSell(uint256 amountIn) external view returns (
        uint256 amountOut,
        uint256 feeAmount
    ) {
        feeAmount = (amountIn * TOTAL_FEE_BPS) / 10000;
        uint256 swapAmount = amountIn - feeAmount;
        
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
        routes[0] = IAerodromeRouter.Route({
            from: address(bnkrstr),
            to: weth,
            stable: false,
            factory: aeroFactory
        });
        
        uint256[] memory amounts = aeroRouter.getAmountsOut(swapAmount, routes);
        amountOut = amounts[amounts.length - 1];
    }
    
    /**
     * @notice Get quote for buying BNKRSTR (no fee on buys)
     * @param ethAmount ETH to spend
     * @return tokensOut BNKRSTR you'd receive
     */
    function getQuoteBuy(uint256 ethAmount) external view returns (uint256 tokensOut) {
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
        routes[0] = IAerodromeRouter.Route({
            from: weth,
            to: address(bnkrstr),
            stable: false,
            factory: aeroFactory
        });
        
        uint256[] memory amounts = aeroRouter.getAmountsOut(ethAmount, routes);
        tokensOut = amounts[amounts.length - 1];
    }
    
    // Admin functions
    
    function setFunds(address _sweep, address _rewards, address _dev) external onlyOwner {
        sweepFund = _sweep;
        rewardsFund = _rewards;
        devFund = _dev;
        emit FundsUpdated(_sweep, _rewards, _dev);
    }
    
    // Receive ETH from Aerodrome swaps
    receive() external payable {}
}
