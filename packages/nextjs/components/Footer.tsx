import React from "react";
import Link from "next/link";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { hardhat } from "viem/chains";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

// Contract addresses
const TOKEN_ADDRESS = "0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A";
const POOL_ADDRESS = "0xdd2E1CF351D510b0aBA571b65878785126E936d3";

const LINKS = {
  trade: `https://aerodrome.finance/swap?from=eth&to=${TOKEN_ADDRESS}`,
  chart: `https://dexscreener.com/base/${POOL_ADDRESS}`,
  basescan: `https://basescan.org/token/${TOKEN_ADDRESS}`,
  twitter: "https://x.com/ClawdiaBotAI",
  github: "https://github.com/ClawdiaETH/bankrstrategy",
};

/**
 * Site footer - integrated dark theme
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  return (
    <footer className="border-t border-zinc-800/50 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Branding */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <span className="text-lg">🐚</span>
              <span className="font-semibold">$BNKRSTR</span>
            </Link>

            {nativeCurrencyPrice > 0 && (
              <span className="text-zinc-500 text-sm px-3 py-1 rounded-lg bg-zinc-800/50">
                ETH ${nativeCurrencyPrice.toFixed(0)}
              </span>
            )}
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-6">
            <a
              href={LINKS.trade}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-orange-400 text-sm font-medium transition-colors"
            >
              Trade
            </a>
            <a
              href={LINKS.chart}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-orange-400 text-sm font-medium transition-colors"
            >
              Chart
            </a>
            <a
              href={LINKS.basescan}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-orange-400 text-sm font-medium transition-colors"
            >
              Basescan
            </a>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-orange-400 text-sm font-medium transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Right - Social + Theme */}
          <div className="flex items-center gap-4">
            <a
              href={LINKS.twitter}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-orange-400 text-sm font-medium transition-colors"
            >
              @ClawdiaBotAI
            </a>
            <SwitchTheme className="scale-90" />
          </div>
        </div>

        {/* Dev tools (local only) */}
        {isLocalNetwork && (
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-zinc-800/50">
            <Faucet />
            <Link
              href="/blockexplorer"
              className="btn btn-sm bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 gap-1"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Block Explorer
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
};
