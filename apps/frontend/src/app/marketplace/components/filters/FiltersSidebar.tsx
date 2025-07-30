"use client";

import React, { useState } from "react";
import CategoryFilter from "./CategoryFilter";
import PriceRangeSlider from "./PriceRangeSlider";
import SortDropdown from "./SortDropdown";
import RatingFilter from "./RatingFilter";
import { Filter, X, ChevronDown } from "lucide-react";

const FiltersSidebar = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-full md:w-[25%] hidden md:block pl-6 md:pl-12 pr-6 py-4">
        <div className="border border-gray-100 rounded-xl p-6 shadow-sm bg-white sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text flex items-center gap-2">
              <Filter size={18} className="text-primary" />
              Filters
            </h2>
            <button 
              className="text-text-light hover:text-primary text-sm font-medium transition-colors"
              onClick={() => {
                // Reset filters functionality would go here
              }}
            >
              Reset
            </button>
          </div>

          <div className="space-y-6">
            <CategoryFilter />
            <PriceRangeSlider />
            <SortDropdown />
            <RatingFilter />
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Filter Button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:hidden z-30">
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full shadow-lg"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>
      
      {/* Mobile Filter Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text flex items-center gap-2">
                <Filter size={18} className="text-primary" />
                Filters
              </h2>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-text-light" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between cursor-pointer py-2">
                  <h3 className="font-medium">Categories</h3>
                  <ChevronDown size={16} className="text-text-light" />
                </div>
                <div className="pt-2">
                  <CategoryFilter />
                </div>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between cursor-pointer py-2">
                  <h3 className="font-medium">Price Range</h3>
                  <ChevronDown size={16} className="text-text-light" />
                </div>
                <div className="pt-2">
                  <PriceRangeSlider />
                </div>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between cursor-pointer py-2">
                  <h3 className="font-medium">Sort By</h3>
                  <ChevronDown size={16} className="text-text-light" />
                </div>
                <div className="pt-2">
                  <SortDropdown />
                </div>
              </div>
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between cursor-pointer py-2">
                  <h3 className="font-medium">Rating</h3>
                  <ChevronDown size={16} className="text-text-light" />
                </div>
                <div className="pt-2">
                  <RatingFilter />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 border border-gray-200 py-2.5 px-4 rounded-lg text-text-light"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Apply filters logic would go here
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 px-4 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FiltersSidebar;
