"use client";

import React, { useState } from "react";
import ProductGrid from "./ProductGrid";
import { Products } from "@/app/types/products";
import { Grid, List, SlidersHorizontal, ChevronDown, Star, ShoppingBag } from "lucide-react";
import Pagination from "./Pagination";
import * as framerMotion from "framer-motion";
import Image from "next/image";

// Destructure what we need from framer-motion
const { motion } = framerMotion;

// Include products from the homepage and ensure all have proper images
const mockProducts: Products[] = [
  {
    id: 1,
    name: "Arcadis Blue Shirt",
    description: "Premium blue shirt featuring the Arcadis logo, crafted for comfort and style. Perfect for developers and tech enthusiasts who want to showcase their passion with a modern, professional look.",
    price: 45.99,
    image: "/products/arcadis-blue-shirt.png",
    category: "Clothing",
    rating: 4.7,
  },
  {
    id: 2,
    name: "Beige Harmonia Cap",
    description: "Minimalist beige cap embroidered with the Harmonia insignia. Lightweight, adjustable, and ideal for everyday wear—blend fashion and blockchain culture effortlessly.",
    price: 29.99,
    image: "/products/beige-harmonia-cap.png",
    category: "Accessories",
    rating: 4.5,
  },
  {
    id: 3,
    name: "Soroban Learning Book",
    description: "Comprehensive guide to Soroban smart contracts. Packed with real-world examples, this book is your essential resource for mastering blockchain development on Stellar.",
    price: 59.99,
    image: "/products/book-for-learning-soroban.png",
    category: "Education",
    rating: 4.8,
  },
  {
    id: 4,
    name: "Harmonia Gray Shirt",
    description: "A sleek, modern gray shirt by Harmonia. Designed for comfort and versatility, it’s a wardrobe staple for blockchain professionals and fans alike.",
    price: 42.99,
    image: "/products/harmonia-gray-shirt.png",
    category: "Clothing",
    rating: 4.6,
  },
  {
    id: 5,
    name: "Stellar T-Shirt",
    description: "Soft cotton t-shirt with the iconic Stellar logo. Show your support for the Stellar network in style—great for events, meetups, or daily wear.",
    category: "Clothing",
    price: 35.99,
    image: "/products/arcadis-blue-shirt.png",
    rating: 4.5,
  },
  {
    id: 6,
    name: "Crypto Hardware Wallet",
    description: "State-of-the-art hardware wallet for securing your digital assets. Features robust encryption and a sleek, portable design for peace of mind on the go.",
    category: "Electronics",
    price: 89.99,
    image: "/products/harmonia-gray-shirt.png",
    rating: 4.9,
  },
  {
    id: 7,
    name: "Blockchain Guide Book",
    description: "Essential reading for blockchain beginners and experts. Covers fundamental concepts, industry use-cases, and advanced strategies for success in the crypto space.",
    category: "Books",
    price: 49.99,
    image: "/products/book-for-learning-soroban.png",
    rating: 4.2,
  },
  {
    id: 8,
    name: "Mining Rig Model",
    description: "Highly detailed scale model of a cryptocurrency mining rig. A perfect collectible or desk accessory for crypto miners and enthusiasts.",
    category: "Collectibles",
    price: 129.99,
    image: "/products/harmonia-gray-shirt.png",
    rating: 4.7,
  },
  {
    id: 9,
    name: "NFT Art Print",
    description: "Limited edition art print inspired by top-selling NFTs. Vivid colors and premium materials make this a striking addition to any digital art collection.",
    category: "Art",
    price: 79.99,
    image: "/products/book-for-learning-soroban.png",
    rating: 4.6,
  },
  {
    id: 10,
    name: "Crypto Hoodie",
    description: "Ultra-soft hoodie for crypto enthusiasts. Features subtle blockchain-themed graphics and a cozy fit—ideal for hackathons, meetups, or relaxing at home.",
    category: "Clothing",
    price: 54.99,
    image: "/products/arcadis-blue-shirt.png",
    rating: 4.4,
  },
  {
    id: 11,
    name: "Crypto Collectible Coin",
    description: "Limited edition metal coin with intricate crypto-inspired design. A must-have keepsake for collectors and blockchain supporters.",
    category: "Collectibles",
    price: 24.99,
    image: "/products/beige-harmonia-cap.png",
    rating: 4.8,
  },
  {
    id: 12,
    name: "Blockchain Developer Cap",
    description: "Premium snapback cap for blockchain developers. Durable, stylish, and perfect for hackathons or daily wear in the digital age.",
    category: "Accessories",
    price: 27.99,
    image: "/products/beige-harmonia-cap.png",
    rating: 4.3,
  },
  {
    id: 13,
    name: "Bitcoin Cap",
    description: "Classic black cap featuring the iconic Bitcoin logo in vibrant orange. Adjustable fit, breathable fabric—ideal for crypto fans and trendsetters alike.",
    category: "Accessories",
    price: 32.99,
    image: "/products/bitcoin-cap.png",
    rating: 4.7,
  },
  {
    id: 14,
    name: "Escrow Theme Coat",
    description: "Sophisticated coat inspired by secure digital escrow. Modern cut, premium materials, and subtle crypto-themed lining—perfect for making a statement at any event.",
    category: "Clothing",
    price: 119.99,
    image: "/products/escrow-theme-coat.png",
    rating: 4.9,
  },
];

