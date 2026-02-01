# BankrStrategy Deployment - Base Mainnet

## ⚠️ V2 IS LIVE (V1 DEPRECATED)

V1 had a bug: fees only worked through router, not Aerodrome.
V2 uses fee-on-transfer: 10% on ALL sells via Aerodrome.

---

## V2 Contract Addresses (CURRENT)

**Deployed:** 2026-02-01 ~10:50 CST

| Contract | Address |
|----------|---------|
| **$BNKRSTR Token** | [`0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A`](https://basescan.org/token/0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A) |
| **NFT Sweeper** | [`0xB05600dd636B419E2F55A819d76CD783eE46bb8A`](https://basescan.org/address/0xB05600dd636B419E2F55A819d76CD783eE46bb8A) |
| **Holder Rewards** | [`0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9`](https://basescan.org/address/0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9) |
| **Aerodrome Pool** | [`0xdd2E1CF351D510b0aBA571b65878785126E936d3`](https://basescan.org/address/0xdd2E1CF351D510b0aBA571b65878785126E936d3) |

## Links

- **Trade:** https://aerodrome.finance/swap?from=eth&to=0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A
- **Chart:** https://dexscreener.com/base/0xdd2E1CF351D510b0aBA571b65878785126E936d3
- **Token:** https://basescan.org/token/0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A

## Fee Structure (V2)

| Recipient | % | Purpose |
|-----------|---|---------|
| NFT Sweeper | 8% | Accumulates → buys Bankr Club floor |
| Holder Rewards | 1% | Distributed to Bankr Club NFT holders |
| Dev Fund | 1% | Maintenance & development |
| **Total Sell Fee** | **10%** | |

**IMPORTANT:** 
- Fees apply on SELLS only (transfers TO the LP pool)
- Buys and wallet-to-wallet transfers are FREE
- Uses Aerodrome's `SupportingFeeOnTransferTokens` swap functions

## Token Distribution

| Allocation | Amount | % |
|------------|--------|---|
| Liquidity Pool | 400,000,000 | 40% |
| Treasury (Dev) | 600,000,000 | 60% |
| **Total Supply** | **1,000,000,000** | 100% |

---

## V1 (DEPRECATED - DO NOT USE)

| Contract | Address | Status |
|----------|---------|--------|
| Token | `0x28868d6cfc5C7309a31a8f6D354f8C9A939493A1` | ❌ DEPRECATED |
| Pool | `0x6db955a067a8cff457617c6c779367d77a9bd8b9` | ❌ DEPRECATED |
| Router | `0xf0F8DdE04f5483AF871445d5a6e01022a6714301` | ❌ DEPRECATED |

V1 Bug: Fees only captured via Router, not direct Aerodrome trades.
$73K volume, $0 fees captured.

---

## NFT Purchase Announcement Format

When sweeper buys a Bankr Club NFT:

```
$BNKRSTR has purchased Bankr Club #XXX for X.XXΞ

BankrStrategy is currently holding X Bankr Club NFTs bought for a total of X.XXΞ
```

+ Attach image of the NFT purchased

---

*Built by @Clawdia_ETH 🐚*
