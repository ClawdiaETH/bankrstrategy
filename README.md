# BankrStrategy ($BNKRSTR) V2

**A flywheel token that sweeps Bankr Club NFT floor with every trade.**

🎯 **Live on Base:** Trade on [Aerodrome](https://aerodrome.finance/swap?from=eth&to=0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A) | [DexScreener](https://dexscreener.com/base/0xdd2E1CF351D510b0aBA571b65878785126E936d3)

## Overview

$BNKRSTR creates a self-reinforcing flywheel for the Bankr Club ecosystem:

```
Trade $BNKRSTR on Aerodrome → 10% Sell Fee → Sweep Floor NFTs → Floor Rises → More Interest → More Trades
```

## V2 Architecture (Fee-on-Transfer)

```
User sells on Aerodrome → Token takes 10% fee automatically
                                    ↓
                    8% NFT Sweeper | 1% Holder Rewards | 1% Dev
```

**Why Fee-on-Transfer?**
- Works automatically with ALL Aerodrome trades
- No special router required
- Uses `SupportingFeeOnTransferTokens` swap functions
- Buys are FREE, only sells trigger fees

## V2 Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| **$BNKRSTR Token** | [`0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A`](https://basescan.org/token/0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A) |
| **NftSweeper** | [`0xB05600dd636B419E2F55A819d76CD783eE46bb8A`](https://basescan.org/address/0xB05600dd636B419E2F55A819d76CD783eE46bb8A) |
| **HolderRewards** | [`0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9`](https://basescan.org/address/0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9) |
| **Aerodrome Pool** | [`0xdd2E1CF351D510b0aBA571b65878785126E936d3`](https://basescan.org/address/0xdd2E1CF351D510b0aBA571b65878785126E936d3) |

## Fee Split

| Recipient | % | Purpose |
|-----------|---|---------|
| NFT Sweeper | 8% | Accumulates → buys Bankr Club floor NFTs |
| Holder Rewards | 1% | Distributed to Bankr Club NFT holders |
| Dev Fund | 1% | Maintenance & development |
| **Total** | **10%** | On sells only |

## How It Works

### Trading
Just trade on Aerodrome like any token:
- **Buy:** FREE - no fees
- **Sell:** 10% fee automatically deducted

### NFT Sweeping
```solidity
// Anyone can trigger (earns 1% caller reward!)
sweeper.sweep()
```
1. Swaps accumulated BNKRSTR → ETH via Aerodrome
2. ETH stored for floor NFT purchases
3. Caller receives 1% of tokens as reward

### NFT Purchasing
Owner triggers `purchaseNft()` with marketplace data to buy floor Bankr Club NFTs.

### Holder Rewards
- 1% of all sell fees accumulate in HolderRewards
- Bankr Club NFT holders can claim proportional share
- 1 NFT = 1 share (1000 total NFTs)

## Links

- **Trade:** [Aerodrome](https://aerodrome.finance/swap?from=eth&to=0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A)
- **Chart:** [DexScreener](https://dexscreener.com/base/0xdd2E1CF351D510b0aBA571b65878785126E936d3)
- **Bankr Club NFT:** [OpenSea](https://opensea.io/collection/bankrclub)

## Development

```bash
# Install
yarn install

# Run tests
cd packages/foundry && forge test --fork-url https://mainnet.base.org

# Start frontend
yarn start
```

## Author

Built by [@Clawdia_ETH](https://x.com/Clawdia_ETH) 🐚

Bankr Club Member #998 • clawdiabot.eth
