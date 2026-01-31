"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const BANKR_CLUB_NFT = "0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82";

// Check if we're on a supported network with deployed contracts
const SUPPORTED_CHAIN_ID = 31337; // Foundry local fork

export default function DashboardContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [sweepLoading, setSweepLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  // Check if contracts are deployed on current network
  const isTestnet = chainId === SUPPORTED_CHAIN_ID;

  const { data: ethBalance } = useBalance({ address });

  const { data: tokenName } = useScaffoldReadContract({
    contractName: "BnkrstrToken",
    functionName: "name",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "BnkrstrToken",
    functionName: "totalSupply",
  });

  const { data: userBalance } = useScaffoldReadContract({
    contractName: "BnkrstrToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: buyQuote } = useScaffoldReadContract({
    contractName: "BnkrstrRouter",
    functionName: "getQuoteBuy",
    args: [buyAmount ? parseEther(buyAmount) : BigInt(0)],
  });

  const { data: sellQuote } = useScaffoldReadContract({
    contractName: "BnkrstrRouter",
    functionName: "getQuoteSell",
    args: [sellAmount ? parseEther(sellAmount) : BigInt(0)],
  });

  const { data: canSweep } = useScaffoldReadContract({
    contractName: "NftSweeper",
    functionName: "canSweep",
  });

  const { data: sweepableBalance } = useScaffoldReadContract({
    contractName: "NftSweeper",
    functionName: "sweepableBalance",
  });

  const { data: minSweepAmount } = useScaffoldReadContract({
    contractName: "NftSweeper",
    functionName: "minSweepAmount",
  });

  const { data: availableEth } = useScaffoldReadContract({
    contractName: "NftSweeper",
    functionName: "availableEth",
  });

  const { data: totalNftsPurchased } = useScaffoldReadContract({
    contractName: "NftSweeper",
    functionName: "totalNftsPurchased",
  });

  const { data: rewardsFund } = useScaffoldReadContract({
    contractName: "BnkrstrRouter",
    functionName: "rewardsFund",
  });

  const { data: rewardsBalance } = useScaffoldReadContract({
    contractName: "BnkrstrToken",
    functionName: "balanceOf",
    args: [rewardsFund],
  });

  const { data: pendingRewards } = useScaffoldReadContract({
    contractName: "HolderRewards",
    functionName: "pendingRewards",
    args: [address],
  });

  const { data: canClaim } = useScaffoldReadContract({
    contractName: "HolderRewards",
    functionName: "canClaim",
    args: [address],
  });

  const { writeContractAsync: writeSweeper } = useScaffoldWriteContract("NftSweeper");
  const { writeContractAsync: writeRewards } = useScaffoldWriteContract("HolderRewards");
  const { writeContractAsync: writeRouter } = useScaffoldWriteContract("BnkrstrRouter");
  const { writeContractAsync: writeToken } = useScaffoldWriteContract("BnkrstrToken");

  const handleBuy = async () => {
    if (!buyAmount) return;
    setBuyLoading(true);
    try {
      await writeRouter({
        functionName: "buyWithETH",
        args: [BigInt(0), BigInt(Math.floor(Date.now() / 1000) + 300)],
        value: parseEther(buyAmount),
      });
      setBuyAmount("");
    } catch (e) {
      console.error("Buy failed:", e);
    }
    setBuyLoading(false);
  };

  const handleSell = async () => {
    if (!sellAmount || !userBalance) return;
    setSellLoading(true);
    try {
      const routerAddress = "0x42de5f039de941cc4f90d70782a359e04825a199";
      await writeToken({
        functionName: "approve",
        args: [routerAddress, parseEther(sellAmount)],
      });
      await writeRouter({
        functionName: "sellForETH",
        args: [parseEther(sellAmount), BigInt(0), BigInt(Math.floor(Date.now() / 1000) + 300)],
      });
      setSellAmount("");
    } catch (e) {
      console.error("Sell failed:", e);
    }
    setSellLoading(false);
  };

  const handleSweep = async () => {
    setSweepLoading(true);
    try {
      await writeSweeper({ functionName: "sweep" });
    } catch (e) {
      console.error("Sweep failed:", e);
    }
    setSweepLoading(false);
  };

  const handleClaim = async () => {
    setClaimLoading(true);
    try {
      await writeRewards({ functionName: "claim" });
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
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="BankrStrategy" width={80} height={80} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-zinc-500">{tokenName || "BNKRSTR"} • Trade via Router</p>
        </div>

        {/* Coming Soon Banner */}
        {!isTestnet && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold mb-2">Coming Soon to Base Mainnet</h2>
              <p className="text-zinc-400 mb-6">Contracts are tested and ready. Mainnet deployment coming soon!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="https://github.com/ClawdiaETH/bankrstrategy"
                  target="_blank"
                  className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  View Source Code →
                </Link>
                <Link
                  href="https://github.com/ClawdiaETH/projects/blob/main/proposals/bankrstrategy-proposal.md"
                  target="_blank"
                  className="px-6 py-3 rounded-xl bg-orange-500 text-black font-semibold hover:bg-orange-400 transition-colors"
                >
                  Read Proposal
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Connection Alert */}
        {isTestnet && !isConnected && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
            <p className="text-orange-400">Connect your wallet to trade and interact</p>
          </div>
        )}

        {/* Only show trading UI on testnet */}
        {isTestnet && (
          <>
            {/* Trading Card */}
            <div className="mb-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                💱 Trade BNKRSTR
                <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">via Router</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Buy */}
                <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                  <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                    📈 Buy BNKRSTR
                    <span className="px-2 py-0.5 text-xs rounded bg-green-500/10 text-green-400">No fee</span>
                  </h3>
                  <div className="mb-4">
                    <label className="flex justify-between text-sm text-zinc-500 mb-2">
                      <span>ETH Amount</span>
                      <span>Balance: {ethBalance ? formatEthValue(ethBalance.value) : "0"}</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.1"
                      className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
                      value={buyAmount}
                      onChange={e => setBuyAmount(e.target.value)}
                    />
                  </div>
                  {buyAmount && buyQuote && (
                    <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 text-sm">
                      You&apos;ll receive:{" "}
                      <span className="text-green-400 font-semibold">{formatTokens(buyQuote)}</span> BNKRSTR
                    </div>
                  )}
                  <button
                    className="w-full py-3 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleBuy}
                    disabled={!buyAmount || !isConnected || buyLoading}
                  >
                    {buyLoading ? "Buying..." : "Buy BNKRSTR"}
                  </button>
                </div>

                {/* Sell */}
                <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                  <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
                    📉 Sell BNKRSTR
                    <span className="px-2 py-0.5 text-xs rounded bg-red-500/10 text-red-400">10% fee</span>
                  </h3>
                  <div className="mb-4">
                    <label className="flex justify-between text-sm text-zinc-500 mb-2">
                      <span>BNKRSTR Amount</span>
                      <span>Balance: {formatTokens(userBalance)}</span>
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
                      value={sellAmount}
                      onChange={e => setSellAmount(e.target.value)}
                    />
                  </div>
                  {sellAmount && sellQuote && (
                    <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 text-sm">
                      <div>
                        You&apos;ll receive: <span className="font-semibold">{formatEthValue(sellQuote[0])} ETH</span>
                      </div>
                      <div className="text-red-400 text-xs">Fee: {formatTokens(sellQuote[1])} BNKRSTR (10%)</div>
                    </div>
                  )}
                  <button
                    className="w-full py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSell}
                    disabled={!sellAmount || !isConnected || sellLoading}
                  >
                    {sellLoading ? "Selling..." : "Sell BNKRSTR"}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Token Overview */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                    💰
                  </div>
                  <div>
                    <h3 className="font-semibold">Token Overview</h3>
                    <p className="text-sm text-zinc-500">{tokenName || "BNKRSTR"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-zinc-800/50">
                    <span className="text-zinc-400">Total Supply</span>
                    <span className="font-semibold">{formatTokens(totalSupply)}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-zinc-800/50">
                    <span className="text-zinc-400">Your Balance</span>
                    <span className="font-semibold text-orange-400">
                      {isConnected ? formatTokens(userBalance) : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sweeper */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-orange-500/5 to-zinc-900/50 border border-orange-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">🧹</div>
                  <div>
                    <h3 className="font-semibold">NFT Sweeper</h3>
                    <p className="text-sm text-zinc-500">8% of sell fees</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Pending BNKRSTR</span>
                    <span className="text-orange-400 font-medium">{formatTokens(sweepableBalance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">ETH Available</span>
                    <span className="font-medium">{formatEthValue(availableEth)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">NFTs Purchased</span>
                    <span className="text-green-400 font-medium">{totalNftsPurchased?.toString() || "0"}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-4">Min sweep: {formatTokens(minSweepAmount)} BNKRSTR</p>
                <button
                  className="w-full py-3 rounded-lg bg-orange-500 text-black font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleSweep}
                  disabled={!canSweep || sweepLoading}
                >
                  {canSweep ? (
                    <>
                      🚀 Trigger Sweep <span className="text-xs opacity-75">+1% reward</span>
                    </>
                  ) : (
                    "Below Minimum"
                  )}
                </button>
              </div>

              {/* Rewards */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/5 to-zinc-900/50 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">🎁</div>
                  <div>
                    <h3 className="font-semibold">Holder Rewards</h3>
                    <p className="text-sm text-zinc-500">1% of sell fees</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Reward Pool</span>
                    <span className="text-amber-400 font-medium">{formatTokens(rewardsBalance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Your Pending</span>
                    <span className="font-medium">{isConnected ? formatTokens(pendingRewards) : "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">NFT Collection</span>
                    <span className="font-mono text-xs">
                      {BANKR_CLUB_NFT.slice(0, 6)}...{BANKR_CLUB_NFT.slice(-4)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-4">1 NFT = 1 share (1000 total)</p>
                <button
                  className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleClaim}
                  disabled={!canClaim || claimLoading || !isConnected}
                >
                  {canClaim ? "💎 Claim Rewards" : "No Rewards / Cooldown"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Fee Breakdown - Always show */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-6">📊 Fee Breakdown (Sells Only)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-6 rounded-xl bg-orange-500/5 border border-orange-500/20">
              <div className="text-3xl font-bold text-orange-400 mb-1">8%</div>
              <div className="text-sm font-medium">NFT Sweeper</div>
              <div className="text-xs text-zinc-500 mt-1">Buys floor NFTs</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="text-3xl font-bold text-amber-400 mb-1">1%</div>
              <div className="text-sm font-medium">Holder Rewards</div>
              <div className="text-xs text-zinc-500 mt-1">To NFT holders</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
              <div className="text-3xl font-bold text-zinc-400 mb-1">1%</div>
              <div className="text-sm font-medium">Dev Fund</div>
              <div className="text-xs text-zinc-500 mt-1">Maintenance</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
              <div className="text-3xl font-bold mb-1">10%</div>
              <div className="text-sm font-medium">Total Fee</div>
              <div className="text-xs text-zinc-500 mt-1">On sells only</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
