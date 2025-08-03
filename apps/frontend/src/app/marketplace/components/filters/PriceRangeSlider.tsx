"use client";

import React, { useState } from "react";

const PriceRangeSlider = () => {
  const [priceRange, setPriceRange] = useState(2500);

  return (
    <div>
      {" "}
      <div className="mb-7">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Price Range
        </h3>
        <div>
          <input
            type="range"
            min="0"
            max="5000"
            className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer slider"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0 XLM</span>
            <span>{priceRange} XLM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
