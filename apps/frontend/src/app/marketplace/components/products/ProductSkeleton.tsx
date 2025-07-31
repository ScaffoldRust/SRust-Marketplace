"use client";

import React from "react";

export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200 rounded-t-xl" />
      
      {/* Content placeholders */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-3/4 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-lg" />
        </div>
        
        {/* Rating */}
        <div className="flex space-x-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-4 bg-gray-200 rounded-full" />
          ))}
          <div className="h-4 w-8 bg-gray-200 rounded-full ml-2" />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2 mt-3">
          <div className="h-10 bg-primary/20 rounded-lg flex-1" />
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
