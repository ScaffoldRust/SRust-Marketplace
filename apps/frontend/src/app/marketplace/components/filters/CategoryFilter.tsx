import React from "react";

export function Arrow() {
  return (
    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
      <svg
        className="w-4 h-4 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

const CategoryFilter = () => {
  return (
    <div className="mb-7">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
      <div className="relative">
        <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Books</option>
          <option>Collectibles</option>
          <option>Virtual Goods</option>
          <option>Art</option>
          <option>Merchandise</option>
          <option>Accessories</option>
          <option>Education</option>
        </select>
        <Arrow />
      </div>
    </div>
  );
};

export default CategoryFilter;
