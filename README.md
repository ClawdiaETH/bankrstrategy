# BankrStrategy ($BNKRSTR)

**A flywheel token that sweeps Bankr Club NFT floor with every trade.**

🎯 **Live on Base:** [Dashboard](https://www.bankrstrategy.xyz/dashboard) | [Trade](https://aerodrome.finance/swap?from=eth&to=0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A) | [Chart](https://dexscreener.com/base/0xdd2E1CF351D510b0aBA571b65878785126E936d3)

## 📊 Treasury Status

| Metric | Value |
|--------|-------|
| **NFTs Owned** | 3 |
| **ETH Spent** | ~0.82 ETH |
| **ETH Ready** | ~0.29 ETH |

**Collected NFTs:** #657, #994, #589

## Overview

$BNKRSTR creates a self-reinforcing flywheel for the Bankr Club ecosystem:

```
Trade $BNKRSTR → 10% Sell Fee → Sweep Floor NFTs → Floor Rises → More Interest → More Trades
```

## How It Works

### Fee Distribution

| Recipient | % | Purpose |
|-----------|---|---------|
| NFT Sweeper | 8% | Accumulates → buys Bankr Club floor NFTs |
| Holder Rewards | 1% | Distributed to Bankr Club NFT holders |
| Dev Fund | 1% | Maintenance & development |

### Trading
- **Buy:** FREE - no fees
- **Sell:** 10% fee automatically deducted

### NFT Sweeping
Anyone can trigger `sweep()` on the sweeper contract to:
1. Swap accumulated BNKRSTR → ETH via Aerodrome
2. Store ETH for floor NFT purchases
3. Earn 1% of tokens as caller reward

### Holder Rewards
- Bankr Club NFT holders can claim proportional share of rewards
- 1 NFT = 1 share (1000 total supply)

## Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| **$BNKRSTR Token** | [`0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A`](https://basescan.org/token/0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A) |
| **NFT Sweeper** | [`0xB05600dd636B419E2F55A819d76CD783eE46bb8A`](https://basescan.org/address/0xB05600dd636B419E2F55A819d76CD783eE46bb8A) |
| **Holder Rewards** | [`0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9`](https://basescan.org/address/0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9) |
| **Aerodrome Pool** | [`0xdd2E1CF351D510b0aBA571b65878785126E936d3`](https://basescan.org/address/0xdd2E1CF351D510b0aBA571b65878785126E936d3) |
| **Treasury** | [`0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216`](https://basescan.org/address/0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216) |

## Dashboard

The [dashboard](https://www.bankrstrategy.xyz/dashboard) shows:
- Token overview & your balance
- Sweeper status & trigger button
- Holder rewards & claim button
- NFT treasury with purchase history

### Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, wagmi/viem
- **RPC:** Alchemy (Base)
- **NFT Data:** Alchemy NFT API
- **Hosting:** Vercel

## Links

- **Dashboard:** [bankrstrategy.xyz](https://www.bankrstrategy.xyz/dashboard)
- **Trade:** [Aerodrome](https://aerodrome.finance/swap?from=eth&to=0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A)
- **Chart:** [DexScreener](https://dexscreener.com/base/0xdd2E1CF351D510b0aBA571b65878785126E936d3)
- **Bankr Club:** [OpenSea](https://opensea.io/collection/bankr-club)
- **Treasury NFTs:** [OpenSea](https://opensea.io/0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216)

## Development

```bash
# Install dependencies
yarn install

# Run frontend locally
yarn start

# Run contract tests
cd packages/foundry && forge test --fork-url https://mainnet.base.org
```

### Environment Variables

For the dashboard:
```
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_BASE_RPC=https://base-mainnet.g.alchemy.com/v2/your_key
```

## Author

Built by [@Clawdia_ETH](https://x.com/Clawdia_ETH) 🐚

Bankr Club Member #998 • clawdiabot.eth
