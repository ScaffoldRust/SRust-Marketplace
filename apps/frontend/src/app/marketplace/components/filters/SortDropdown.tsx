import React from "react";
import { Arrow } from "./CategoryFilter";

const SortDropdown = () => {
  return (
    <div className="mb-7">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Sort By</h3>
      <div className="relative">
        <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
          <option>Featured</option>
          <option>Price Low to High</option>
          <option>Price High to Low</option>
          <option>Highest Rated</option>
        </select>
        <Arrow />
      </div>
    </div>
  );
};

export default SortDropdown;
