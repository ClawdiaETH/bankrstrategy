"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { TradeWidget } from "~~/components/TradeWidget";

// V2 Contract Addresses
const CONTRACTS = {
  token: "0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A",
  sweeper: "0xAAAB525b6C33C33DaA2dCcb840FCa8d5209CB1b1",
  rewards: "0x8d0Dc9E8A42743a0256fd40B70f463e4e0c587d9",
  pool: "0xdd2E1CF351D510b0aBA571b65878785126E936d3",
  bankrClub: "0x9FAb8C51f911f0ba6dab64fD6E979BcF6424Ce82",
};

const LINKS = {
  trade: `https://aerodrome.finance/swap?from=eth&to=${CONTRACTS.token}`,
  chart: `https://dexscreener.com/base/${CONTRACTS.pool}`,
  basescan: `https://basescan.org/token/${CONTRACTS.token}`,
  github: "https://github.com/ClawdiaETH/bankrstrategy",
};

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Gradient background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Hero Section */}
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="flex flex-col items-center text-center">
          {/* Live Badge */}
          <div className="mb-6 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium animate-pulse">
            🟢 Live on Base
          </div>

          {/* Bankr Computer */}
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <Image
              src="/bankr-computer.png"
              alt="BankrStrategy"
              width={200}
              height={160}
              className="relative drop-shadow-2xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              $BNKRSTR
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 mb-4 font-medium">The flywheel token for Bankr Club</p>
          <p className="text-base text-zinc-500 mb-4 max-w-lg">
            10% sell fee automatically sweeps floor NFTs. Buy free, sell feeds the flywheel.
          </p>
          {/* Burn Notice */}
          <div className="mb-8 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium animate-pulse">
            🔥 500M tokens burned (50% of supply) — effective supply now 500M
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <a
              href={LINKS.trade}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-black hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Trade on Aerodrome →
              <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href={LINKS.chart}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-zinc-800/50 border border-zinc-700 rounded-xl font-semibold text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300"
            >
              View chart 📈
            </a>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-purple-500/20 border border-purple-500/30 rounded-xl font-semibold text-purple-300 hover:bg-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
            >
              Dashboard 💻
            </Link>
          </div>

          {/* Contract Address */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <span className="text-zinc-500 text-sm">CA:</span>
            <code className="text-orange-400 text-sm font-mono">{CONTRACTS.token}</code>
            <button
              onClick={() => navigator.clipboard.writeText(CONTRACTS.token)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">500M</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Circulating supply</div>
              <div className="text-xs text-zinc-600 mt-1">500M burned 🔥</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400">10%</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Sell fee</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-400">FREE</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Buy fee</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-400">7.57%</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Pool liquidity</div>
              <div className="text-xs text-zinc-600 mt-1">doubled from 3.79%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Trade $BNKRSTR</h2>
        <p className="text-zinc-500 text-center mb-10 max-w-lg mx-auto">
          Buy free, sell feeds the flywheel. Every sell sweeps the Bankr Club floor.
        </p>
        <TradeWidget />
      </div>

      {/* Chart Embed */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-2xl overflow-hidden border border-zinc-800">
          <iframe
            src={`https://dexscreener.com/base/${CONTRACTS.pool}?embed=1&theme=dark&trades=0&info=0`}
            className="w-full h-[400px]"
            title="DexScreener Chart"
          />
        </div>
      </div>

      {/* Why Bankr */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why Bankr?</h2>
        <p className="text-zinc-500 text-center mb-16 max-w-2xl mx-auto">
          Bankr is the financial layer for AI agents — wallets, trading, payments, and DeFi. Bankr Club NFTs are the
          membership pass to this ecosystem.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* The Ecosystem */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 via-zinc-900 to-purple-500/10 border border-zinc-800">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">The agent economy</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              AI agents are going onchain. They need wallets to trade, pay for services, and coordinate with each other.
              Bankr makes this possible — and Bankr Club members are at the center of it.
            </p>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Wallets for AI agents
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Trading & DeFi integration
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Agent-to-agent payments
              </li>
            </ul>
          </div>

          {/* How We Support It */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 via-zinc-900 to-amber-500/10 border border-zinc-800">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
              <span className="text-2xl">🐚</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">How BankrStrategy helps</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Every $BNKRSTR sell automatically sweeps Bankr Club NFTs from the floor. This creates constant buy
              pressure, supports the floor price, and rewards existing holders.
            </p>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <span className="text-orange-400">✓</span> Sweeps floor NFTs automatically
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-400">✓</span> Rewards for NFT holders
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-400">✓</span> Self-sustaining flywheel
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-24 pt-0">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How it works</h2>
        <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
          Every sell creates value for the entire ecosystem
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-800 hover:border-orange-500/30 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <span className="text-2xl">🧹</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">NFT sweeper</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                8% of fees
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Fees accumulate in the sweeper. When enough builds up, anyone can trigger a sweep to buy floor NFTs.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Holder rewards</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
                1% of fees
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Bankr Club NFT holders can claim proportional rewards. 1 NFT = 1 share of the pool.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-800 hover:border-orange-500/30 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flywheel effect</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                Self-reinforcing
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                More volume → more sweeps → higher floor → more attention → more volume.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="border-y border-zinc-800 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">The flywheel</h2>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
              Buy (FREE)
            </span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
              Sell (10% fee)
            </span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
              Sweep floor
            </span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
              Floor rises
            </span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
              Repeat ↻
            </span>
          </div>
        </div>
      </div>

      {/* Contracts */}
      <div className="border-y border-zinc-800 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Contracts (Base)</h2>
          <div className="space-y-4">
            {[
              { name: "$BNKRSTR Token", address: CONTRACTS.token, color: "orange" },
              { name: "NFT Sweeper", address: CONTRACTS.sweeper, color: "amber" },
              { name: "Holder Rewards", address: CONTRACTS.rewards, color: "green" },
              { name: "Aerodrome Pool", address: CONTRACTS.pool, color: "blue" },
            ].map(contract => (
              <div
                key={contract.address}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
              >
                <span className={`text-${contract.color}-400 font-medium`}>{contract.name}</span>
                <div className="flex items-center gap-2">
                  <code className="text-zinc-400 text-sm font-mono hidden sm:block">
                    {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                  </code>
                  <a
                    href={`https://basescan.org/address/${contract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="relative p-12 rounded-3xl bg-gradient-to-br from-orange-500/10 via-zinc-900 to-amber-500/10 border border-zinc-800 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the flywheel</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Trade on Aerodrome. Every sell sweeps the Bankr Club floor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={LINKS.trade}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-black hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
            >
              Trade now →
            </a>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-zinc-800 border border-zinc-700 rounded-xl font-semibold text-zinc-300 hover:bg-zinc-700 transition-all duration-300"
            >
              View dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500">
              Built by{" "}
              <a
                href="https://x.com/Clawdia_ETH"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                @Clawdia_ETH
              </a>{" "}
              🐚
            </p>
            <div className="flex gap-4">
              <a
                href={LINKS.chart}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Chart
              </a>
              <a
                href={LINKS.basescan}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Basescan
              </a>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="text-zinc-600 text-sm mt-4 text-center md:text-left">Bankr Club Member #998 • clawdiabot.eth</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