const ProductBox: React.FC = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const productsPerPage = 8;
  const totalPages = Math.ceil(mockProducts.length / productsPerPage);

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = mockProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePagination = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      {/* Filters and Sort Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-secondary transition-colors"
          >
            <SlidersHorizontal size={18} />
            <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          <div className="relative ml-auto sm:ml-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg text-sm font-medium text-text hover:bg-secondary/80 transition-colors shadow-sm"
            >
              <span>Sort By</span>
              <ChevronDown size={16} className={sortOpen ? "rotate-180 transition-transform duration-300" : "transition-transform duration-300"} />
            </button>

            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white shadow-md rounded-lg overflow-hidden z-10 border border-gray-100"
              >
                <ul className="py-1">
                  <li className="px-4 py-2.5 hover:bg-secondary cursor-pointer text-sm font-medium">
                    Price: Low to High
                  </li>
                  <li className="px-4 py-2.5 hover:bg-secondary cursor-pointer text-sm font-medium">
                    Price: High to Low
                  </li>
                  <li className="px-4 py-2.5 hover:bg-secondary cursor-pointer text-sm font-medium">
                    Most Popular
                  </li>
                  <li className="px-4 py-2.5 hover:bg-secondary cursor-pointer text-sm font-medium">
                    Highest Rated
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm sticky top-24 overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`p-2.5 rounded-md ${view === "grid" ? "bg-primary-dark text-white" : "text-gray-500 hover:text-text"}`}
            aria-label="Grid view"
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2.5 rounded-md ${view === "list" ? "bg-primary-dark text-white" : "text-gray-500 hover:text-text"}`}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "280px" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="w-70 shrink-0 hidden md:block"
          >
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm sticky top-24">
              <h3 className="font-medium text-lg mb-4 text-text">Categories</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cat-all"
                    className="rounded text-primary-dark focus:ring-primary-dark"
                    defaultChecked
                  />
                  <label htmlFor="cat-all" className="ml-2.5 text-sm font-medium text-text">
                    All Categories
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cat-electronics"
                    className="rounded text-primary-dark focus:ring-primary-dark"
                  />
                  <label htmlFor="cat-electronics" className="ml-2.5 text-sm font-medium text-text">
                    Electronics
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cat-clothing"
                    className="rounded text-primary-dark focus:ring-primary-dark"
                  />
                  <label htmlFor="cat-clothing" className="ml-2.5 text-sm font-medium text-text">
                    Clothing
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cat-books"
                    className="rounded text-primary-dark focus:ring-primary-dark"
                  />
                  <label htmlFor="cat-books" className="ml-2.5 text-sm font-medium text-text">
                    Books
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cat-collectibles"
                    className="rounded text-primary-dark focus:ring-primary-dark"
                  />
                  <label htmlFor="cat-collectibles" className="ml-2.5 text-sm font-medium text-text">
                    Collectibles
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 my-5"></div>

              <h3 className="font-medium text-lg mb-4 text-text">Price Range</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  defaultValue="500"
                  className="slider w-full accent-primary-dark"
                />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-text">0 XLM</span>
                  <span className="text-sm font-medium text-text">1000 XLM</span>
                </div>
              </div>

              <div className="border-t border-gray-200 my-5"></div>

              <h3 className="font-medium text-lg mb-4 text-text">Rating</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rating-4"
                    className="rounded text-primary-dark focus:ring-primary-dark"
                  />
                  <label htmlFor="rating-4" className="ml-2.5 text-sm font-medium text-text flex items-center">
                    <span className="flex mr-2">
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </span>
                    & Up
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rating-3"
                    className="rounded text-primary-dark focus:ring-primary-dark"
                  />
                  <label htmlFor="rating-3" className="ml-2.5 text-sm font-medium text-text flex items-center">
                    <span className="flex mr-2">
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </span>
                    & Up
                  </label>
                </div>
              </div>

              <button className="w-full mt-6 bg-primary-dark text-white py-2.5 rounded-lg hover:bg-primary-dark/90 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02]">
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Products Grid/List */}
        <div className="flex-1">
          {view === "grid" ? (
            <ProductGrid products={currentProducts} />
          ) : (
            <div className="space-y-6">
              {currentProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  className="bg-white border border-gray-100 rounded-xl p-5 flex gap-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Product Image */}
                  <div className="w-40 h-40 bg-secondary/30 rounded-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-light/5 to-transparent z-0" />
                    <Image 
                      src={product.name === "Arcadis Blue Shirt" ? "/products/arcadis-blue-shirt.png" : 
                           product.name === "Harmonia Gray Shirt" ? "/products/harmonia-gray-shirt.png" : 
                           product.image || `/products/arcadis-blue-shirt.png`}
                      alt={product.name}
                      fill
                      priority
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                      onError={(e) => {
                        console.log(`Image error for ${product.name}: ${product.image}`);
                        // Special handling for known problematic products
                        if (product.name === "Arcadis Blue Shirt") {
                          (e.currentTarget as HTMLImageElement).src = "/products/arcadis-blue-shirt.png";
                          console.log(`Using specific image for ${product.name}`);
                          return;
                        } else if (product.name === "Harmonia Gray Shirt") {
                          (e.currentTarget as HTMLImageElement).src = "/products/harmonia-gray-shirt.png";
                          console.log(`Using specific image for ${product.name}`);
                          return;
                        }
                        // For specific products, use specific fallbacks
                        if (product.name.toLowerCase().includes("shirt")) {
                          (e.currentTarget as HTMLImageElement).src = "/products/arcadis-blue-shirt.png";
                          console.log(`Using shirt fallback for ${product.name}`);
                        } else if (product.name.toLowerCase().includes("cap") || product.name.toLowerCase().includes("hat")) {
                          (e.currentTarget as HTMLImageElement).src = "/products/beige-harmonia-cap.png";
                          console.log(`Using cap fallback for ${product.name}`);
                        } else if (product.name.toLowerCase().includes("book")) {
                          (e.currentTarget as HTMLImageElement).src = "/products/book-for-learning-soroban.png";
                          console.log(`Using book fallback for ${product.name}`);
                        } else {
                          // Use one of the four available images as fallback
                          const fallbackImages = [
                            "/products/arcadis-blue-shirt.png",
                            "/products/beige-harmonia-cap.png",
                            "/products/book-for-learning-soroban.png",
                            "/products/harmonia-gray-shirt.png"
                          ];
                          const randomIndex = Math.floor(Math.random() * fallbackImages.length);
                          (e.currentTarget as HTMLImageElement).src = fallbackImages[randomIndex];
                          console.log(`Using random fallback for ${product.name}: ${fallbackImages[randomIndex]}`);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between">
                      <div>
                        <span className="inline-block mb-1.5 text-xs font-medium text-primary-dark bg-primary/10 px-2.5 py-0.5 rounded-full">
                          {product.category}
                        </span>
                        <h3 className="font-semibold text-lg text-text">{product.name}</h3>
                      </div>
                      <p className="font-bold text-primary-dark">{product.price} XLM</p>
                    </div>
                    
                    <p className="text-text-light text-sm mt-2.5 line-clamp-2">
                      {product.description || "A high-quality product from our marketplace."}
                    </p>
                    
                    <div className="flex items-center mt-auto pt-4 justify-between">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            size={14}
                            className={i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                            fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-text">{product.rating}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="bg-primary-dark hover:bg-primary-dark/90 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-[1.02]">
                          <ShoppingBag size={14} className="transition-transform group-hover:animate-bounce" />
                          Add to Cart
                        </button>
                        <button className="border border-gray-300 py-2 px-4 rounded-lg hover:bg-secondary hover:border-primary-dark text-sm font-medium transition-all duration-300 flex items-center transform hover:scale-[1.02] hover:shadow-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pagination={handlePagination}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductBox;
