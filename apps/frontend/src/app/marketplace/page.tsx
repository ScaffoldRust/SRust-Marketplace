import React from "react";
import { Metadata } from "next";
import PromotionBanner from "./components/PromotionBanner";
import MarketplaceHeader from "./components/MarketplaceHeader";
import SearchBar from "./components/SearchBar";
import ProductBox from "./components/products/ProductBox";

export const metadata: Metadata = {
  title: "Marketplace | SRust Marketplace",
  description: "Browse our curated collection of blockchain merchandise, crypto collectibles, and digital goods. Secure transactions powered by Rust technology.",
  keywords: ["crypto merchandise", "blockchain collectibles", "digital goods", "NFT marketplace", "secure shopping"],
  openGraph: {
    title: "Marketplace | SRust Marketplace",
    description: "Browse our curated collection of blockchain merchandise, crypto collectibles, and digital goods.",
    url: "/marketplace",
    images: [
      {
        url: "/og-marketplace.png",
        width: 1200,
        height: 630,
        alt: "SRust Marketplace Products",
      },
    ],
  },
};

const page = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <PromotionBanner />
      <div className="w-full">
        <MarketplaceHeader />
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchBar />
        <div className="min-h-screen max-h-full overflow-hidden">
          <ProductBox />
        </div>
      </div>
    </div>
  );
};

export default page;
