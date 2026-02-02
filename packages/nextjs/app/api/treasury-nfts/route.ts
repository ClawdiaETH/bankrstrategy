import { NextResponse } from "next/server";

// API Keys (server-side only - not exposed to client)
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "GFFnS7_zmrBjrUOpH-W5n";
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY || "0623c0a95ad647c2ad2170968ce48b49";

const ALCHEMY_BASE_URL = `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;
const OPENSEA_BASE_URL = "https://api.opensea.io/api/v2";

// Contract addresses
const TREASURY_ADDRESS = "0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216";
const BANKR_CLUB_ADDRESS = "0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82";
const BANKR_CLUB_SLUG = "bankr-club";

interface AlchemyNFT {
  tokenId: string;
  name: string;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    pngUrl?: string;
  };
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  totalCount: number;
}

interface OpenSeaSaleEvent {
  event_type: string;
  buyer: string;
  payment: {
    quantity: string;
    symbol: string;
  };
  event_timestamp: number;
}

interface OpenSeaEventsResponse {
  asset_events: OpenSeaSaleEvent[];
}

interface OpenSeaStatsResponse {
  total: {
    floor_price: number;
  };
}

// Get purchase price from OpenSea sale events
async function getPurchasePrice(tokenId: string): Promise<{ price: number; date: string; timestamp: number } | null> {
  if (!OPENSEA_API_KEY) return null;

  try {
    const url = `${OPENSEA_BASE_URL}/events/chain/base/contract/${BANKR_CLUB_ADDRESS.toLowerCase()}/nfts/${tokenId}?event_type=sale&limit=5`;
    const response = await fetch(url, {
      headers: {
        "x-api-key": OPENSEA_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache 5 min
    });

    if (!response.ok) return null;

    const data: OpenSeaEventsResponse = await response.json();

    // Find the sale where buyer is treasury or one of the sweepers
    const treasuryAddresses = [
      TREASURY_ADDRESS.toLowerCase(),
      "0xb05600dd636b419e2f55a819d76cd783ee46bb8a", // V2 Sweeper
      "0xaaab525b6c33c33daa2dccb840fca8d5209cb1b1", // V1 Sweeper
    ];

    const purchaseEvent = data.asset_events.find(
      event => event.event_type === "sale" && treasuryAddresses.includes(event.buyer.toLowerCase()),
    );

    if (purchaseEvent) {
      const priceWei = BigInt(purchaseEvent.payment.quantity);
      const priceEth = Number(priceWei) / 1e18;
      const timestamp = purchaseEvent.event_timestamp;
      const date = new Date(timestamp * 1000).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return { price: priceEth, date, timestamp };
    }
  } catch (error) {
    console.error(`Failed to get purchase price for token ${tokenId}:`, error);
  }
  return null;
}

// Get current floor price from OpenSea
async function getFloorPrice(): Promise<number | null> {
  if (!OPENSEA_API_KEY) return null;

  try {
    const url = `${OPENSEA_BASE_URL}/collections/${BANKR_CLUB_SLUG}/stats`;
    const response = await fetch(url, {
      headers: {
        "x-api-key": OPENSEA_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Cache 1 min
    });

    if (!response.ok) return null;

    const data: OpenSeaStatsResponse = await response.json();
    return data.total?.floor_price || null;
  } catch (error) {
    console.error("Failed to get floor price:", error);
  }
  return null;
}

export async function GET() {
  try {
    // Fetch NFTs from Alchemy (for images and metadata)
    const alchemyUrl = `${ALCHEMY_BASE_URL}/getNFTsForOwner?owner=${TREASURY_ADDRESS}&contractAddresses[]=${BANKR_CLUB_ADDRESS}&withMetadata=true`;

    const [alchemyResponse, floorPrice] = await Promise.all([
      fetch(alchemyUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      }),
      getFloorPrice(),
    ]);

    if (!alchemyResponse.ok) {
      throw new Error(`Alchemy API error: ${alchemyResponse.status}`);
    }

    const alchemyData: AlchemyResponse = await alchemyResponse.json();

    // Get purchase prices for each NFT in parallel
    const nftsWithPrices = await Promise.all(
      alchemyData.ownedNfts.map(async nft => {
        const purchaseInfo = await getPurchasePrice(nft.tokenId);
        return {
          tokenId: nft.tokenId,
          name: nft.name || `Bankr Club #${nft.tokenId}`,
          imageUrl: nft.image?.cachedUrl || nft.image?.pngUrl || nft.image?.thumbnailUrl || null,
          purchasePrice: purchaseInfo?.price,
          purchaseDate: purchaseInfo?.date,
          purchaseTimestamp: purchaseInfo?.timestamp || 0,
        };
      }),
    );

    // Sort by purchase timestamp, newest first
    nftsWithPrices.sort((a, b) => b.purchaseTimestamp - a.purchaseTimestamp);

    return NextResponse.json({
      nfts: nftsWithPrices,
      totalCount: alchemyData.totalCount,
      floorPrice: floorPrice,
    });
  } catch (error) {
    console.error("Failed to fetch treasury NFTs:", error);
    return NextResponse.json({ error: "Failed to fetch NFTs", nfts: [], totalCount: 0 }, { status: 500 });
  }
}
