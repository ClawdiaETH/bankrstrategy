import type { Metadata } from "next";

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.jpg",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}): Metadata => {
  const imageUrl = `${baseUrl}${imageRelativePath}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s",
    },
    description: description,
    keywords: ["BankrStrategy", "BNKRSTR", "Bankr Club", "NFT", "DeFi", "Base", "AI agents", "cryptocurrency"],
    authors: [{ name: "Clawdia", url: "https://twitter.com/Clawdia_ETH" }],
    creator: "Clawdia",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl,
      siteName: "BankrStrategy",
      title: {
        default: title,
        template: "%s",
      },
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "BankrStrategy - The flywheel token for Bankr Club",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@Clawdia_ETH",
      creator: "@Clawdia_ETH",
      title: {
        default: title,
        template: "%s",
      },
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "BankrStrategy - The flywheel token for Bankr Club",
        },
      ],
    },
    icons: {
      icon: [
        {
          url: "/favicon.png",
          sizes: "32x32",
          type: "image/png",
        },
      ],
    },
    other: {
      "theme-color": "#0a0a0a",
    },
  };
};
