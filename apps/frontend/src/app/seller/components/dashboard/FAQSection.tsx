"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

const FAQSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <HelpCircle className="text-primary" /> FAQ Management
    </h2>
    <div className="mb-6 flex justify-between items-center">
      <div className="relative">
        <input
          type="text"
          placeholder="Search FAQs..."
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary w-64"
        />
        <svg
          className="w-5 h-5 text-text-light absolute left-3 top-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <button className="bg-primary-dark text-black px-4 py-2 rounded-lg hover:bg-primary-dark/90 transition-colors text-sm">
        Add New FAQ
      </button>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="border border-gray-100 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 cursor-pointer bg-secondary/10 hover:bg-secondary/20 transition-colors">
            <h3 className="font-medium">How do I process a return or exchange?</h3>
            <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <div className="p-4 bg-white">
            <p className="text-sm text-text-light mb-4">
              To process a return or exchange, customers should contact our support team within 30 days of receiving their order. They&apos;ll need to provide their order number and reason for return. Once approved, they&apos;ll receive a prepaid shipping label via email.
            </p>
            <div className="flex justify-end gap-2">
              <button className="text-sm text-primary-dark hover:underline">Edit</button>
              <button className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FAQSection;
