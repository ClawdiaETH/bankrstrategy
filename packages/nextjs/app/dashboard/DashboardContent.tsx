"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEther } from "viem";
import { base } from "viem/chains";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

// V2 Contract Addresses (Base Mainnet)
const CONTRACTS = {
  token: "0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A" as `0x${string}`,
  sweeper: "0xB05600dd636B419E2F55A819d76CD783eE46bb8A" as `0x${string}`,
  sweeperV1: "0xAAAB525b6C33C33DaA2dCcb840FCa8d5209CB1b1" as `0x${string}`, // Old sweeper
  rewards: "0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9" as `0x${string}`,
  pool: "0xdd2E1CF351D510b0aBA571b65878785126E936d3" as `0x${string}`,
  bankrClub: "0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82" as `0x${string}`,
  treasury: "0x84d5e34Ad1a91cF2ECAD071a65948fa48F1B4216" as `0x${string}`,
};

interface TreasuryNFT {
  tokenId: string;
  name: string;
  price?: string;
  date?: string;
  source?: string;
  imageUrl?: string;
  description?: string;
}

const LINKS = {
  trade: `https://aerodrome.finance/swap?from=eth&to=${CONTRACTS.token}`,
  chart: `https://dexscreener.com/base/${CONTRACTS.pool}`,
  basescan: `https://basescan.org/token/${CONTRACTS.token}`,
};

// Minimal ABIs for reading
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
  { name: "sweep", type: "function", inputs: [], outputs: [], stateMutability: "nonpayable" },
] as const;

