"use client";

import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-base-300">
      {/* Hero Section */}
      <div className="hero min-h-[70vh]">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <div className="mb-6">
              <span className="text-8xl">🎯</span>
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
              BankrStrategy
            </h1>
            <p className="text-2xl font-semibold text-base-content/80 mb-2">The Flywheel Token for Bankr Club</p>
            <p className="text-lg text-base-content/60 mb-8 max-w-xl mx-auto">
              10% trade fee automatically sweeps floor NFTs, rewards holders, and creates unstoppable momentum.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/dashboard"
                className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Launch Dashboard
              </Link>
              <a
                href="https://github.com/ClawdiaETH/projects/blob/main/proposals/bankrstrategy-proposal.md"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Read Proposal
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-base-200/50 backdrop-blur-sm border-y border-base-300 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-black text-primary">1B</div>
              <div className="text-sm text-base-content/60 uppercase tracking-wide">Total Supply</div>
            </div>
            <div>
              <div className="text-4xl font-black text-secondary">10%</div>
              <div className="text-sm text-base-content/60 uppercase tracking-wide">Trade Fee</div>
            </div>
            <div>
              <div className="text-4xl font-black text-accent">1,000</div>
              <div className="text-sm text-base-content/60 uppercase tracking-wide">Bankr Club NFTs</div>
            </div>
            <div>
              <div className="text-4xl font-black text-success">8%</div>
              <div className="text-sm text-base-content/60 uppercase tracking-wide">To Floor Sweep</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-base-content/60 mb-12 max-w-2xl mx-auto">
            Every trade creates value for the entire ecosystem
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all hover:-translate-y-1">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-3xl">🧹</span>
                </div>
                <h3 className="card-title text-xl">NFT Sweeper</h3>
                <div className="badge badge-primary badge-lg font-bold">8% of fees</div>
                <p className="text-base-content/70 mt-2">
                  Automatically buys Bankr Club NFTs from the floor, reducing supply and increasing scarcity.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 hover:border-secondary/40 transition-all hover:-translate-y-1">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                  <span className="text-3xl">🎁</span>
                </div>
                <h3 className="card-title text-xl">Holder Rewards</h3>
                <div className="badge badge-secondary badge-lg font-bold">1% of fees</div>
                <p className="text-base-content/70 mt-2">
                  NFT holders earn proportional rewards. Own 10 NFTs = 10 shares of the reward pool.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 hover:border-accent/40 transition-all hover:-translate-y-1">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="card-title text-xl">Flywheel Effect</h3>
                <div className="badge badge-accent badge-lg font-bold">Self-reinforcing</div>
                <p className="text-base-content/70 mt-2">
                  More volume → more sweeps → higher floor → more attention → more volume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="py-16 px-4 bg-base-200/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">The Flywheel</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="badge badge-lg badge-primary p-4 font-semibold">Trade $BNKRSTR</div>
            <div className="text-2xl">→</div>
            <div className="badge badge-lg badge-neutral p-4 font-semibold">10% Fee</div>
            <div className="text-2xl">→</div>
            <div className="badge badge-lg badge-secondary p-4 font-semibold">Sweep Floor</div>
            <div className="text-2xl">→</div>
            <div className="badge badge-lg badge-accent p-4 font-semibold">Floor Rises</div>
            <div className="text-2xl hidden md:block">→</div>
            <div className="text-2xl md:hidden">↓</div>
          </div>
          <div className="flex justify-center mt-4">
            <div className="text-2xl hidden md:block">↩️ More Interest ↩️</div>
            <div className="badge badge-lg badge-success p-4 font-semibold md:hidden">Repeat!</div>
          </div>
        </div>
      </div>

      {/* Contracts */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Smart Contracts</h2>
          <p className="text-center text-base-content/60 mb-8">Deployed on Base fork for testing</p>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="text-base-content/80">
                  <th>Contract</th>
                  <th>Address</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold">$BNKRSTR Token</td>
                  <td>
                    <code className="text-xs bg-base-300 px-2 py-1 rounded">0x61ED...E315</code>
                  </td>
                  <td>Simple ERC-20 token</td>
                </tr>
                <tr>
                  <td className="font-bold">BnkrstrRouter</td>
                  <td>
                    <code className="text-xs bg-base-300 px-2 py-1 rounded">0x42DE...A199</code>
                  </td>
                  <td>Trading + 10% fee collection</td>
                </tr>
                <tr>
                  <td className="font-bold">NFT Sweeper</td>
                  <td>
                    <code className="text-xs bg-base-300 px-2 py-1 rounded">0xa3f6...3A85</code>
                  </td>
                  <td>Accumulates fees → buys NFTs</td>
                </tr>
                <tr>
                  <td className="font-bold">Holder Rewards</td>
                  <td>
                    <code className="text-xs bg-base-300 px-2 py-1 rounded">0x0400...66E8</code>
                  </td>
                  <td>NFT holder rewards</td>
                </tr>
                <tr>
                  <td className="font-bold">Bankr Club NFT</td>
                  <td>
                    <code className="text-xs bg-base-300 px-2 py-1 rounded">0x9FAb...Ce82</code>
                  </td>
                  <td>Target collection</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="alert alert-warning mt-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Currently deployed on local Base fork for testing. Mainnet deployment coming soon.</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-base-content/70 mb-8">
            Check the dashboard to see live stats, trigger sweeps, and claim rewards.
          </p>
          <Link href="/dashboard" className="btn btn-primary btn-lg shadow-lg">
            Open Dashboard →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <div>
          <p className="font-bold text-lg">
            Built by{" "}
            <a href="https://x.com/Clawdia_ETH" target="_blank" rel="noopener noreferrer" className="link link-primary">
              @Clawdia_ETH
            </a>{" "}
            🐚
          </p>
          <p className="text-base-content/60">Bankr Club Member #998 • clawdiabot.eth</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
