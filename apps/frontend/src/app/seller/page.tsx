"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSideBar } from "./components/context/sidebarContext";
import { 
  ArrowRight, 
  Upload, 
  DollarSign, 
  BarChart4, 
  PlusCircle,
  Package,
  Settings,
  Users
} from "lucide-react";
import * as framerMotion from "framer-motion";

// Destructure what we need from framer-motion
const { motion } = framerMotion;

// Mock seller stats
const sellerStats = [
  { label: "Total Sales", value: "0", icon: <DollarSign className="text-primary" size={18} /> },
  { label: "Products Listed", value: "0", icon: <Package className="text-primary" size={18} /> },
  { label: "Customers", value: "0", icon: <Users className="text-primary" size={18} /> },
];

// Benefits of selling
const sellingBenefits = [
  {
    title: "Global Reach",
    description: "Access customers from around the world with our blockchain-powered marketplace",
    icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12H22" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke="currentColor" strokeWidth="2" />
    </svg>
  },
  {
    title: "Secure Payments",
    description: "Get paid instantly with our secure blockchain payment system",
    icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
      <path d="M19 11V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V7C5 5.89543 5.89543 5 7 5H13" stroke="currentColor" strokeWidth="2" />
      <path d="M17 5L21 9" stroke="currentColor" strokeWidth="2" />
      <path d="M21 5L17 9" stroke="currentColor" strokeWidth="2" />
    </svg>
  },
  {
    title: "Zero Platform Fees",
    description: "Keep more of your earnings with our zero-fee platform during beta",
    icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
      <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" />
    </svg>
  }
];

export default function SellerPage() {
  const router = useRouter();
  const { setActiveComponent } = useSideBar();
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Redirect to dashboard if user is already registered
  useEffect(() => {
    if (isRegistered) {
      setActiveComponent("dashboard");
      router.push("/seller/dashboard");
    }
  }, [isRegistered, router, setActiveComponent]);

  return (
    <main className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-white py-16 mb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Start Selling on <span className="text-primary">SRust Marketplace</span>
              </h1>
              <p className="text-lg text-text mb-8 max-w-lg">
                Join our community of creators and entrepreneurs selling digital assets, NFTs, and crypto merchandise.
              </p>
              <button 
                onClick={() => setIsRegistered(!isRegistered)}
                className="bg-primary hover:bg-primary-dark text-black py-3 px-8 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                {isRegistered ? "Access Seller Dashboard" : "Become a Seller"}
                <ArrowRight size={18} />
              </button>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-80 w-full bg-gradient-to-br from-primary-light/30 to-secondary/30 rounded-xl border border-primary/20 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <BarChart4 size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Seller Dashboard</h3>
                  <p className="text-text max-w-xs mx-auto">Track your sales, manage inventory, and grow your business</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Seller Dashboard or Benefits */}
      {isRegistered ? (
        <section className="container mx-auto px-4 mb-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold">Seller Dashboard</h2>
              <p className="text-text-light">Manage your products and track your sales</p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {sellerStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-text-light text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick Actions */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                  <PlusCircle size={20} className="text-primary" />
                  <span>Add New Product</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <BarChart4 size={20} className="text-text" />
                  <span>View Analytics</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings size={20} className="text-text" />
                  <span>Store Settings</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Upload size={20} className="text-text" />
                  <span>Bulk Upload</span>
                </button>
              </div>
            </div>
            
            {/* Recent Activity - Empty State */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <BarChart4 size={24} className="text-primary" />
                </div>
                <h4 className="text-lg font-medium mb-2">No Activity Yet</h4>
                <p className="text-text max-w-md mb-6">Start selling to see your activity and earnings here</p>
                <button className="bg-primary hover:bg-primary-dark text-black py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                  Add Your First Product
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Sell With Us?</h2>
            <p className="text-text max-w-2xl mx-auto">
              Our blockchain-powered marketplace offers unique advantages for sellers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {sellingBenefits.map((benefit, index) => (
              <motion.div 
                key={benefit.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-text mb-4">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
      
      {/* How It Works */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-text max-w-2xl mx-auto">
            Getting started as a seller is easy and straightforward
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Steps */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />
            
            {/* Steps */}
            <div className="space-y-12">
              {[
                {
                  title: "Create Your Account",
                  description: "Sign up and verify your identity to start selling on our platform",
                  icon: <Users className="text-black" size={20} />
                },
                {
                  title: "List Your Products",
                  description: "Upload your digital assets, set prices, and add detailed descriptions",
                  icon: <Upload className="text-black" size={20} />
                },
                {
                  title: "Get Paid Instantly",
                  description: "Receive payments directly to your wallet when customers make purchases",
                  icon: <DollarSign className="text-black" size={20} />
                },
                {
                  title: "Grow Your Business",
                  description: "Use analytics to track performance and optimize your listings",
                  icon: <BarChart4 className="text-black" size={20} />
                }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  className="flex gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-md">
                      {step.icon}
                    </div>
                    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary/20 animate-ping-slow" />
                  </div>
                  <div className="flex-1 pt-3">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-text">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Start Selling?</h2>
            <p className="text-text mb-8 max-w-2xl mx-auto">
              Join our growing community of sellers and start earning with your digital products today.
            </p>
            <button 
              onClick={() => setIsRegistered(true)}
              className="bg-primary hover:bg-primary-dark text-black py-3 px-8 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
            >
              Become a Seller
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-text max-w-2xl mx-auto">
            Everything you need to know about selling on our marketplace
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              question: "What can I sell on SRust Marketplace?",
              answer: "You can sell digital assets, NFTs, crypto merchandise, and other blockchain-related products. All items must comply with our marketplace guidelines."
            },
            {
              question: "How do I receive payments?",
              answer: "Payments are processed through our secure blockchain system and deposited directly to your connected wallet in XLM tokens."
            },
            {
              question: "Are there any fees for sellers?",
              answer: "During our beta period, we're waiving all platform fees. In the future, we'll introduce a small commission on sales."
            },
            {
              question: "How do I handle customer support?",
              answer: "You'll have access to our seller dashboard where you can communicate with customers and resolve any issues."
            }
          ].map((faq, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
              <p className="text-text">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
