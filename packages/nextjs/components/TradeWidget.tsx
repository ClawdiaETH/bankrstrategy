"use client";

import { useState } from "react";
import { Swap, SwapAmountInput, SwapButton, SwapMessage, SwapToast } from "@coinbase/onchainkit/swap";
import type { Token } from "@coinbase/onchainkit/token";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const TOKEN_ADDRESS = "0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A";

// Token definitions
const ETH: Token = {
  name: "Ethereum",
  address: "",
  symbol: "ETH",
  decimals: 18,
  image:
    "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  chainId: 8453,
};

const BNKRSTR: Token = {
  name: "BankrStrategy",
  address: TOKEN_ADDRESS,
  symbol: "BNKRSTR",
  decimals: 18,
  image: "https://bankrstrategy.vercel.app/bnkrstr-token-256.png",
  chainId: 8453,
};

export const TradeWidget = () => {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const { isConnected } = useAccount();

  const fromToken = mode === "buy" ? ETH : BNKRSTR;
  const toToken = mode === "buy" ? BNKRSTR : ETH;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mode Toggle */}
      <div className="flex mb-4 p-1 bg-zinc-800/50 rounded-xl">
        <button
          onClick={() => setMode("buy")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            mode === "buy" ? "bg-green-500 text-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode("sell")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            mode === "sell" ? "bg-orange-500 text-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Info Box */}
      <div
        className={`p-4 rounded-xl mb-4 ${
          mode === "buy" ? "bg-green-500/10 border border-green-500/20" : "bg-orange-500/10 border border-orange-500/20"
        }`}
      >
        {mode === "buy" ? (
          <div className="text-center">
            <p className="text-green-400 font-medium mb-1">🟢 Buys are FREE</p>
            <p className="text-zinc-400 text-sm">No fee on purchases</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-orange-400 font-medium mb-1">🔥 10% Sell Fee</p>
            <p className="text-zinc-400 text-sm">8% sweeps floor · 1% to holders · 1% dev</p>
          </div>
        )}
      </div>

      {/* Swap Widget or Connect Button */}
      {isConnected ? (
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <Swap experimental={{ useAggregator: true }}>
            <SwapAmountInput label="Sell" token={fromToken} type="from" />
            <SwapAmountInput label="Buy" token={toToken} type="to" />
            <SwapButton
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                mode === "buy"
                  ? "!bg-gradient-to-r !from-green-500 !to-emerald-500 !text-black"
                  : "!bg-gradient-to-r !from-orange-500 !to-amber-500 !text-black"
              }`}
            />
            <SwapMessage />
          </Swap>
          <SwapToast />
        </div>
      ) : (
        <div className="text-center">
          <ConnectButton />
        </div>
      )}

      {/* Alternative DEXs */}
      <div className="mt-4 flex justify-center gap-4 text-sm">
        <a
          href={`https://aerodrome.finance/swap?from=eth&to=${TOKEN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          Aerodrome
        </a>
        <span className="text-zinc-700">·</span>
        <a
          href={`https://app.uniswap.org/swap?chain=base&outputCurrency=${TOKEN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          Uniswap
        </a>
        <span className="text-zinc-700">·</span>
        <a
          href={`https://matcha.xyz/tokens/base/${TOKEN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          Matcha
        </a>
      </div>
    </div>
  );
};
