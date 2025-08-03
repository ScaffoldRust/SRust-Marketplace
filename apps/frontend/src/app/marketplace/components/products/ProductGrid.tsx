"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { Products } from "@/app/types/products";
import * as framerMotion from "framer-motion";

// Destructure what we need from framer-motion
const { motion } = framerMotion;

interface ProductGridProps {
  products: Products[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants} className="h-full">
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C3.44772 7 3 7.44772 3 8V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V8C21 7.44772 20.5523 7 20 7Z" stroke="currentColor" strokeWidth="2" className="text-primary"/>
              <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" strokeWidth="2" className="text-primary"/>
              <path d="M12 12V15" stroke="currentColor" strokeWidth="2" className="text-primary"/>
              <path d="M12 18.01L12.01 17.9989" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">No Products Found</h3>
          <p className="text-text max-w-md">We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search terms.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProductGrid;
