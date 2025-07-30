import React from "react";
import { Order } from "./OrderListItem";

const getStatusBadge = (status: Order["status"]) => {
  switch (status) {
    case "Paid":
      return "bg-[#22C55E] text-black";
    case "Processing":
      return "bg-[#EAB308] text-black";
    case "Shipped":
      return "bg-[#3B82F6] text-black";
  }
};

interface StatusBadge {
  order: Order;
}

const OrderStatusBadge: React.FC<StatusBadge> = ({ order }) => {
  return (
    <div
      key={order.id}
      className="border-b border-[#E4E4E7] py-4 flex justify-between items-center"
    >
      <div>
        <p className="font-medium">{order.product}</p>
        <p className="text-gray-500 text-sm">
          Order #{order.id} - {order.customer}
        </p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-medium">{order.price}</span>
        <span
          className={`px-3 py-1 text-xs rounded-lg ${getStatusBadge(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </div>
    </div>
  );
};

export default OrderStatusBadge;
