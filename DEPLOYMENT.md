# BankrStrategy Deployment

**Deployed:** February 1, 2026 on Base Mainnet

## Contracts

| Contract | Address | Verified |
|----------|---------|----------|
| **$BNKRSTR Token** | [`0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A`](https://basescan.org/token/0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A) | ✅ |
| **NFT Sweeper** | [`0xB05600dd636B419E2F55A819d76CD783eE46bb8A`](https://basescan.org/address/0xB05600dd636B419E2F55A819d76CD783eE46bb8A) | ✅ |
| **Holder Rewards** | [`0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9`](https://basescan.org/address/0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9) | ✅ |
| **Aerodrome Pool** | [`0xdd2E1CF351D510b0aBA571b65878785126E936d3`](https://basescan.org/address/0xdd2E1CF351D510b0aBA571b65878785126E936d3) | — |
| **Treasury** | [`0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216`](https://basescan.org/address/0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216) | — |

## Treasury Holdings

| NFT | Token ID | Purchase Price | Date |
|-----|----------|----------------|------|
| Bankr Club #657 | 657 | 0.28 ETH | Feb 2, 2026 |
| Bankr Club #994 | 994 | 0.28 ETH | Feb 1, 2026 |
| Bankr Club #589 | 589 | 0.25 ETH | Feb 1, 2026 |

**Total NFTs:** 3  
**Total ETH Spent:** ~0.82 ETH  
**ETH Ready:** ~0.29 ETH

## Frontend Deployment

**URL:** https://www.bankrstrategy.xyz  
**Platform:** Vercel  
**Repository:** https://github.com/ClawdiaETH/bankrstrategy

### Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Alchemy API key for RPC & NFT API |
| `NEXT_PUBLIC_BASE_RPC` | Base mainnet RPC URL |
| `NEXT_PUBLIC_OPENSEA_KEY` | OpenSea API key (optional) |
| `EDGE_CONFIG` | Vercel Edge Config connection string |
| `EDGE_CONFIG_TOKEN` | Vercel API token for Edge Config writes |

## Architecture

```
User trades on Aerodrome
         ↓
Token takes 10% fee on sells
         ↓
    8% → NFT Sweeper
    1% → Holder Rewards  
    1% → Dev Fund
         ↓
sweep() called → BNKRSTR → ETH
         ↓
purchaseNft() → Buy floor Bankr Club NFT
         ↓
NFT sent to Treasury
```

## Sweep History

| Date | Tokens Swept | ETH Received | NFT Purchased |
|------|--------------|--------------|---------------|
| Feb 2, 2026 | — | — | #657 (0.28 ETH) |
| Feb 1, 2026 | 77.8M | 0.76 ETH | #994 (0.28 ETH) |
| Feb 1, 2026 | — | — | #589 (0.25 ETH) |

## V1 (DEPRECATED)

⚠️ **DO NOT USE** - V1 had a broken fee mechanism

| Contract | Address | Status |
|----------|---------|--------|
| ~~Token V1~~ | `0x28868d6cfc5C7309a31a8f6D354f8C9A939493A1` | ❌ DEPRECATED |
| ~~Router~~ | `0xec2f1b461af2Ae0fE7D0BC90E5A4a8b51e85CD79` | ❌ DEPRECATED |
| ~~Pool V1~~ | `0x6db955a067a8cff457617c6c779367d77a9bd8b9` | ❌ DEPRECATED |
| ~~Sweeper V1~~ | `0xAAAB525b6C33C33DaA2dCcb840FCa8d5209CB1b1` | ❌ DEPRECATED |

## Links

- **Dashboard:** https://www.bankrstrategy.xyz/dashboard
- **Trade:** https://aerodrome.finance/swap?from=eth&to=0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A
- **Chart:** https://dexscreener.com/base/0xdd2E1CF351D510b0aBA571b65878785126E936d3
- **Token:** https://basescan.org/token/0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A
- **Treasury NFTs:** https://opensea.io/0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216

## Author

Built by [@Clawdia_ETH](https://x.com/Clawdia_ETH) 🐚
