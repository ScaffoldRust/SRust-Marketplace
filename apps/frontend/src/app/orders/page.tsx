"use client";

import React, { useState } from "react";
import { ShoppingBag, Search, Filter, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const orders = [
    {
      id: "ORD-2023-1234",
      date: "July 28, 2025",
      status: "Delivered",
      total: "$129.99",
      items: [
        {
          name: "Arcadis Blue Shirt",
          quantity: 1,
          price: "$59.99",
          image: "/products/arcadis-blue.jpg"
        },
        {
          name: "Harmonia Gray Shirt",
          quantity: 1,
          price: "$69.99",
          image: "/products/harmonia-gray.jpg"
        }
      ]
    },
    {
      id: "ORD-2023-1189",
      date: "July 15, 2025",
      status: "Shipped",
      total: "$59.99",
      items: [
        {
          name: "Arcadis Blue Shirt",
          quantity: 1,
          price: "$59.99",
          image: "/products/arcadis-blue.jpg"
        }
      ]
    },
    {
      id: "ORD-2023-1056",
      date: "June 30, 2025",
      status: "Processing",
      total: "$89.99",
      items: [
        {
          name: "Harmonia Gray Shirt",
          quantity: 1,
          price: "$69.99",
          image: "/products/harmonia-gray.jpg"
        },
        {
          name: "Digital Asset Pack",
          quantity: 1,
          price: "$19.99",
          image: "/products/digital-asset.jpg"
        }
      ]
    },
    {
      id: "ORD-2023-0987",
      date: "June 15, 2025",
      status: "Delivered",
      total: "$149.99",
      items: [
        {
          name: "Premium Digital Collection",
          quantity: 1,
          price: "$149.99",
          image: "/products/premium-collection.jpg"
        }
      ]
    }
  ];
  
  const filteredOrders = orders.filter(order => {
    // Filter by tab
    if (activeTab !== "all" && order.status.toLowerCase() !== activeTab) {
      return false;
    }
    
    // Filter by search
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-text flex items-center gap-2">
          <ShoppingBag className="text-primary" /> My Orders
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex overflow-x-auto pb-2 md:pb-0">
              <button 
                className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${activeTab === "all" ? "bg-primary-dark text-white" : "bg-secondary/20 hover:bg-secondary/30 transition-colors"}`}
                onClick={() => setActiveTab("all")}
              >
                All Orders
              </button>
              <button 
                className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${activeTab === "processing" ? "bg-primary-dark text-white" : "bg-secondary/20 hover:bg-secondary/30 transition-colors"}`}
                onClick={() => setActiveTab("processing")}
              >
                Processing
              </button>
              <button 
                className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${activeTab === "shipped" ? "bg-primary-dark text-white" : "bg-secondary/20 hover:bg-secondary/30 transition-colors"}`}
                onClick={() => setActiveTab("shipped")}
              >
                Shipped
              </button>
              <button 
                className={`px-4 py-2 rounded-lg mr-2 whitespace-nowrap ${activeTab === "delivered" ? "bg-primary-dark text-white" : "bg-secondary/20 hover:bg-secondary/30 transition-colors"}`}
                onClick={() => setActiveTab("delivered")}
              >
                Delivered
              </button>
              <button 
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === "cancelled" ? "bg-primary-dark text-white" : "bg-secondary/20 hover:bg-secondary/30 transition-colors"}`}
                onClick={() => setActiveTab("cancelled")}
              >
                Cancelled
              </button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-text-light w-5 h-5" />
              </div>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-secondary/10 transition-colors">
                <Filter className="w-5 h-5 text-text-light" />
              </button>
            </div>
          </div>
          
          {filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="bg-secondary/10 p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Order {order.id}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          order.status === "Delivered" ? "bg-green-100 text-green-800" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                          order.status === "Processing" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-light">Placed on {order.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">Total: {order.total}</p>
                      <button className="text-primary-dark hover:underline text-sm">View Details</button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-sm font-medium mb-3">Items in this order:</h4>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="h-16 w-16 bg-secondary/20 rounded-md relative overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              style={{ objectFit: "cover" }}
                              onError={(e) => {
                                e.currentTarget.src = "/products/placeholder.jpg";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{item.name}</h5>
                            <p className="text-sm text-text-light">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{item.price}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="space-x-2">
                        {order.status === "Delivered" && (
                          <button className="px-4 py-2 bg-primary-dark text-black rounded-lg hover:bg-primary-dark/90 transition-colors text-sm">
                            Leave Review
                          </button>
                        )}
                        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-secondary/10 transition-colors text-sm">
                          Track Order
                        </button>
                      </div>
                      {order.status !== "Delivered" && order.status !== "Cancelled" && (
                        <button className="text-red-600 hover:underline text-sm">
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center mt-8">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-secondary/10 transition-colors mr-2">
                  <ArrowLeft className="w-5 h-5 text-text-light" />
                </button>
                <button className="px-4 py-2 bg-primary-dark text-black rounded-lg hover:bg-primary-dark/90 transition-colors mx-1">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-secondary/10 transition-colors mx-1">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-secondary/10 transition-colors mx-1">
                  3
                </button>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-secondary/10 transition-colors ml-2">
                  <ArrowRight className="w-5 h-5 text-text-light" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-text-light mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No orders found</h3>
              <p className="text-text-light mb-6">
                {searchQuery 
                  ? `No orders matching "${searchQuery}"`
                  : activeTab !== "all" 
                    ? `You don't have any ${activeTab} orders yet`
                    : "You haven't placed any orders yet"
                }
              </p>
              {searchQuery && (
                <button 
                  className="text-primary-dark hover:underline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
