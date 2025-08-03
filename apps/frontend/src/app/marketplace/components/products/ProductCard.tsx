"use client";

import React, { useEffect, useState } from "react";
import { Products } from "@/app/types/products";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { SkeletonCard } from "./ProductSkeleton";
import Link from "next/link";
import { ProductStructuredData } from "../../../components/StructuredData";

// Product images mapping - using only available images from public/products
// Verified product images that exist in the public folder
const productImages: Record<string, string> = {
  // Map all product names to one of the four available images
  "Stellar T-Shirt": "/products/arcadis-blue-shirt.png",
  "Crypto Wallet": "/products/harmonia-gray-shirt.png",
  "Blockchain Book": "/products/book-for-learning-soroban.png",
  "Crypto Hoodie": "/products/arcadis-blue-shirt.png",
  "Crypto Mug": "/products/beige-harmonia-cap.png",
  "Hardware Wallet": "/products/harmonia-gray-shirt.png",
  "Crypto Trading Guide": "/products/book-for-learning-soroban.png",
  "Crypto Phone Case": "/products/beige-harmonia-cap.png",
  "NFT Creation Course": "/products/book-for-learning-soroban.png",
  "Hardware Security Key": "/products/harmonia-gray-shirt.png",
  "Blockchain Stickers": "/products/beige-harmonia-cap.png",
  "Mining GPU": "/products/arcadis-blue-shirt.png",
  "Mining Rig": "/products/harmonia-gray-shirt.png",
  "NFT Art Print": "/products/book-for-learning-soroban.png",
  "Virtual Land Deed": "/products/arcadis-blue-shirt.png",
  "Rare Coin": "/products/beige-harmonia-cap.png",
  // Products referenced in errors
  "Digital Asset": "/products/book-for-learning-soroban.png",
  "Premium Collection": "/products/beige-harmonia-cap.png",
  "Arcadis Blue": "/products/arcadis-blue-shirt.png",
  "Harmonia Gray": "/products/harmonia-gray-shirt.png",
  // Verified products from the homepage with confirmed images
  "Arcadis Blue Shirt": "/products/arcadis-blue-shirt.png",
  "Beige Harmonia Cap": "/products/beige-harmonia-cap.png",
  "Soroban Learning Book": "/products/book-for-learning-soroban.png",
  "Harmonia Gray Shirt": "/products/harmonia-gray-shirt.png",
};

const ProductCard: React.FC<{ product: Products }> = ({ product }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  
  // Get product image from product.image property or from mapping or use a default
  const [imageSrc, setImageSrc] = useState(
    product.image || productImages[product.name] || "/products/arcadis-blue-shirt.png"
  );
  const [imageError, setImageError] = useState(false);
  
  // Handle specific products with known image issues
  useEffect(() => {
    // Force correct image paths for problematic products
    if (product.name === "Arcadis Blue Shirt") {
      setImageSrc("/products/arcadis-blue-shirt.png");
      setImageError(false);
    } else if (product.name === "Harmonia Gray Shirt") {
      setImageSrc("/products/harmonia-gray-shirt.png");
      setImageError(false);
    }
  }, [product.name]);

  useEffect(() => {
    // Simulate image loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary/30 transform hover:-translate-y-1">
      {/* Structured Data for SEO */}
      <ProductStructuredData 
        product={{
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: product.price,
          image: imageSrc,
          category: product.category,
          rating: product.rating
        }} 
        url={`/product/${product.id}`} 
      />
      
      {/* Product Image */}
      <div className="relative h-56 bg-secondary/30 overflow-hidden">
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light/5 to-transparent z-0" />
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Image 
                src={imageSrc}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => {
                  // Prevent infinite error loops
                  if (imageError) return;
                  
                  setImageError(true);
                  console.log(`Image error for ${product.name}: ${imageSrc}`);
                  
                  // Try product name mapping first if we were using product.image
                  if (product.image && productImages[product.name]) {
                    setImageSrc(productImages[product.name]);
                    console.log(`Using mapped image for ${product.name}: ${productImages[product.name]}`);
                    return;
                  }
                  
                  // Use one of the four available images as fallback
                  const fallbackImages = [
                    "/products/arcadis-blue-shirt.png",
                    "/products/beige-harmonia-cap.png",
                    "/products/book-for-learning-soroban.png",
                    "/products/harmonia-gray-shirt.png"
                  ];
                  
                  // For specific products, use specific fallbacks
                  if (product.name.toLowerCase().includes("shirt")) {
                    setImageSrc("/products/arcadis-blue-shirt.png");
                    console.log(`Using shirt fallback for ${product.name}`);
                  } else if (product.name.toLowerCase().includes("cap") || product.name.toLowerCase().includes("hat")) {
                    setImageSrc("/products/beige-harmonia-cap.png");
                    console.log(`Using cap fallback for ${product.name}`);
                  } else if (product.name.toLowerCase().includes("book")) {
                    setImageSrc("/products/book-for-learning-soroban.png");
                    console.log(`Using book fallback for ${product.name}`);
                  } else {
                    // Random fallback for other products
                    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
                    setImageSrc(fallbackImages[randomIndex]);
                    console.log(`Using random fallback for ${product.name}: ${fallbackImages[randomIndex]}`);
                  }
                }}
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
              />
            </div>
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm z-20 transition-all hover:bg-white hover:shadow-md transform hover:scale-110"
              aria-label="Add to wishlist"
            >
              <Heart 
                size={18} 
                className={`transition-all duration-300 ${isLiked ? "fill-accent text-accent" : "text-gray-400"}`}
                fill={isLiked ? "currentColor" : "none"}
              />
            </button>
          </>
        )}
      </div>
      
      {/* Product Details */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div>
            <span className="inline-block mb-1.5 text-xs font-medium text-primary-dark bg-primary/10 px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            <h3 className="font-semibold text-lg text-text line-clamp-1">{product.name}</h3>
          </div>
          <p className="font-bold text-primary-dark">{product.price} XLM</p>
        </div>
        
        {/* Ratings */}
        <div className="flex items-center mt-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              size={14}
              className={i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
              fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
            />
          ))}
          <span className="ml-2 text-sm text-text font-medium">{product.rating}</span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-primary-dark hover:bg-primary-dark/90 text-white py-2.5 px-4 rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02]">
            <ShoppingBag size={16} className="transition-transform group-hover:animate-bounce" />
            <span className="text-sm">Add to Cart</span>
          </button>
          <Link 
            href={`/product/${product.id}`}
            className="px-3 py-2.5 border border-gray-300 hover:border-primary-dark hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            aria-label="View product details"
          >
            <span className="sr-only">View Details</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 12L9 16.5V7.5L15 12Z" fill="currentColor" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
