# BankrStrategy V2 Deployment

**Deployed:** 2026-02-01 on Base Mainnet

## Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| **$BNKRSTR Token** | `0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A` | Fee-on-transfer ERC20 (10% sell fee) |
| **NftSweeper** | `0xB05600dd636B419E2F55A819d76CD783eE46bb8A` | Accumulates fees, swaps to ETH for NFT purchases |
| **HolderRewards** | `0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9` | Distributes 1% to Bankr Club holders |
| **Aerodrome Pool** | `0xdd2E1CF351D510b0aBA571b65878785126E936d3` | BNKRSTR/WETH volatile pool |

## Links

- **Trade:** https://aerodrome.finance/swap?from=eth&to=0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A
- **Chart:** https://dexscreener.com/base/0xdd2E1CF351D510b0aBA571b65878785126E936d3
- **Token:** https://basescan.org/token/0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A
- **Sweeper:** https://basescan.org/address/0xB05600dd636B419E2F55A819d76CD783eE46bb8A

## V1 (DEPRECATED)

**DO NOT USE - Fee mechanism was broken**

| Contract | Address | Status |
|----------|---------|--------|
| ~~BnkrstrToken V1~~ | `0x28868d6cfc5C7309a31a8f6D354f8C9A939493A1` | ❌ DEPRECATED |
| ~~BnkrstrRouter~~ | `0xec2f1b461af2Ae0fE7D0BC90E5A4a8b51e85CD79` | ❌ DEPRECATED |
| ~~V1 Pool~~ | `0x6db955a067a8cff457617c6c779367d77a9bd8b9` | ❌ DEPRECATED |

## How It Works

1. User sells BNKRSTR on Aerodrome (using `swapExactTokensForTokensSupportingFeeOnTransferTokens`)
2. Token automatically takes 10% fee
3. Fee split: 8% to Sweeper, 1% to Rewards, 1% to Dev
4. Anyone can call `sweep()` on Sweeper to convert accumulated tokens to ETH (gets 1% reward)
5. Owner uses accumulated ETH to buy Bankr Club floor NFTs

## First Sweep

- **Date:** 2026-02-01
- **Tokens swept:** 33.1M BNKRSTR
- **ETH received:** 0.039 ETH (~$115)
- **Ready for:** Bankr Club floor purchases

## Technical Notes

- Token is excluded from fees for Sweeper address (exempt mapping)
- Uses Aerodrome router with SupportingFeeOnTransferTokens functions
- Pool created with minimal liquidity (0.001 ETH + 1M tokens)
- No burns, no max wallet, simple fee-on-transfer

## Author

Built by [@Clawdia_ETH](https://x.com/Clawdia_ETH) 🐚 | Bankr Club #998
