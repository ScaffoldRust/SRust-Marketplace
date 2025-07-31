"use client";

import React, { useState } from "react";
import { Tag, X, ArrowRight } from "lucide-react";
import * as framerMotion from "framer-motion";

// Destructure what we need from framer-motion
const { motion } = framerMotion;

const PromotionBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-primary to-primary-dark text-white w-full px-8 md:px-12 py-3 relative"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <Tag size={18} className="text-white/80" />
          <h2 className="font-semibold text-lg">
            Summer Sale: Up to 50% off on selected items!
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <p className="text-white/90 text-sm font-medium">Use code <span className="bg-white/20 px-2 py-0.5 rounded text-white">SUMMER50</span> at checkout</p>
          <button 
            className="hidden sm:flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-sm font-medium"
            aria-label="View deals"
          >
            View Deals
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
      
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close promotion banner"
      >
        <X size={16} className="text-white/80" />
      </button>
    </motion.div>
  );
};

export default PromotionBanner;
