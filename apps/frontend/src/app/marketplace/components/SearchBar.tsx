"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <motion.div 
      className="relative max-w-2xl w-full mx-auto mb-8 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/30 shadow-lg shadow-primary/10' : 'shadow-md shadow-gray-200/60'}`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search 
            size={18} 
            className={`transition-colors ${isFocused ? 'text-primary' : 'text-text-light'}`} 
          />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search for products, categories, or keywords..."
          className="block w-full pl-11 pr-10 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-text-light/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text transition-all text-base"
        />
        
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
            aria-label="Clear search"
          >
            <X size={16} className="text-text-light hover:text-text transition-colors" />
          </button>
        )}
      </div>
      
      {/* Quick search suggestions - could be shown when focused */}
      {isFocused && searchQuery && (
        <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10">
          <div className="px-3 py-1 text-xs font-medium text-text-light">Popular Searches</div>
          {['NFT Collections', 'Crypto Wallets', 'Blockchain Books', 'Mining Equipment'].map((suggestion, index) => (
            <div 
              key={index}
              className="px-4 py-2 hover:bg-primary-light/10 cursor-pointer flex items-center gap-2 text-text"
              onClick={() => setSearchQuery(suggestion)}
            >
              <Search size={14} className="text-text-light" />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SearchBar;
