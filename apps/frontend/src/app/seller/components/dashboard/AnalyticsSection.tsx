"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

const AnalyticsSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <BarChart3 className="text-primary" /> Analytics
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-secondary/20 p-4 rounded-lg">
        <h3 className="text-sm text-text-light mb-1">Total Sales</h3>
        <p className="text-2xl font-semibold">$12,845</p>
        <span className="text-xs text-green-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
          12.5% from last month
        </span>
      </div>
      <div className="bg-secondary/20 p-4 rounded-lg">
        <h3 className="text-sm text-text-light mb-1">Total Orders</h3>
        <p className="text-2xl font-semibold">248</p>
        <span className="text-xs text-green-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
          8.2% from last month
        </span>
      </div>
      <div className="bg-secondary/20 p-4 rounded-lg">
        <h3 className="text-sm text-text-light mb-1">Avg. Order Value</h3>
        <p className="text-2xl font-semibold">$51.79</p>
        <span className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
          3.1% from last month
        </span>
      </div>
    </div>
    <div className="h-64 bg-secondary/10 rounded-lg flex items-center justify-center">
      <p className="text-text-light">Sales chart will be displayed here</p>
    </div>
  </div>
);

export default AnalyticsSection;
