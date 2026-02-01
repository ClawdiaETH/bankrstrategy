"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  devOnly?: boolean;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
    devOnly: true,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <>
      {menuLinks
        .filter(link => !link.devOnly || isLocalNetwork)
        .map(({ label, href, icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                passHref
                className={`${
                  isActive ? "text-orange-400 bg-orange-500/10" : "text-zinc-400 hover:text-white"
                } px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
    </>
  );
};

/**
 * Site header - integrated dark theme
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">🐚</span>
            <div className="hidden sm:block">
              <span className="font-bold text-white group-hover:text-orange-400 transition-colors">BankrStrategy</span>
              <span className="text-zinc-500 text-xs block">Floor sweeper on Base</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center">
            <ul className="flex items-center gap-1">
              <HeaderMenuLinks />
            </ul>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}

            {/* Mobile menu */}
            <details className="dropdown dropdown-end lg:hidden" ref={burgerMenuRef}>
              <summary className="btn btn-ghost btn-sm text-zinc-400 hover:text-white">
                <Bars3Icon className="h-5 w-5" />
              </summary>
              <ul
                className="dropdown-content mt-3 p-2 shadow-xl bg-zinc-900 border border-zinc-800 rounded-xl w-52 z-50"
                onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
              >
                <HeaderMenuLinks />
              </ul>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
};
