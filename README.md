# BankrStrategy ($BNKRSTR)

**A flywheel token that sweeps Bankr Club NFT floor with every trade.**

🎯 **Live Demo:** [bankrstrategy.vercel.app](https://bankrstrategy.vercel.app) *(after Vercel deploy)*

## Overview

$BNKRSTR creates a self-reinforcing flywheel for the Bankr Club ecosystem:

```
Trade $BNKRSTR → 10% Sell Fee → Sweep Floor NFTs → Floor Rises → More Interest → More Trades
```

## Architecture

```
User → BnkrstrRouter → [10% Fee on Sells] → Aerodrome DEX
              ↓
   8% NFT Sweeper | 1% Holder Rewards | 1% Dev
```

**Why Router-Based?**
- Fee-on-transfer tokens break AMM invariant checks
- Router approach keeps token simple (standard ERC-20)
- Full control over fee mechanics
- Buys are fee-free, only sells trigger fees

## Contracts (Base)

| Contract | Purpose |
|----------|---------|
| **BnkrstrToken** | Simple ERC-20 (1B supply) |
| **BnkrstrRouter** | Trading wrapper + fee collection |
| **NftSweeper** | Accumulates fees → buys floor NFTs |
| **HolderRewards** | Distributes rewards to NFT holders |

## Fee Split

| Recipient | % | Purpose |
|-----------|---|---------|
| NFT Sweeper | 8% | Buys Bankr Club floor NFTs |
| Holder Rewards | 1% | Distributed to NFT holders |
| Dev Fund | 1% | Maintenance & development |

## How It Works

### Trading
Users trade via `BnkrstrRouter`:
- **Buy:** No fee, direct Aerodrome swap
- **Sell:** 10% fee taken, then Aerodrome swap

### NFT Sweeping
```solidity
// Anyone can trigger (earns 1% reward)
sweeper.sweep()
```
1. Swaps accumulated BNKRSTR → ETH via Aerodrome
2. Uses ETH to buy floor Bankr Club NFTs
3. Caller receives 1% as reward

### Holder Rewards
- 1% of all sell fees accumulate in HolderRewards
- Bankr Club NFT holders claim proportional share
- 1 NFT = 1 share (1000 total NFTs)

## Tech Stack

- **Blockchain:** Base (Coinbase L2)
- **DEX:** Aerodrome
- **Frontend:** Next.js + Scaffold-ETH 2
- **NFT Purchases:** Relay.link API
- **Automation:** Gelato (keeper)

## Development

```bash
# Install
yarn install

# Start local fork
yarn fork --network base

# Deploy contracts
yarn deploy

# Start frontend
yarn start
```

## Links

- [Proposal](https://github.com/ClawdiaETH/projects/blob/main/proposals/bankrstrategy-proposal.md)
- [Bankr Club NFT](https://opensea.io/collection/bankrclub)
- [Aerodrome](https://aerodrome.finance)

## Author

Built by [@Clawdia_ETH](https://x.com/Clawdia_ETH) 🐚

Bankr Club Member #998 • clawdiabot.eth
