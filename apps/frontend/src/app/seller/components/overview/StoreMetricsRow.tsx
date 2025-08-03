import React from "react";

const StoreMetricsRow = () => {
  return (
    <section className="py-6 max-w-6xl  mx-auto mt-6">
      <h2 className="text-xl font-bold">Store Performance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        <div className=" w-full rounded-lg border border-[#e4e4e7] p-6">
          <p className="font-semibold mb-6 text-sm">Monthly Sales Goal</p>
          <div className="w-full bg-gray-200 rounded-lg h-2 mt-2">
            <div className="h-2 bg-black w-2/3 rounded-lg"></div>
          </div>
          <span className="text-gray-500 flex justify-between items-center text-sm mt-2">
            <span>Target: $15,000 </span>
            <span>(65%)</span>
          </span>
          <p className="text-gray-500 text-sm mt-1">This month</p>
        </div>

        <div className="w-full rounded-lg border border-[#e4e4e7] p-6">
          <p className="text-gray-500 font-semibold text-sm">Customer Growth</p>
          <div className="w-full bg-gray-200 rounded-lg h-2 mt-2">
            <div className="h-2 bg-black w-4/5 rounded-lg"></div>
          </div>
          <span className="text-gray-500 flex justify-between items-center text-sm mt-2">
            <span>Target: 500 customers</span>
            <span>(80%)</span>
          </span>
          <p className="text-gray-500 text-sm mt-1">This Quarter</p>
        </div>

        <div className="w-full rounded-lg border border-[#e4e4e7] p-6">
          <p className="text-gray-500 font-semibold text-sm">Product Reviews</p>
          <div className="w-full bg-gray-200 rounded-lg h-2 mt-2">
            <div className="h-2 bg-black w-2/5 rounded-lg"></div>
          </div>
          <span className="text-gray-500 flex justify-between items-center text-sm mt-2">
            <span>Target: 100 reviews</span>
            <span>(45%)</span>
          </span>
          <p className="text-gray-500 text-sm mt-1">This month</p>
        </div>
      </div>
    </section>
  );
};

export default StoreMetricsRow;
