"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

const ChatSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <MessageSquare className="text-primary" /> Customer Messages
    </h2>
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3 border border-gray-100 rounded-lg overflow-hidden">
        <div className="bg-secondary/10 p-4">
          <h3 className="font-medium mb-2">Conversations</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary w-full text-sm"
            />
            <svg
              className="w-4 h-4 text-text-light absolute left-2.5 top-3"
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
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 bg-primary/5 cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium">John Doe</h4>
              <span className="text-xs text-text-light">2m ago</span>
            </div>
            <p className="text-sm text-text-light truncate">
              I have a question about my recent order #8832...
            </p>
          </div>
          <div className="p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium">Sarah Miller</h4>
              <span className="text-xs text-text-light">1h ago</span>
            </div>
            <p className="text-sm text-text-light truncate">
              Is this product available in blue color?
            </p>
          </div>
          <div className="p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium">Robert Johnson</h4>
              <span className="text-xs text-text-light">3h ago</span>
            </div>
            <p className="text-sm text-text-light truncate">
              Thank you for the quick shipping!
            </p>
          </div>
        </div>
      </div>
      
      <div className="md:w-2/3 border border-gray-100 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-secondary/10 p-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">John Doe</h3>
            <p className="text-xs text-text-light">Order #8832 - Premium Hoodie (Black)</p>
          </div>
          <button className="text-sm text-primary-dark hover:underline">View Order</button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[300px] max-h-[400px]">
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">Hello, I have a question about my recent order #8832. When can I expect it to be shipped?</p>
              <span className="text-xs text-text-light mt-1 block">10:24 AM</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">Hi John, thanks for reaching out! Your order has been processed and will be shipped tomorrow. You&apos;ll receive a tracking number via email.</p>
              <span className="text-xs text-text-light mt-1 block">10:30 AM</span>
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">Great, thank you for the quick response!</p>
              <span className="text-xs text-text-light mt-1 block">10:32 AM</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
            />
            <button className="bg-primary text-black px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ChatSection;
