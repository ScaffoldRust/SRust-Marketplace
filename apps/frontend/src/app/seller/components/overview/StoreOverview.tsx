import React from "react";
import StoreMetricsRow from "./StoreMetricsRow";
import MetricCard from "./MetricCard";
import RecentOrdersList from "../orders/RecentOrdersList";

const StoreOverview = () => {
  return (
    <div className="w-full mr-6 md:mr-12">
      <div className="min-h-screen mx-auto px-5 py-4">
        <div className=" max-w-6xl mx-auto">
          <h2 className="text-2xl mb-5 font-bold">Store Overview</h2>
        </div>
        <MetricCard />
        <RecentOrdersList />
        <StoreMetricsRow />
      </div>
    </div>
  );
};

export default StoreOverview;
