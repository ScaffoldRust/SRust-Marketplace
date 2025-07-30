import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";

export interface Order {
  id: number;
  product: string;
  customer: string;
  price: string;
  status: "Paid" | "Processing" | "Shipped";
}

const orders: Order[] = [
  {
    id: 8832,
    product: "Premium Hoodie (Black)",
    customer: "John D.",
    price: "200 XLM",
    status: "Paid",
  },
  {
    id: 8831,
    product: "Urban Pants (Gray)",
    customer: "Sarah M.",
    price: "300 XLM",
    status: "Processing",
  },
  {
    id: 8830,
    product: "Graphic T-Shirt (White)",
    customer: "Mike R.",
    price: "150 XLM",
    status: "Shipped",
  },
];

const OrderListItem = () => {
  return (
    <div className="border p-6 rounded-lg border-[#E4E4E7]">
      {orders.map((order) => (
        <OrderStatusBadge key={order.id} order={order} />
      ))}
    </div>
  );
};

export default OrderListItem;
