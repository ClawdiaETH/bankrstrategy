import React from "react";
import Link from "next/link";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

// Contract addresses
const TOKEN_ADDRESS = "0xb80bF44D8bC12b4d1c3b457415e94e554F35d71A";
const POOL_ADDRESS = "0xdd2E1CF351D510b0aBA571b65878785126E936d3";

/**
 * Site footer
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="btn btn-primary btn-sm font-normal gap-1 cursor-auto">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
          <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
        </div>
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full flex-wrap">
            <div className="flex items-center gap-1">
              <span>🦞</span>
              <span className="font-semibold">$BNKRSTR</span>
            </div>
            <span>·</span>
            <a href={`https://dexscreener.com/base/${POOL_ADDRESS}`} target="_blank" rel="noreferrer" className="link">
              Chart
            </a>
            <span>·</span>
            <a
              href={`https://aerodrome.finance/swap?to=${TOKEN_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              Trade
            </a>
            <span>·</span>
            <a href={`https://basescan.org/token/${TOKEN_ADDRESS}`} target="_blank" rel="noreferrer" className="link">
              Basescan
            </a>
            <span>·</span>
            <a href="https://x.com/Clawdia_ETH" target="_blank" rel="noreferrer" className="link">
              @Clawdia_ETH
            </a>
          </div>
        </ul>
      </div>
    </div>
  );
};
