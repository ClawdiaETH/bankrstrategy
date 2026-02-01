// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

interface INftSweeper {
    function purchaseNft(
        uint256 tokenId,
        uint256 maxPrice,
        address marketplace,
        bytes calldata data
    ) external;
    function owner() external view returns (address);
}

interface ISeaport {
    struct AdvancedOrder {
        OrderParameters parameters;
        uint120 numerator;
        uint120 denominator;
        bytes signature;
        bytes extraData;
    }
    
    struct OrderParameters {
        address offerer;
        address zone;
        OfferItem[] offer;
        ConsiderationItem[] consideration;
        uint8 orderType;
        uint256 startTime;
        uint256 endTime;
        bytes32 zoneHash;
        uint256 salt;
        bytes32 conduitKey;
        uint256 totalOriginalConsiderationItems;
    }
    
    struct OfferItem {
        uint8 itemType;
        address token;
        uint256 identifierOrCriteria;
        uint256 startAmount;
        uint256 endAmount;
    }
    
    struct ConsiderationItem {
        uint8 itemType;
        address token;
        uint256 identifierOrCriteria;
        uint256 startAmount;
        uint256 endAmount;
        address recipient;
    }
    
    struct CriteriaResolver {
        uint256 orderIndex;
        uint8 side;
        uint256 index;
        uint256 identifier;
        bytes32[] criteriaProof;
    }
    
    function fulfillAdvancedOrder(
        AdvancedOrder calldata advancedOrder,
        CriteriaResolver[] calldata criteriaResolvers,
        bytes32 fulfillerConduitKey,
        address recipient
    ) external payable returns (bool fulfilled);
}

contract BuyFloorNFTScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        INftSweeper sweeper = INftSweeper(0xAAAB525b6C33C33DaA2dCcb840FCa8d5209CB1b1);
        address seaport = 0x0000000000000068F116a894984e2DB1123eB395;
        
        console.log("Sweeper owner:", sweeper.owner());
        
        // Build the order parameters
        ISeaport.OfferItem[] memory offer = new ISeaport.OfferItem[](1);
        offer[0] = ISeaport.OfferItem({
            itemType: 2, // ERC721
            token: 0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82,
            identifierOrCriteria: 994,
            startAmount: 1,
            endAmount: 1
        });
        
        ISeaport.ConsiderationItem[] memory consideration = new ISeaport.ConsiderationItem[](2);
        consideration[0] = ISeaport.ConsiderationItem({
            itemType: 0, // ETH
            token: address(0),
            identifierOrCriteria: 0,
            startAmount: 273964977000000000,
            endAmount: 273964977000000000,
            recipient: 0x3bC079Dc5a8860F030b55f93aB0CAD859A529798
        });
        consideration[1] = ISeaport.ConsiderationItem({
            itemType: 0,
            token: address(0),
            identifierOrCriteria: 0,
            startAmount: 2767323000000000,
            endAmount: 2767323000000000,
            recipient: 0x0000a26b00c1F0DF003000390027140000fAa719
        });
        
        ISeaport.OrderParameters memory params = ISeaport.OrderParameters({
            offerer: 0x3bC079Dc5a8860F030b55f93aB0CAD859A529798,
            zone: 0x000056F7000000EcE9003ca63978907a00FFD100,
            offer: offer,
            consideration: consideration,
            orderType: 2,
            startTime: 1769980058,
            endTime: 1769980708,
            zoneHash: bytes32(0),
            salt: 24446860302761739304752683030156737591518664810215442929817124116168357965818,
            conduitKey: 0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000,
            totalOriginalConsiderationItems: 2
        });
        
        ISeaport.AdvancedOrder memory advancedOrder = ISeaport.AdvancedOrder({
            parameters: params,
            numerator: 1,
            denominator: 1,
            signature: hex"ba5a5069845ef9d0172a4e155aa0143b3c77a2d3a963622c5c4af073c600f78c23fabd22326f2ffba212c217dc747b59a1ca247ca7c73b1a542b9dc9c557d3f81c",
            extraData: hex"00aaab525b6c33c33daa2dccb840fca8d5209cb1b100000000697fc1e8bb751f29989a92bed8b033b10ce3d9ce49a3c234d32f9a304bcc0dd57b736767546e836e05ad408b4cccf75e929dc14ff60ce55716bfd53c0897edea52c57c61000000000000000000000000000000000000000000000000000000000000000000"
        });
        
        ISeaport.CriteriaResolver[] memory resolvers = new ISeaport.CriteriaResolver[](0);
        bytes32 fulfillerConduitKey = 0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000;
        
        // Encode the Seaport call
        bytes memory seaportCalldata = abi.encodeCall(
            ISeaport.fulfillAdvancedOrder,
            (advancedOrder, resolvers, fulfillerConduitKey, address(sweeper))
        );
        
        console.log("Calldata length:", seaportCalldata.length);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Call purchaseNft on sweeper
        sweeper.purchaseNft(
            994,
            276732300000000000, // 0.277 ETH
            seaport,
            seaportCalldata
        );
        
        console.log("Purchase executed!");
        
        vm.stopBroadcast();
    }
}
