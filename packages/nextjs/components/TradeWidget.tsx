"use client";

import { useState } from "react";

const TOKEN_ADDRESS = "0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A";

export const TradeWidget = () => {
  const [mode, setMode] = useState<"buy" | "sell">("buy");

  // Aerodrome swap URLs
  const buyUrl = `https://aerodrome.finance/swap?from=eth&to=${TOKEN_ADDRESS}`;
  const sellUrl = `https://aerodrome.finance/swap?from=${TOKEN_ADDRESS}&to=eth`;

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

      {/* Trade Button */}
      <a
        href={mode === "buy" ? buyUrl : sellUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full py-4 px-6 rounded-xl font-semibold text-center text-lg transition-all duration-300 hover:-translate-y-0.5 ${
          mode === "buy"
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:shadow-lg hover:shadow-green-500/25"
            : "bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:shadow-lg hover:shadow-orange-500/25"
        }`}
      >
        {mode === "buy" ? "Buy on Aerodrome →" : "Sell on Aerodrome →"}
      </a>

      {/* Alternative DEXs */}
      <div className="mt-4 flex justify-center gap-4 text-sm">
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
        <span className="text-zinc-700">·</span>
        <a
          href={`https://www.odos.xyz/swap/8453/ETH/${TOKEN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          Odos
        </a>
      </div>
    </div>
  );
};