const REWARDS_ABI = [
  {
    name: "pendingRewards",
    type: "function",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  { name: "claim", type: "function", inputs: [], outputs: [], stateMutability: "nonpayable" },
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

export default function DashboardContent() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: base.id });
  const { data: walletClient } = useWalletClient({ chainId: base.id });

  const [sweepLoading, setSweepLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  // State for contract data
  const [totalSupply, setTotalSupply] = useState<bigint>(BigInt(0));
  const [userBalance, setUserBalance] = useState<bigint>(BigInt(0));
  const [sweeperStats, setSweeperStats] = useState<{
    totalSwept: bigint;
    totalEthReceived: bigint;
    nftsPurchased: bigint;
    ethSpent: bigint;
    callerRewards: bigint;
    availableEth: bigint;
  } | null>(null);
  const [sweeperV1Stats, setSweeperV1Stats] = useState<{
    nftsPurchased: bigint;
    ethSpent: bigint;
    availableEth: bigint;
  } | null>(null);
  const [canSweep, setCanSweep] = useState(false);
  const [pendingRewards, setPendingRewards] = useState<bigint>(BigInt(0));
  const [sweeperBalance, setSweeperBalance] = useState<bigint>(BigInt(0));
  const [rewardsBalance, setRewardsBalance] = useState<bigint>(BigInt(0));
  const [treasuryNftCount, setTreasuryNftCount] = useState<bigint>(BigInt(0));
  const [treasuryNfts, setTreasuryNfts] = useState<TreasuryNFT[]>([]);
  const [floorPrice, setFloorPrice] = useState<number | null>(null);

  // Load from Edge Config cache first (instant)
  useEffect(() => {
    async function loadFromCache() {
      try {
        const res = await fetch("/api/dashboard-data");
        if (!res.ok) return;

        const data = await res.json();
        if (!data || data.error) return;

        // Populate state from cache
        setTotalSupply(BigInt(data.totalSupply || 0));
        setSweeperBalance(BigInt(data.sweeperBalance || 0));
        setRewardsBalance(BigInt(data.rewardsBalance || 0));
        setCanSweep(data.canSweep || false);
        setTreasuryNftCount(BigInt(data.treasuryNftCount || 0));

        if (data.sweeper) {
          setSweeperStats({
            totalSwept: BigInt(data.sweeper.totalSwept || 0),
            totalEthReceived: BigInt(data.sweeper.totalEthReceived || 0),
            nftsPurchased: BigInt(data.sweeper.nftsPurchased || 0),
            ethSpent: BigInt(data.sweeper.ethSpent || 0),
            callerRewards: BigInt(data.sweeper.callerRewards || 0),
            availableEth: BigInt(data.sweeper.availableEth || 0),
          });
        }

        if (data.sweeperV1) {
          setSweeperV1Stats({
            nftsPurchased: BigInt(data.sweeperV1.nftsPurchased || 0),
            ethSpent: BigInt(data.sweeperV1.ethSpent || 0),
            availableEth: BigInt(data.sweeperV1.availableEth || 0),
          });
        }

        if (data.treasuryNfts?.length) {
          setTreasuryNfts(data.treasuryNfts);
        }
      } catch {
        // Cache not available, will load from RPC
      }
    }
    loadFromCache();
  }, []);

  // Fetch data - separate try/catches so one failure doesn't block others
  useEffect(() => {
    async function fetchData() {
      if (!publicClient) return;

      // Fetch all contract data in parallel for faster loading
      const [supplyResult, swBalanceResult, rwBalanceResult, statsResult, statsV1Result, sweepResult, nftCountResult] =
        await Promise.allSettled([
          publicClient.readContract({
            address: CONTRACTS.token,
            abi: TOKEN_ABI,
            functionName: "totalSupply",
          }),
          publicClient.readContract({
            address: CONTRACTS.token,
            abi: TOKEN_ABI,
            functionName: "balanceOf",
            args: [CONTRACTS.sweeper],
          }),
          publicClient.readContract({
            address: CONTRACTS.token,
            abi: TOKEN_ABI,
            functionName: "balanceOf",
            args: [CONTRACTS.rewards],
          }),
          publicClient.readContract({
            address: CONTRACTS.sweeper,
            abi: SWEEPER_ABI,
            functionName: "getStats",
          }),
          publicClient.readContract({
            address: CONTRACTS.sweeperV1,
            abi: SWEEPER_ABI,
            functionName: "getStats",
          }),
          publicClient.readContract({
            address: CONTRACTS.sweeper,
            abi: SWEEPER_ABI,
            functionName: "canSweep",
          }),
          publicClient.readContract({
            address: CONTRACTS.bankrClub,
            abi: NFT_ABI,
            functionName: "balanceOf",
            args: [CONTRACTS.treasury],
          }),
        ]);

      // Process results
      if (supplyResult.status === "fulfilled") setTotalSupply(supplyResult.value);
      if (swBalanceResult.status === "fulfilled") setSweeperBalance(swBalanceResult.value);
      if (rwBalanceResult.status === "fulfilled") setRewardsBalance(rwBalanceResult.value);
      if (statsResult.status === "fulfilled") {
        const stats = statsResult.value;
        setSweeperStats({
          totalSwept: stats[0],
          totalEthReceived: stats[1],
          nftsPurchased: stats[2],
          ethSpent: stats[3],
          callerRewards: stats[4],
          availableEth: stats[5],
        });
      }
      if (statsV1Result.status === "fulfilled") {
        const statsV1 = statsV1Result.value;
        setSweeperV1Stats({
          nftsPurchased: statsV1[2],
          ethSpent: statsV1[3],
          availableEth: statsV1[5],
        });
      }
      if (sweepResult.status === "fulfilled") setCanSweep(sweepResult.value);
      if (nftCountResult.status === "fulfilled") setTreasuryNftCount(nftCountResult.value);

      // User data (also parallel)
      if (address) {
        const [uBalanceResult, pendingResult] = await Promise.allSettled([
          publicClient.readContract({
            address: CONTRACTS.token,
            abi: TOKEN_ABI,
            functionName: "balanceOf",
            args: [address],
          }),
          publicClient.readContract({
            address: CONTRACTS.rewards,
            abi: REWARDS_ABI,
            functionName: "pendingRewards",
            args: [address],
          }),
        ]);
        if (uBalanceResult.status === "fulfilled") setUserBalance(uBalanceResult.value);
        if (pendingResult.status === "fulfilled") setPendingRewards(pendingResult.value);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [publicClient, address]);

  // Fetch treasury NFTs from API (Alchemy + OpenSea)
  useEffect(() => {
    async function fetchTreasuryNfts() {
      try {
        const res = await fetch("/api/treasury-nfts");
        if (!res.ok) throw new Error("Failed to fetch NFTs");

        const data = await res.json();
        if (data.nfts?.length) {
          const nfts: TreasuryNFT[] = data.nfts.map(
            (nft: {
              tokenId: string;
              name: string;
              imageUrl?: string;
              description?: string;
              purchasePrice?: number;
              purchaseDate?: string;
            }) => ({
              tokenId: nft.tokenId,
              name: nft.name,
              imageUrl: nft.imageUrl,
              description: nft.description,
              price: nft.purchasePrice ? `${nft.purchasePrice.toFixed(4)} ETH` : undefined,
              date: nft.purchaseDate,
            }),
          );
          setTreasuryNfts(nfts);
        }
        if (data.floorPrice) {
          setFloorPrice(data.floorPrice);
        }
      } catch (error) {
        console.error("Failed to fetch treasury NFTs:", error);
      }
    }
    fetchTreasuryNfts();
  }, []);

  const handleSweep = async () => {
    if (!walletClient || !publicClient) return;
    setSweepLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.sweeper,
        abi: SWEEPER_ABI,
        functionName: "sweep",
        chain: base,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      // Refresh data
      window.location.reload();
    } catch (e) {
      console.error("Sweep failed:", e);
    }
    setSweepLoading(false);
  };

  const handleClaim = async () => {
    if (!walletClient || !publicClient) return;
    setClaimLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.rewards,
        abi: REWARDS_ABI,
        functionName: "claim",
        chain: base,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      window.location.reload();
    } catch (e) {
      console.error("Claim failed:", e);
    }
    setClaimLoading(false);
  };

  const formatTokens = (value: bigint | undefined, decimals = 0) => {
    if (!value) return "0";
    return Number(formatEther(value)).toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const formatEthValue = (value: bigint | undefined) => {
    if (!value) return "0";
    return Number(formatEther(value)).toFixed(4);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <div className="flex justify-center mb-6">
              <Image src="/logo.png" alt="BankrStrategy" width={80} height={80} />
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              🟢 Live on Base
            </span>
          </div>
        </div>

        {/* Trade CTA */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-center">
            <h2 className="text-2xl font-bold mb-2">Trade $BNKRSTR</h2>
            <p className="text-zinc-400 mb-6">Buy free. Sell feeds the flywheel (10% fee on sells).</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={LINKS.trade}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                Trade on Aerodrome →
              </a>
              <a
                href={LINKS.chart}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-700 transition-all"
              >
                View chart 📈
              </a>
            </div>
          </div>
        </div>

        {/* User Holdings (if connected) */}
        {isConnected && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-orange-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center">
                  🎯
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Your Holdings</h2>
                  <p className="text-sm text-zinc-400">Connected wallet overview</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <div className="text-sm text-zinc-400 mb-1">$BNKRSTR Balance</div>
                  <div className="text-2xl font-bold text-orange-400">{formatTokens(userBalance)}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {userBalance > BigInt(0)
                      ? `${((Number(userBalance) / Number(totalSupply)) * 100).toFixed(4)}% of supply`
                      : "No tokens held"}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <div className="text-sm text-zinc-400 mb-1">Pending Rewards</div>
                  <div className="text-2xl font-bold text-amber-400">{formatTokens(pendingRewards)}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {pendingRewards > BigInt(0) ? "Ready to claim!" : "Requires Bankr Club NFT"}
                  </div>
                </div>
              </div>

              {pendingRewards > BigInt(0) && (
                <div className="mt-4 text-center">
                  <button
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
                    onClick={handleClaim}
                    disabled={claimLoading}
                  >
                    {claimLoading ? "Claiming..." : "💎 Claim Rewards"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Token Overview */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <Image src="/logo.png" alt="BNKRSTR" width={48} height={48} />
              </div>
              <div>
                <h3 className="font-semibold">Token overview</h3>
                <p className="text-sm text-zinc-500">$BNKRSTR</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-lg bg-zinc-800/50">
                <span className="text-zinc-400">Total supply</span>
                <span className="font-semibold">{formatTokens(totalSupply)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-zinc-800/50">
                <span className="text-zinc-400">Your balance</span>
                <span className="font-semibold text-orange-400">
                  {isConnected ? formatTokens(userBalance) : "Connect wallet"}
                </span>
              </div>
              <a
                href={LINKS.basescan}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center p-2 rounded-lg bg-zinc-800/30 text-zinc-500 hover:text-white text-sm transition-colors"
              >
                View on Basescan ↗
              </a>
            </div>
          </div>

          {/* Sweeper */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-orange-500/5 to-zinc-900/50 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">🧹</div>
              <div>
                <h3 className="font-semibold">NFT sweeper</h3>
                <p className="text-sm text-zinc-500">8% of sell fees</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Pending BNKRSTR</span>
                <span className="text-orange-400 font-medium">{formatTokens(sweeperBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">ETH available</span>
                <span className="font-medium">
                  {formatEthValue(
                    (sweeperStats?.availableEth || BigInt(0)) + (sweeperV1Stats?.availableEth || BigInt(0)),
                  )}{" "}
                  ETH
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Total swept</span>
                <span className="font-medium">{formatTokens(sweeperStats?.totalSwept)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">ETH received</span>
                <span className="text-green-400 font-medium">{formatEthValue(sweeperStats?.totalEthReceived)} ETH</span>
              </div>
            </div>
            <button
              className="w-full py-3 rounded-lg bg-orange-500 text-black font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={handleSweep}
              disabled={!canSweep || sweepLoading || !isConnected}
            >
              {sweepLoading ? (
                "Sweeping..."
              ) : canSweep ? (
                <>
                  🚀 Trigger sweep <span className="text-xs opacity-75">+1% reward</span>
                </>
              ) : (
                "Below minimum"
              )}
            </button>
          </div>

          {/* Rewards */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/5 to-zinc-900/50 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">🎁</div>
              <div>
                <h3 className="font-semibold">Holder rewards</h3>
                <p className="text-sm text-zinc-500">1% of sell fees</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Reward pool</span>
                <span className="text-amber-400 font-medium">{formatTokens(rewardsBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Your pending</span>
                <span className="font-medium">{isConnected ? formatTokens(pendingRewards) : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Eligible NFT</span>
                <span className="text-xs font-mono text-zinc-500">Bankr Club</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mb-4">1 Bankr Club NFT = 1 share (1000 total)</p>
            <button
              className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleClaim}
              disabled={pendingRewards === BigInt(0) || claimLoading || !isConnected}
            >
              {claimLoading ? "Claiming..." : pendingRewards > BigInt(0) ? "💎 Claim rewards" : "No rewards available"}
            </button>
          </div>
        </div>

        {/* NFT Treasury */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-500/5 to-zinc-900/50 border border-purple-500/20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">🖼️</div>
            <div className="leading-tight">
              <h2 className="text-lg font-semibold leading-none">NFT Treasury</h2>
              <p className="text-xs text-zinc-500 leading-none mt-0.5">Bankr Club NFTs owned by $BNKRSTR</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-zinc-800/50 text-center">
              <div className="text-3xl font-bold text-purple-400">{Number(treasuryNftCount)}</div>
              <div className="text-sm text-zinc-500">NFTs owned</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-800/50 text-center">
              <div className="text-3xl font-bold text-green-400">
                {formatEthValue((sweeperStats?.ethSpent || BigInt(0)) + (sweeperV1Stats?.ethSpent || BigInt(0)))}
              </div>
              <div className="text-sm text-zinc-500">ETH spent</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-800/50 text-center">
              <div className="text-3xl font-bold text-orange-400">
                {formatEthValue(
                  (sweeperStats?.availableEth || BigInt(0)) + (sweeperV1Stats?.availableEth || BigInt(0)),
                )}
              </div>
              <div className="text-sm text-zinc-500">ETH ready</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-800/50 text-center">
              <div className="text-3xl font-bold text-pink-400">{floorPrice ? floorPrice.toFixed(2) : "—"}</div>
              <div className="text-sm text-zinc-500">floor price</div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-zinc-400">Purchase History</h3>
            {treasuryNfts.length > 0 ? (
              <div className="space-y-2">
                {treasuryNfts.map(nft => (
                  <a
                    key={nft.tokenId}
                    href={`https://opensea.io/assets/base/${CONTRACTS.bankrClub.toLowerCase()}/${nft.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on OpenSea"
                    className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-purple-500/50 hover:bg-zinc-800 transition-all group"
                  >
                    {/* Small NFT Thumbnail */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-700/50">
                      {nft.imageUrl ? (
                        <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
                      )}
                    </div>

                    {/* NFT Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{nft.name}</div>
                      <div className="text-xs text-zinc-500">{nft.date}</div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-green-400 font-semibold">{nft.price}</div>
                      <div className="text-xs text-zinc-500">purchased</div>
                    </div>

                    {/* Hover indicator */}
                    <div className="hidden group-hover:flex items-center text-purple-400 text-sm flex-shrink-0">
                      OpenSea ↗
                    </div>
                  </a>
                ))}
              </div>
            ) : Number(treasuryNftCount) > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Loading skeletons */}
                {Array.from({ length: Number(treasuryNftCount) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 animate-pulse"
                  >
                    <div className="w-14 h-14 rounded-lg bg-zinc-700/50"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-zinc-700/50 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-zinc-700/50 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-zinc-700/50 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <div className="text-4xl mb-2">🖼️</div>
                <div>No NFTs purchased yet</div>
                <div className="text-sm">Check back after the first sweep!</div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <a
              href={`https://opensea.io/${CONTRACTS.treasury}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              View treasury on OpenSea ↗
            </a>
          </div>
        </div>

        {/* Contracts */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-6">📋 Contracts (Base)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: "$BNKRSTR Token", address: CONTRACTS.token },
              { name: "NFT Sweeper", address: CONTRACTS.sweeper },
              { name: "Holder Rewards", address: CONTRACTS.rewards },
              { name: "Aerodrome Pool", address: CONTRACTS.pool },
            ].map(c => (
              <div key={c.address} className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50">
                <span className="text-zinc-400 text-sm">{c.name}</span>
                <a
                  href={`https://basescan.org/address/${c.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-orange-400 hover:text-orange-300"
                >
                  {c.address.slice(0, 6)}...{c.address.slice(-4)} ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
