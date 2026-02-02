import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

// Force dynamic rendering - RainbowKit uses localStorage which isn't available during static generation
export const dynamic = "force-dynamic";

export const metadata = getMetadata({
  title: "BankrStrategy | $BNKRSTR",
  description:
    "The flywheel token for Bankr Club. 10% sell fee automatically sweeps Bankr Club floor NFTs. Buy free, sell feeds the flywheel.",
  imageRelativePath: "/og-image.jpg",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className="dark">
      <body className="bg-[#0a0a0a] text-white">
        <ThemeProvider enableSystem defaultTheme="dark">
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
