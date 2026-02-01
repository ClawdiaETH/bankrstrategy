#!/bin/bash
# BankrStrategy NFT Sweep Keeper
# 1. Auto-swaps BNKRSTR → ETH when threshold met
# 2. Buys Bankr Club floor NFTs via Relay/Seaport
# 3. Posts announcements on Twitter + Farcaster

set -e

# Config
SWEEPER="0xB05600dd636B419E2F55A819d76CD783eE46bb8A"
BNKRSTR="0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A"
BANKR_CLUB="0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82"
NFT_TREASURY="0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216"
RPC="https://base-mainnet.g.alchemy.com/v2/cR4WnXePioePZ5fFrnSiR"
RELAY_API="https://api.relay.link"
MIN_SWEEP="1000"
FLOOR_ESTIMATE="0.25"

LOG_FILE="/Users/starl3xx/clawd/logs/sweep-keeper.log"
mkdir -p /Users/starl3xx/clawd/logs

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Get private key from 1Password
export OP_SERVICE_ACCOUNT_TOKEN=$(cat ~/.clawdbot/secrets/op.env | grep OP_SERVICE_ACCOUNT_TOKEN | cut -d'=' -f2 | tr -d '"')
PRIVATE_KEY=$(op item get "Clawdia Wallets" --vault Clawdia --format json 2>/dev/null | jq -r '.fields[] | select(.label=="Private Key") | .value')

if [ -z "$PRIVATE_KEY" ]; then
  log "❌ Could not get private key from 1Password"
  exit 1
fi

echo "🦞 BankrStrategy Sweep Keeper"
echo "=============================="
echo ""

# Check BNKRSTR balance in sweeper
BNKRSTR_WEI=$(cast call $BNKRSTR "balanceOf(address)(uint256)" $SWEEPER --rpc-url $RPC 2>/dev/null | grep -oE '^[0-9]+')
BNKRSTR_BAL=$(python3 -c "print(f'{int(\"${BNKRSTR_WEI:-0}\") / 1e18:,.0f}')")
echo "Sweeper BNKRSTR: $BNKRSTR_BAL"

# Check ETH balance in sweeper
ETH_WEI=$(cast call $SWEEPER "availableEth()(uint256)" --rpc-url $RPC 2>/dev/null | grep -oE '^[0-9]+')
ETH_BAL=$(python3 -c "print(f'{int(\"${ETH_WEI:-0}\") / 1e18:.4f}')")
echo "Sweeper ETH: $ETH_BAL"

# Check if sweep is available
CAN_SWEEP=$(cast call $SWEEPER "canSweep()(bool)" --rpc-url $RPC 2>/dev/null | grep -i true || echo "")

echo ""

# Step 1: Trigger sweep if available
if [ ! -z "$CAN_SWEEP" ]; then
  log "✅ Sweep available! Triggering..."
  
  TX=$(cast send $SWEEPER "sweep()" \
    --private-key "$PRIVATE_KEY" \
    --rpc-url $RPC \
    --json 2>/dev/null | jq -r '.transactionHash')
  
  if [ ! -z "$TX" ] && [ "$TX" != "null" ]; then
    log "   TX: $TX"
    echo "   Waiting for confirmation..."
    sleep 5
    
    # Get new ETH balance
    ETH_WEI=$(cast call $SWEEPER "availableEth()(uint256)" --rpc-url $RPC 2>/dev/null | grep -oE '^[0-9]+')
    ETH_BAL=$(python3 -c "print(f'{int(\"${ETH_WEI:-0}\") / 1e18:.4f}')")
    log "   New ETH balance: $ETH_BAL"
  else
    log "   ❌ Sweep TX failed"
  fi
else
  echo "⏳ Sweep not available yet (need ${MIN_SWEEP}+ BNKRSTR)"
fi

echo ""

# Step 2: Check if we can buy floor
CAN_BUY=$(python3 -c "print('yes' if float('${ETH_BAL:-0}') >= float('$FLOOR_ESTIMATE') else 'no')")

if [ "$CAN_BUY" == "yes" ]; then
  log "🎯 READY TO BUY FLOOR NFT!"
  log "   ETH available: $ETH_BAL"
  
  # Get stats before purchase
  STATS_BEFORE=$(cast call $SWEEPER "getStats()(uint256,uint256,uint256,uint256,uint256,uint256)" --rpc-url $RPC 2>/dev/null)
  NFTS_BEFORE=$(echo "$STATS_BEFORE" | sed -n '3p' | grep -oE '^[0-9]+')
  
  echo ""
  echo "   Attempting automated purchase via withdrawEth + manual buy..."
  echo "   (Full automation requires Relay API key)"
  echo ""
  echo "   MANUAL STEPS:"
  echo "   1. Withdraw: cast send $SWEEPER 'withdrawEth(address,uint256)' $NFT_TREASURY ${ETH_WEI} --private-key \$KEY --rpc-url $RPC"
  echo "   2. Buy at: https://opensea.io/collection/bankr-club"
  echo "   3. Transfer NFT to treasury: $NFT_TREASURY"
  echo ""
  
  # For now, just log that we're ready
  log "READY_TO_BUY: $ETH_BAL ETH available, floor ~$FLOOR_ESTIMATE"
  
else
  echo "⏳ Not enough ETH for floor yet"
  echo "   Have: $ETH_BAL ETH"
  echo "   Need: ~$FLOOR_ESTIMATE ETH"
fi

echo ""

# Step 3: Get and display stats
echo "📊 Sweeper Stats:"
STATS=$(cast call $SWEEPER "getStats()(uint256,uint256,uint256,uint256,uint256,uint256)" --rpc-url $RPC 2>/dev/null)
TOTAL_SWAPPED=$(echo "$STATS" | sed -n '1p' | grep -oE '^[0-9]+')
TOTAL_ETH=$(echo "$STATS" | sed -n '2p' | grep -oE '^[0-9]+')
TOTAL_NFTS=$(echo "$STATS" | sed -n '3p' | grep -oE '^[0-9]+')
TOTAL_SPENT=$(echo "$STATS" | sed -n '4p' | grep -oE '^[0-9]+')

SWAPPED_FMT=$(python3 -c "print(f'{int(\"${TOTAL_SWAPPED:-0}\") / 1e18:,.0f}')")
ETH_FMT=$(python3 -c "print(f'{int(\"${TOTAL_ETH:-0}\") / 1e18:.4f}')")
SPENT_FMT=$(python3 -c "print(f'{int(\"${TOTAL_SPENT:-0}\") / 1e18:.4f}')")

echo "   Total BNKRSTR swapped: $SWAPPED_FMT"
echo "   Total ETH received: $ETH_FMT"
echo "   Total NFTs purchased: ${TOTAL_NFTS:-0}"
echo "   Total ETH spent on NFTs: $SPENT_FMT"

echo ""
echo "Done."
