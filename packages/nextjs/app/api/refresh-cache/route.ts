import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

// Edge Config API for writing
const EDGE_CONFIG_ID = "ecfg_h1wkpyt9qiz6dqzecr7rvpqpw4q5";

const CONTRACTS = {
  token: "0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A" as `0x${string}`,
  sweeper: "0xB05600dd636B419E2F55A819d76CD783eE46bb8A" as `0x${string}`,
  sweeperV1: "0xAAAB525b6C33C33DaA2dCcb840FCa8d5209CB1b1" as `0x${string}`,
  rewards: "0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9" as `0x${string}`,
  bankrClub: "0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82" as `0x${string}`,
  treasury: "0xf17b5dD382B048Ff4c05c1C9e4E24cfC5C6adAd9" as `0x${string}`,
};

const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC || "https://base-mainnet.g.alchemy.com/v2/GFFnS7_zmrBjrUOpH-W5n";
const OPENSEA_API = "https://api.opensea.io/api/v2";

// ABIs
const TOKEN_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  { name: "totalSupply", type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
] as const;

const SWEEPER_ABI = [
  {
    name: "getStats",
    type: "function",
    inputs: [],
    outputs: [
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
    ],
    stateMutability: "view",
  },
  { name: "canSweep", type: "function", inputs: [], outputs: [{ type: "bool" }], stateMutability: "view" },
] as const;

const NFT_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = createPublicClient({ chain: base, transport: http(RPC_URL) });

    // Fetch all contract data in parallel
    const [totalSupply, sweeperBalance, rewardsBalance, sweeperStats, sweeperV1Stats, canSweep, treasuryNftCount] =
      await Promise.all([
        client.readContract({ address: CONTRACTS.token, abi: TOKEN_ABI, functionName: "totalSupply" }),
        client.readContract({
          address: CONTRACTS.token,
          abi: TOKEN_ABI,
          functionName: "balanceOf",
          args: [CONTRACTS.sweeper],
        }),
        client.readContract({
          address: CONTRACTS.token,
          abi: TOKEN_ABI,
          functionName: "balanceOf",
          args: [CONTRACTS.rewards],
        }),
        client.readContract({ address: CONTRACTS.sweeper, abi: SWEEPER_ABI, functionName: "getStats" }),
        client
          .readContract({ address: CONTRACTS.sweeperV1, abi: SWEEPER_ABI, functionName: "getStats" })
          .catch(() => [0n, 0n, 0n, 0n, 0n, 0n]),
        client.readContract({ address: CONTRACTS.sweeper, abi: SWEEPER_ABI, functionName: "canSweep" }),
        client.readContract({
          address: CONTRACTS.bankrClub,
          abi: NFT_ABI,
          functionName: "balanceOf",
          args: [CONTRACTS.treasury],
        }),
      ]);

    // Fetch treasury NFTs from OpenSea
    let treasuryNfts: { tokenId: string; name: string; price: string; date: string }[] = [];
    try {
      const nftsRes = await fetch(`${OPENSEA_API}/chain/base/account/${CONTRACTS.treasury}/nfts?collection=bankr-club`);
      const nftsData = await nftsRes.json();

      if (nftsData.nfts) {
        treasuryNfts = await Promise.all(
          nftsData.nfts.map(async (nft: { identifier: string; name: string }) => {
            try {
              const eventsRes = await fetch(
                `${OPENSEA_API}/events/chain/base/contract/${CONTRACTS.bankrClub}/nfts/${nft.identifier}`,
              );
              const eventsData = await eventsRes.json();
              const saleEvent = eventsData.asset_events?.find((e: { event_type: string }) => e.event_type === "sale");

              let price = "—";
              let date = "—";
              if (saleEvent) {
                const ethPrice = Number(saleEvent.payment?.quantity || 0) / 1e18;
                price = `${ethPrice.toFixed(4)} ETH`;
                date = new Date(saleEvent.timestamp * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }
              return { tokenId: nft.identifier, name: nft.name || `Bankr Club #${nft.identifier}`, price, date };
            } catch {
              return {
                tokenId: nft.identifier,
                name: nft.name || `Bankr Club #${nft.identifier}`,
                price: "—",
                date: "—",
              };
            }
          }),
        );
        treasuryNfts.sort((a, b) => Number(b.tokenId) - Number(a.tokenId));
      }
    } catch (e) {
      console.error("Failed to fetch NFTs:", e);
    }

    // Prepare cache data
    const cacheData = {
      totalSupply: totalSupply.toString(),
      sweeperBalance: sweeperBalance.toString(),
      rewardsBalance: rewardsBalance.toString(),
      sweeper: {
        totalSwept: sweeperStats[0].toString(),
        totalEthReceived: sweeperStats[1].toString(),
        nftsPurchased: sweeperStats[2].toString(),
        ethSpent: sweeperStats[3].toString(),
        callerRewards: sweeperStats[4].toString(),
        availableEth: sweeperStats[5].toString(),
      },
      sweeperV1: {
        nftsPurchased: sweeperV1Stats[2].toString(),
        ethSpent: sweeperV1Stats[3].toString(),
        availableEth: sweeperV1Stats[5].toString(),
      },
      canSweep,
      treasuryNftCount: treasuryNftCount.toString(),
      treasuryNfts,
      updatedAt: Date.now(),
    };

    // Write to Edge Config via Vercel API
    const edgeConfigToken = process.env.EDGE_CONFIG_TOKEN;
    if (!edgeConfigToken) {
      return NextResponse.json({ error: "Missing EDGE_CONFIG_TOKEN" }, { status: 500 });
    }

    const updateRes = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${edgeConfigToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: "dashboardData", value: cacheData }],
      }),
    });

    if (!updateRes.ok) {
      const error = await updateRes.text();
      return NextResponse.json({ error: `Edge Config update failed: ${error}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedAt: cacheData.updatedAt });
  } catch (e) {
    console.error("Cache refresh failed:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
