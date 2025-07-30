"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

const ProductsSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <ShoppingBag className="text-primary" /> Products
    </h2>
    <div className="flex justify-between items-center mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
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
        Add New Product
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-secondary/30">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Product</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Category</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Price</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Stock</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  <div className="h-full w-full bg-gray-200"></div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-text">Premium Hoodie</div>
                  <div className="text-sm text-text-light">#PRD-5862</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Apparel</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$89.99</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">24</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
              <span className="mr-2 hover:underline cursor-pointer">Edit</span>
              <span className="text-red-600 hover:underline cursor-pointer">Delete</span>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  <div className="h-full w-full bg-gray-200"></div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-text">Graphic T-Shirt</div>
                  <div className="text-sm text-text-light">#PRD-5863</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Apparel</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$29.99</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">42</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
              <span className="mr-2 hover:underline cursor-pointer">Edit</span>
              <span className="text-red-600 hover:underline cursor-pointer">Delete</span>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  <div className="h-full w-full bg-gray-200"></div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-text">Urban Pants</div>
                  <div className="text-sm text-text-light">#PRD-5864</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Apparel</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$59.99</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">18</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark">
              <span className="mr-2 hover:underline cursor-pointer">Edit</span>
              <span className="text-red-600 hover:underline cursor-pointer">Delete</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default ProductsSection;
