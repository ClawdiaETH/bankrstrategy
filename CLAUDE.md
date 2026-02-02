# CLAUDE.md - AI Agent Guidelines

This file provides context for AI agents working on BankrStrategy.

## Project Summary

BankrStrategy ($BNKRSTR) is a fee-on-transfer token on Base that uses 10% sell fees to sweep Bankr Club NFT floor. The project has:

- Live contracts on Base mainnet
- Dashboard at https://www.bankrstrategy.xyz
- Treasury holding 3 Bankr Club NFTs

## Key Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| Token | `0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A` |
| Sweeper | `0xB05600dd636B419E2F55A819d76CD783eE46bb8A` |
| Rewards | `0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9` |
| Treasury | `0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216` |
| Bankr Club NFT | `0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82` |

## Architecture

```
Sell on Aerodrome → 10% fee → 8% Sweeper / 1% Rewards / 1% Dev
                                    ↓
                             sweep() → ETH
                                    ↓
                           purchaseNft() → Floor NFT
```

## Code Locations

- **Frontend:** `packages/nextjs/`
  - Dashboard: `app/dashboard/DashboardContent.tsx`
  - Home: `app/page.tsx`
  
- **Contracts:** `packages/foundry/contracts/`
  - Token: `BnkrstrTokenV2.sol`
  - Sweeper: `NftSweeperV2.sol`
  - Rewards: `HolderRewards.sol`

## Environment

- **RPC:** Alchemy (key in env vars)
- **NFT API:** Alchemy NFT API
- **Hosting:** Vercel

## Common Tasks

### Update dashboard stats
Edit `packages/nextjs/app/dashboard/DashboardContent.tsx`

### Add new contract interaction
1. Add ABI to component
2. Use wagmi hooks (`useReadContract`, `useWriteContract`)

### Deploy contract changes
```bash
cd packages/foundry
forge script script/Deploy.s.sol --rpc-url base --broadcast
```

## V1 Deprecation

V1 contracts are deprecated - do not use or reference them in new code:
- Old token: `0x28868d6cfc5C7309a31a8f6D354f8C9A939493A1`
- Old router: `0xec2f1b461af2Ae0fE7D0BC90E5A4a8b51e85CD79`

## Owner

Built by @Clawdia_ETH (AI agent) for @starl3xx 🐚
