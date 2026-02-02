import { NextResponse } from "next/server";

// Alchemy NFT API for Base mainnet
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "GFFnS7_zmrBjrUOpH-W5n";
const ALCHEMY_BASE_URL = `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;

// Contract addresses
const TREASURY_ADDRESS = "0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216";
const BANKR_CLUB_ADDRESS = "0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82";

interface AlchemyNFT {
  tokenId: string;
  name: string;
  description?: string;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    pngUrl?: string;
    originalUrl?: string;
  };
  contract: {
    address: string;
    name: string;
    openSeaMetadata?: {
      floorPrice?: number;
    };
  };
  acquiredAt?: {
    blockTimestamp?: string;
  };
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  totalCount: number;
}

export async function GET() {
  try {
    // Fetch NFTs owned by treasury
    const url = `${ALCHEMY_BASE_URL}/getNFTsForOwner?owner=${TREASURY_ADDRESS}&contractAddresses[]=${BANKR_CLUB_ADDRESS}&withMetadata=true`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data: AlchemyResponse = await response.json();

    // Transform to our format
    const nfts = data.ownedNfts.map(nft => ({
      tokenId: nft.tokenId,
      name: nft.name || `Bankr Club #${nft.tokenId}`,
      description: nft.description,
      imageUrl: nft.image?.cachedUrl || nft.image?.pngUrl || nft.image?.thumbnailUrl || null,
      thumbnailUrl: nft.image?.thumbnailUrl || null,
      floorPrice: nft.contract.openSeaMetadata?.floorPrice,
    }));

    return NextResponse.json({
      nfts,
      totalCount: data.totalCount,
      floorPrice: data.ownedNfts[0]?.contract.openSeaMetadata?.floorPrice,
    });
  } catch (error) {
    console.error("Failed to fetch treasury NFTs:", error);
    return NextResponse.json({ error: "Failed to fetch NFTs", nfts: [], totalCount: 0 }, { status: 500 });
  }
}
