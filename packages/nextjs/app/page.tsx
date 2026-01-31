"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Gradient background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Hero Section */}
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <Image src="/logo.png" alt="BankrStrategy" width={180} height={180} className="relative drop-shadow-2xl" />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              BankrStrategy
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 mb-4 font-medium">The flywheel token for Bankr Club</p>
          <p className="text-base text-zinc-500 mb-10 max-w-lg">
            10% sell fee automatically sweeps floor NFTs, rewards holders, and creates unstoppable momentum.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-black hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Launch dashboard
              <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <a
              href="https://github.com/ClawdiaETH/bankrstrategy"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-zinc-800/50 border border-zinc-700 rounded-xl font-semibold text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300"
            >
              View code →
            </a>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">1B</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Total Supply</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400">10%</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Sell Fee</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">1,000</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">NFT Collection</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400">8%</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">To Floor Sweep</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
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
              <h3 className="text-xl font-semibold mb-2">NFT Sweeper</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                8% of fees
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Automatically buys Bankr Club NFTs from the floor, reducing supply and increasing scarcity.
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
              <h3 className="text-xl font-semibold mb-2">Holder Rewards</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
                1% of fees
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                NFT holders earn proportional rewards. Own 10 NFTs = 10 shares of the reward pool.
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
            <span className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
              Trade $BNKRSTR
            </span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium">
              10% Fee
            </span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
              Sweep Floor
            </span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
              Floor Rises
            </span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
              Repeat ↻
            </span>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Architecture</h2>
        <p className="text-zinc-500 text-center mb-12">Router-based fee collection for AMM compatibility</p>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm mb-6">
            <span className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-medium">User</span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 font-medium">BnkrstrRouter</span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 font-medium">Aerodrome</span>
            <span className="text-zinc-600">→</span>
            <span className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-medium">ETH/Tokens</span>
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-400">8% Sweeper</span>
            <span className="px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-400">1% Rewards</span>
            <span className="px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-400">1% Dev</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="relative p-12 rounded-3xl bg-gradient-to-br from-orange-500/10 via-zinc-900 to-amber-500/10 border border-zinc-800 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Check the dashboard to see live stats, trigger sweeps, and claim rewards.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-black hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
          >
            Open dashboard →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
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
          <p className="text-zinc-600 text-sm mt-1">Bankr Club Member #998 • clawdiabot.eth</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
