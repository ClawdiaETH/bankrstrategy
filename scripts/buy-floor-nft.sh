#!/bin/bash
# BankrStrategy: Buy Floor NFT and Announce
# Usage: ./buy-floor-nft.sh <token_id> <price_eth>

set -e

TOKEN_ID=$1
PRICE_ETH=$2

if [ -z "$TOKEN_ID" ] || [ -z "$PRICE_ETH" ]; then
  echo "Usage: ./buy-floor-nft.sh <token_id> <price_eth>"
  echo "Example: ./buy-floor-nft.sh 589 0.2481"
  exit 1
fi

# Config
SWEEPER="0xB05600dd636B419E2F55A819d76CD783eE46bb8A"
BANKR_CLUB="0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82"
NFT_TREASURY="0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216"
RPC="https://base-mainnet.g.alchemy.com/v2/cR4WnXePioePZ5fFrnSiR"

# Get keys
export OP_SERVICE_ACCOUNT_TOKEN=$(cat ~/.clawdbot/secrets/op.env | grep OP_SERVICE_ACCOUNT_TOKEN | cut -d'=' -f2 | tr -d '"')
PRIVATE_KEY=$(op item get "Clawdia Wallets" --vault Clawdia --format json | jq -r '.fields[] | select(.label=="Private Key") | .value')
NEYNAR_KEY=$(cat ~/.clawdbot/secrets/neynar_api_key)
SIGNER_UUID=$(cat ~/.clawdbot/secrets/farcaster_signer_uuid)

echo "🦞 BankrStrategy: Buy Floor NFT #$TOKEN_ID"
echo "==========================================="
echo ""

# Get current stats
STATS=$(cast call $SWEEPER "getStats()(uint256,uint256,uint256,uint256,uint256,uint256)" --rpc-url $RPC 2>/dev/null)
TOTAL_NFTS_BEFORE=$(echo "$STATS" | sed -n '3p' | grep -oE '^[0-9]+')
TOTAL_SPENT_BEFORE=$(echo "$STATS" | sed -n '4p' | grep -oE '^[0-9]+')

echo "Current NFTs: $TOTAL_NFTS_BEFORE"
echo "Buying: Bankr Club #$TOKEN_ID for ${PRICE_ETH}Ξ"
echo ""

# Note: Actual purchase requires OpenSea Seaport interaction
# For now, this script handles the announcement after manual purchase

echo "⚠️  Manual purchase step required:"
echo "   1. Go to: https://opensea.io/assets/base/$BANKR_CLUB/$TOKEN_ID"
echo "   2. Buy for ${PRICE_ETH} ETH"
echo "   3. Press Enter after purchase confirmed..."
read -p ""

# Verify NFT ownership
OWNER=$(cast call $BANKR_CLUB "ownerOf(uint256)(address)" $TOKEN_ID --rpc-url $RPC 2>/dev/null)
echo "NFT owner: $OWNER"

if [[ "$OWNER" != *"$NFT_TREASURY"* ]] && [[ "$OWNER" != *"$SWEEPER"* ]]; then
  echo "⚠️  NFT not in treasury/sweeper. Continue anyway? (y/n)"
  read -p "" CONFIRM
  if [ "$CONFIRM" != "y" ]; then
    exit 1
  fi
fi

# Get updated stats
STATS=$(cast call $SWEEPER "getStats()(uint256,uint256,uint256,uint256,uint256,uint256)" --rpc-url $RPC 2>/dev/null)
TOTAL_NFTS=$(echo "$STATS" | sed -n '3p' | grep -oE '^[0-9]+')
TOTAL_SPENT=$(echo "$STATS" | sed -n '4p' | grep -oE '^[0-9]+')
TOTAL_SPENT_FMT=$(python3 -c "print(f'{int(\"${TOTAL_SPENT:-0}\") / 1e18:.2f}')")

# If stats didn't update (manual buy), calculate manually
if [ "$TOTAL_NFTS" == "$TOTAL_NFTS_BEFORE" ]; then
  TOTAL_NFTS=$((TOTAL_NFTS_BEFORE + 1))
  TOTAL_SPENT_FMT=$(python3 -c "print(f'{int(\"${TOTAL_SPENT_BEFORE:-0}\") / 1e18 + float(\"$PRICE_ETH\"):.2f}')")
fi

echo ""
echo "📣 Posting announcement..."

# Build announcement
TWEET="\$BNKRSTR has purchased Bankr Club #${TOKEN_ID} for ${PRICE_ETH}Ξ

BankrStrategy is currently holding ${TOTAL_NFTS} Bankr Club NFTs bought for a total of ${TOTAL_SPENT_FMT}Ξ 🐚"

CAST="\$BNKRSTR has purchased Bankr Club #${TOKEN_ID} for ${PRICE_ETH}Ξ

BankrStrategy is now holding ${TOTAL_NFTS} Bankr Club NFTs 🐚"

echo ""
echo "Tweet:"
echo "$TWEET"
echo ""

# URL encode for intent
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$TWEET'''))")

echo "Twitter intent URL:"
echo "https://x.com/intent/post?text=$ENCODED"
echo ""

# Post to Farcaster
echo "Posting to Farcaster..."
FC_RESPONSE=$(curl -s -X POST "https://api.neynar.com/v2/farcaster/cast" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $NEYNAR_KEY" \
  -d "{
    \"signer_uuid\": \"$SIGNER_UUID\",
    \"text\": \"$CAST\"
  }")

FC_HASH=$(echo "$FC_RESPONSE" | jq -r '.cast.hash // empty')
if [ ! -z "$FC_HASH" ]; then
  echo "✅ Farcaster: https://warpcast.com/clawdia/$FC_HASH"
else
  echo "❌ Farcaster failed: $FC_RESPONSE"
fi

# Log
echo ""
echo "[$(date)] Bought Bankr Club #$TOKEN_ID for ${PRICE_ETH}Ξ" >> /Users/starl3xx/clawd/logs/nft-purchases.log

echo ""
echo "✅ Done! Open Twitter intent URL to post the announcement."
