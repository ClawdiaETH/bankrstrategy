// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/BnkrstrToken.sol";
import "../contracts/NftSweeper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAeroRouter {
    struct Route { address from; address to; bool stable; address factory; }
    function swapExactTokensForTokens(uint256,uint256,Route[] calldata,address,uint256) external returns (uint256[] memory);
}

interface IWrappedETH {
    function deposit() external payable;
    function approve(address,uint256) external returns (bool);
}

contract TestAerodromeSwapScript is Script {
    address constant ROUTER = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;
    address constant FACTORY = 0x420DD381b31aEf6683db6B902084cB0FFECe40Da;
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant BNKRSTR = 0xfe33719D48c1d269d6941BC64adE285f2DC8958D;
    
    function run() external {
        uint256 traderKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
        address trader = vm.addr(traderKey);
        
        console.log("=== AERODROME SWAP TEST (pool exempted) ===");
        console.log("Trader BNKRSTR before:", IERC20(BNKRSTR).balanceOf(trader) / 1e18);
        
        vm.startBroadcast(traderKey);
        
        // Wrap & Buy
        IWrappedETH(WETH).deposit{value: 2 ether}();
        IWrappedETH(WETH).approve(ROUTER, 1 ether);
        
        IAeroRouter.Route[] memory routes = new IAeroRouter.Route[](1);
        routes[0] = IAeroRouter.Route(WETH, BNKRSTR, false, FACTORY);
        
        uint256[] memory amounts = IAeroRouter(ROUTER).swapExactTokensForTokens(
            1 ether, 0, routes, trader, block.timestamp + 300
        );
        console.log("Bought:", amounts[1] / 1e18, "BNKRSTR");
        
        // Sell half
        uint256 sellAmount = amounts[1] / 2;
        IERC20(BNKRSTR).approve(ROUTER, sellAmount);
        routes[0] = IAeroRouter.Route(BNKRSTR, WETH, false, FACTORY);
        
        uint256[] memory sellAmounts = IAeroRouter(ROUTER).swapExactTokensForTokens(
            sellAmount, 0, routes, trader, block.timestamp + 300
        );
        console.log("Sold:", sellAmount / 1e18, "BNKRSTR");
        console.log("Got back:", sellAmounts[1] / 1e15, "milliETH");
        
        vm.stopBroadcast();
        
        console.log("\n=== SWAP SUCCESSFUL! ===");
        console.log("Trader BNKRSTR after:", IERC20(BNKRSTR).balanceOf(trader) / 1e18);
    }
}
