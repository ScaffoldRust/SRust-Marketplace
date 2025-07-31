"use client";

import React, { useEffect, useState } from "react";
// Note: We can't use export const metadata in client components
// The root layout metadata will apply to the homepage
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Star, 
  TrendingUp,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShoppingBag
} from "lucide-react";

// Product images
const products = [
  {
    id: 1,
    name: "Arcadis Blue Shirt",
    description: "A blue shirt branded by Arcadis, perfect for game developers",
    price: 45.99,
    image: "/products/arcadis-blue-shirt.png",
    category: "Clothing"
  },
  {
    id: 2,
    name: "Beige Harmonia Cap",
    description: "A stylish beige cap from Harmonia, a modern lifestyle brand",
    price: 29.99,
    image: "/products/beige-harmonia-cap.png",
    category: "Accessories"
  },
  {
    id: 3,
    name: "Soroban Learning Book",
    description: "An educational book that teaches Soroban smart contracts",
    price: 59.99,
    image: "/products/book-for-learning-soroban.png",
    category: "Education"
  },
  {
    id: 4,
    name: "Harmonia Gray Shirt",
    description: "A sleek, aesthetic gray shirt from Harmonia",
    price: 42.99,
    image: "/products/harmonia-gray-shirt.png",
    category: "Clothing"
  }
];

// Features
const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Secure Transactions",
    description: "Blockchain-powered security ensures your transactions are protected and transparent"
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Lightning Fast",
    description: "Instant payments and quick settlements across borders with minimal fees"
  },
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: "Global Marketplace",
    description: "Buy and sell anywhere in the world without boundaries or restrictions"
  },
];

// Technology benefits
const techBenefits = [
  {
    icon: <TrendingUp className="h-10 w-10 text-primary" />,
    title: "High Performance",
    description: "Experience blazing-fast transactions and responsive UI, thanks to our Rust-based infrastructure"
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: "Modern Experience",
    description: "Enjoy a sleek, intuitive interface designed for both beginners and power users"
  },
  {
    icon: <Star className="h-10 w-10 text-primary" />,
    title: "Future-Proof",
    description: "Stay ahead with a platform built on the latest Rust technologies and blockchain advancements"
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary/80 to-white py-20 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-gray-800 font-extrabold">The Future of </span>
                <span className="bg-gradient-to-r from-primary-dark to-primary bg-clip-text font-extrabold">Digital Commerce</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-text font-medium mb-8 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Experience the next generation of digital commerce with our blockchain-powered marketplace. Buy and sell with confidence.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/marketplace" className="hover-lift">
                  <button className="bg-primary hover:bg-primary-dark text-black py-3 px-8 rounded-full font-medium transition-all flex items-center gap-2 w-full justify-center sm:w-auto">
                    Explore Products
                    <ShoppingBag size={18} />
                  </button>
                </Link>
                <Link href="/seller" className="hover-lift">
                  <button className="border-2 border-primary text-primary hover:bg-primary/5 py-3 px-8 rounded-full font-medium transition-all flex items-center gap-2 w-full justify-center sm:w-auto">
                    Start Selling
                    <ArrowRight size={18} />
                  </button>
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              className="md:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative h-[300px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-light/30 to-transparent rounded-2xl" />
                <Image 
                  src="/products/beige-harmonia-cap.png"
                  alt="Featured Product"
                  fill
                  className="object-contain p-8"
                  priority
                />
              </div>
              
              <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-accent rounded-full flex items-center justify-center text-black font-bold text-lg animate-pulse-slow">
                <div className="text-center">
                  <div className="text-sm">New</div>
                  <div>Collection</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Featured Products Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-text-light max-w-2xl mx-auto">Discover our handpicked selection of premium items from trusted sellers</p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {products.map((product) => (
                  <div key={product.id} className="min-w-full p-4">
                    <div className="bg-secondary rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all p-6 flex flex-col md:flex-row gap-8 items-center">
                      <div className="relative h-[240px] w-full md:w-[240px] rounded-lg overflow-hidden bg-white">
                        <Image 
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full mb-3">
                              {product.category}
                            </span>
                            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                          </div>
                          <span className="text-xl font-bold text-primary">${product.price}</span>
                        </div>
                        
                        <p className="text-text-light mb-6">{product.description}</p>
                        
                        <div className="flex gap-3">
                          <button className="bg-primary hover:bg-primary-dark text-black py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                            <ShoppingBag size={16} />
                            Add to Cart
                          </button>
                          <Link href={`/product/${product.id}`} className="border border-gray-200 hover:border-primary py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-text-light hover:text-primary">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-md hover:shadow-lg p-3 rounded-full transition-all z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-text" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-md hover:shadow-lg p-3 rounded-full transition-all z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-text" />
            </button>
            
            {/* Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {products.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-8 bg-primary' : 'w-2 bg-gray-300'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-white to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Stellar Market?</h2>
            <p className="text-text-light max-w-2xl mx-auto">Experience the benefits of blockchain-powered e-commerce with features designed for the modern shopper</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold tracking-wider">POWERED BY</span>
            <h2 className="text-3xl font-bold mb-4 mt-2 text-gray-800">Scaffold Rust Technology</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built using cutting-edge Scaffold Rust templates, created by a leading company in blockchain development tooling
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {techBenefits.map((benefit, index) => (
              <motion.div 
                key={benefit.title}
                className="border border-gray-100 rounded-xl p-6 hover:border-primary/20 transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/about-technology" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium group">
              Learn More About Our Technology
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8">Join thousands of users already enjoying the benefits of blockchain-powered e-commerce</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <button className="bg-primary hover:bg-primary-dark text-black py-3 px-8 rounded-full font-medium transition-all flex items-center gap-2 justify-center w-full sm:w-auto">
                  Explore Marketplace
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/seller">
                <button className="bg-white hover:bg-gray-50 text-text py-3 px-8 rounded-full font-medium transition-all flex items-center gap-2 shadow-sm justify-center w-full sm:w-auto">
                  Become a Seller
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
