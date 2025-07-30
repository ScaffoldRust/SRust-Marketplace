import React from "react";
import { Arrow } from "./CategoryFilter";

const RatingFilter = () => {
  return (
    <div className="mb-2">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Customer Rating
      </h3>
      <div className="relative">
        <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
          <option>4 stars & up</option>
          <option>3 stars & up</option>
          <option>2 stars & up</option>
          <option>1 star & up</option>
        </select>
        <Arrow />
      </div>
    </div>
  );
};

export default RatingFilter;
