import React from "react";
import OrderListItem from "./OrderListItem";

function RecentOrdersList() {
  return (
    <section className="rounded-lg max-w-6xl mx-auto mt-6">
      <div className="flex py-4 justify-between">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        <button className="px-4 py-2 border border-[#E4E4E7] rounded-lg text-sm">
          View All Orders
        </button>
      </div>

      <OrderListItem />
    </section>
  );
}

export default RecentOrdersList;
