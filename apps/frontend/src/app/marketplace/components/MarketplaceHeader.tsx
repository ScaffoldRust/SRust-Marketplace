"use client";

import React from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import * as framerMotion from "framer-motion";

// Destructure what we need from framer-motion
const { motion } = framerMotion;

const MarketplaceHeader = () => {
  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-r from-primary-light/20 to-transparent px-6 md:px-12 py-10 mb-6 rounded-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl"
      >
        <div className="mb-3">
          <span className="text-primary-dark font-semibold text-sm md:text-base uppercase tracking-wider">STELLAR MARKET</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag size={24} className="text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-text">Marketplace</h1>
        </div>
        
        <p className="text-text text-lg mb-6 max-w-2xl font-medium">
          Your marketplace for digital goods. Discover unique digital assets, NFTs, and crypto merchandise from verified creators in our secure marketplace.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm font-medium">Featured Collections</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <span className="text-sm font-medium">New Arrivals</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <span className="text-sm font-medium">Best Sellers</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <span className="text-sm font-medium">Limited Editions</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MarketplaceHeader;
