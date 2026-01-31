"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const BANKR_CLUB_NFT = "0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82";

export default function DashboardContent() {
  const { address, isConnected } = useAccount();
  const [sweepLoading, setSweepLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  // ETH balance
  const { data: ethBalance } = useBalance({ address });

  // Token stats
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

  // Router quotes
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

  // Sweeper stats
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

  // Rewards stats
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

  // Write functions
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
      // First approve the router
      const routerAddress = "0x42de5f039de941cc4f90d70782a359e04825a199";
      await writeToken({
        functionName: "approve",
        args: [routerAddress, parseEther(sellAmount)],
      });
      // Then sell
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
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-base-300 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-base-content/60">
            {tokenName || "BNKRSTR"} • Trade via Router for automatic fee collection
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="alert alert-info mb-8 max-w-2xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Connect your wallet to trade and interact with contracts</span>
          </div>
        )}

        {/* Trading Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6 flex items-center gap-2">
              <span>💱</span> Trade BNKRSTR
              <span className="badge badge-outline badge-sm">via Router</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Buy */}
              <div className="p-6 bg-success/10 rounded-2xl border border-success/20">
                <h3 className="font-bold text-lg mb-4 text-success flex items-center gap-2">
                  <span>📈</span> Buy BNKRSTR
                  <span className="badge badge-success badge-sm">No fee</span>
                </h3>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">ETH Amount</span>
                    <span className="label-text-alt">
                      Balance: {ethBalance ? formatEthValue(ethBalance.value) : "0"} ETH
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.1"
                    className="input input-bordered w-full"
                    value={buyAmount}
                    onChange={e => setBuyAmount(e.target.value)}
                  />
                </div>
                {buyAmount && buyQuote && (
                  <div className="text-sm mb-4 p-3 bg-base-200 rounded-lg">
                    You&apos;ll receive: <span className="font-bold text-success">{formatTokens(buyQuote)}</span>{" "}
                    BNKRSTR
                  </div>
                )}
                <button
                  className={`btn btn-success btn-block ${buyLoading ? "loading" : ""}`}
                  onClick={handleBuy}
                  disabled={!buyAmount || !isConnected || buyLoading}
                >
                  {buyLoading ? "Buying..." : "Buy BNKRSTR"}
                </button>
              </div>

              {/* Sell */}
              <div className="p-6 bg-error/10 rounded-2xl border border-error/20">
                <h3 className="font-bold text-lg mb-4 text-error flex items-center gap-2">
                  <span>📉</span> Sell BNKRSTR
                  <span className="badge badge-error badge-sm">10% fee</span>
                </h3>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">BNKRSTR Amount</span>
                    <span className="label-text-alt">Balance: {formatTokens(userBalance)}</span>
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="input input-bordered w-full"
                    value={sellAmount}
                    onChange={e => setSellAmount(e.target.value)}
                  />
                </div>
                {sellAmount && sellQuote && (
                  <div className="text-sm mb-4 p-3 bg-base-200 rounded-lg">
                    <div>
                      You&apos;ll receive: <span className="font-bold">{formatEthValue(sellQuote[0])} ETH</span>
                    </div>
                    <div className="text-error text-xs">Fee: {formatTokens(sellQuote[1])} BNKRSTR (10%)</div>
                  </div>
                )}
                <button
                  className={`btn btn-error btn-block ${sellLoading ? "loading" : ""}`}
                  onClick={handleSell}
                  disabled={!sellAmount || !isConnected || sellLoading}
                >
                  {sellLoading ? "Selling..." : "Sell BNKRSTR"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Token Overview Card */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h2 className="card-title text-lg">Token Overview</h2>
                  <p className="text-sm text-base-content/60">{tokenName || "BNKRSTR"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                  <span className="text-base-content/70">Total Supply</span>
                  <span className="font-bold text-lg">{formatTokens(totalSupply)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                  <span className="text-base-content/70">Your Balance</span>
                  <span className="font-bold text-lg text-primary">
                    {isConnected ? formatTokens(userBalance) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sweeper Card */}
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl border border-primary/20">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">🧹</span>
                </div>
                <div>
                  <h2 className="card-title text-lg">NFT Sweeper</h2>
                  <p className="text-sm text-base-content/60">8% of sell fees</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 text-sm">Pending BNKRSTR</span>
                  <span className="font-bold text-primary">{formatTokens(sweepableBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 text-sm">ETH Available</span>
                  <span className="font-bold">{formatEthValue(availableEth)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 text-sm">NFTs Purchased</span>
                  <span className="font-bold text-success">{totalNftsPurchased?.toString() || "0"}</span>
                </div>

                <div className="divider my-2"></div>

                <div className="text-xs text-base-content/50 mb-2">
                  Min sweep: {formatTokens(minSweepAmount)} BNKRSTR
                </div>

                <button
                  className={`btn btn-primary btn-block ${sweepLoading ? "loading" : ""}`}
                  onClick={handleSweep}
                  disabled={!canSweep || sweepLoading}
                >
                  {canSweep ? (
                    <>
                      <span>🚀</span> Trigger Sweep
                      <span className="badge badge-sm">+1% reward</span>
                    </>
                  ) : (
                    "Below Minimum"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Rewards Card */}
          <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-xl border border-secondary/20">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <span className="text-2xl">🎁</span>
                </div>
                <div>
                  <h2 className="card-title text-lg">Holder Rewards</h2>
                  <p className="text-sm text-base-content/60">1% of sell fees</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 text-sm">Reward Pool</span>
                  <span className="font-bold text-secondary">{formatTokens(rewardsBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 text-sm">Your Pending</span>
                  <span className="font-bold">{isConnected ? formatTokens(pendingRewards) : "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70 text-sm">NFT Collection</span>
                  <span className="font-mono text-xs">
                    {BANKR_CLUB_NFT.slice(0, 6)}...{BANKR_CLUB_NFT.slice(-4)}
                  </span>
                </div>

                <div className="divider my-2"></div>

                <div className="text-xs text-base-content/50 mb-2">1 NFT = 1 share (1000 total)</div>

                <button
                  className={`btn btn-secondary btn-block ${claimLoading ? "loading" : ""}`}
                  onClick={handleClaim}
                  disabled={!canClaim || claimLoading || !isConnected}
                >
                  {canClaim ? (
                    <>
                      <span>💎</span> Claim Rewards
                    </>
                  ) : (
                    "No Rewards / Cooldown"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6 flex items-center gap-2">
              <span>🏗️</span> Architecture
            </h2>

            <div className="overflow-x-auto">
              <div className="flex items-center justify-center gap-4 text-sm flex-wrap p-4 bg-base-200 rounded-xl">
                <div className="badge badge-lg badge-neutral p-4">User</div>
                <div className="text-xl">→</div>
                <div className="badge badge-lg badge-primary p-4">BnkrstrRouter</div>
                <div className="text-xl">→</div>
                <div className="flex flex-col gap-2 items-center">
                  <div className="badge badge-warning p-2 text-xs">10% Fee (sells only)</div>
                  <div className="flex gap-1">
                    <span className="badge badge-sm">8% Sweeper</span>
                    <span className="badge badge-sm">1% Rewards</span>
                    <span className="badge badge-sm">1% Dev</span>
                  </div>
                </div>
                <div className="text-xl">→</div>
                <div className="badge badge-lg badge-secondary p-4">Aerodrome</div>
                <div className="text-xl">→</div>
                <div className="badge badge-lg badge-accent p-4">ETH/Tokens</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-base-content/60 text-center">
              Router collects 10% fee on sells before routing to Aerodrome. Buys have no fee.
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6 flex items-center gap-2">
              <span>📊</span> Fee Breakdown (Sells Only)
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="text-4xl font-black text-primary mb-1">8%</div>
                <div className="text-sm font-semibold">NFT Sweeper</div>
                <div className="text-xs text-base-content/60 mt-1">Buys floor NFTs</div>
              </div>
              <div className="text-center p-6 bg-secondary/10 rounded-2xl border border-secondary/20">
                <div className="text-4xl font-black text-secondary mb-1">1%</div>
                <div className="text-sm font-semibold">Holder Rewards</div>
                <div className="text-xs text-base-content/60 mt-1">To NFT holders</div>
              </div>
              <div className="text-center p-6 bg-accent/10 rounded-2xl border border-accent/20">
                <div className="text-4xl font-black text-accent mb-1">1%</div>
                <div className="text-sm font-semibold">Dev Fund</div>
                <div className="text-xs text-base-content/60 mt-1">Maintenance</div>
              </div>
              <div className="text-center p-6 bg-base-200 rounded-2xl border border-base-300">
                <div className="text-4xl font-black mb-1">10%</div>
                <div className="text-sm font-semibold">Total Fee</div>
                <div className="text-xs text-base-content/60 mt-1">On sells only</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
