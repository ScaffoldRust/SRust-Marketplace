"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import * as framerMotion from "framer-motion";

// Destructure what we need from framer-motion
const { motion, AnimatePresence } = framerMotion;
import { 
  Bell, 
  ChevronDown, 
  Grid, 
  Heart, 
  Home, 
  LogOut, 
  Menu, 
  Package, 
  Search, 
  Settings, 
  ShoppingCart, 
  ShoppingBag, 
  Tag, 
  User, 
  X, 
  Sparkles
} from "lucide-react";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white shadow-sm py-3'}`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover-lift group">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary-light bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
            <Image 
              src="/icons/Scaffold_Rust_Logo.jpg" 
              alt="Stellar Market" 
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="block text-xs text-primary-dark font-semibold mb-0.5">SCAFFOLD RUST</span>
            <h1 className="font-bold text-xl md:text-2xl bg-gradient-to-r from-primary-dark to-primary-light bg-clip-text flex items-center gap-1">
              Stellar Market
              <Sparkles size={18} className="text-primary animate-pulse-slow" />
            </h1>
            <p className="text-xs text-gray-700 hidden md:block font-medium">Your marketplace for digital goods</p>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="relative hidden md:flex items-center bg-gray-50 border border-gray-200 hover:border-primary focus-within:border-primary rounded-full px-4 py-2.5 w-full max-w-md shadow-sm hover:shadow-md transition-all duration-200 focus-within:shadow-md group mx-4">
          <Search size={18} className="text-gray-400 group-focus-within:text-primary mr-2.5 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for products..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder:text-gray-400 focus:placeholder:text-primary/50 transition-colors"
          />
          <button className="ml-2 px-4 py-1.5 bg-primary-dark hover:bg-primary text-white text-xs font-medium rounded-full opacity-0 group-focus-within:opacity-100 transition-all duration-300 shadow-sm hover:shadow">
            Search
          </button>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/marketplace" 
            className="text-text-light hover:text-primary transition-colors font-medium relative group"
          >
            <span>Explore</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link 
            href="/seller" 
            className="text-text-light hover:text-primary transition-colors font-medium relative group"
          >
            <span>Sell</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
          
          {/* Icons */}
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Heart className="h-5 w-5 text-text-light hover:text-primary transition-colors" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm">3</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-text-light hover:text-primary transition-colors" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm">2</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Bell className="h-5 w-5 text-text-light hover:text-primary transition-colors" />
            </motion.button>
            
            {/* User Menu */}
            <div className="relative">
              <motion.button 
                onClick={toggleUserMenu} 
                className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary-light shadow-sm">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <ChevronDown className={`h-4 w-4 text-primary transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-60 rounded-lg shadow-lg bg-white border border-gray-100 divide-y divide-gray-100 focus:outline-none overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-secondary/50">
                      <p className="text-xs text-text-light">Signed in as</p>
                      <p className="text-sm font-medium text-text truncate flex items-center gap-1">
                        <span>user@example.com</span>
                        <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Pro</span>
                      </p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="block w-full">
                        <button className="flex items-center gap-2 p-2.5 w-full hover:bg-secondary rounded-md transition-colors">
                          <User className="h-4 w-4 text-primary" />
                          <span>Profile</span>
                        </button>
                      </Link>
                      <Link href="/seller/dashboard" className="block w-full">
                        <button className="flex items-center gap-2 p-2.5 w-full hover:bg-secondary rounded-md transition-colors">
                          <Grid className="h-4 w-4 text-primary" />
                          <span>Dashboard</span>
                        </button>
                      </Link>
                      <Link href="/orders" className="block w-full">
                        <button className="flex items-center gap-2 p-2.5 w-full hover:bg-secondary rounded-md transition-colors">
                          <Package className="h-4 w-4 text-primary" />
                          <span>Orders</span>
                        </button>
                      </Link>
                    </div>
                    <div className="py-1">
                      <Link href="/settings" className="block w-full">
                        <button className="flex items-center gap-2 p-2.5 w-full hover:bg-secondary rounded-md transition-colors">
                          <Settings className="h-4 w-4 text-primary" />
                          <span>Settings</span>
                        </button>
                      </Link>
                      <motion.button 
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        whileHover={{ x: 2 }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button 
          onClick={toggleNav} 
          className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Toggle menu"
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="h-5 w-5 text-primary" />
        </motion.button>
      </div>

      {/* Search Bar - Mobile (below header) */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="md:hidden px-4 py-2 bg-white border-t border-gray-100 shadow-sm"
      >
        <div className="relative w-full group">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full py-2.5 pl-10 pr-10 rounded-full border border-gray-200 bg-secondary/70 focus:bg-white focus:border-primary-light focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <button className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-3.5 w-3.5 text-text-light" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 w-[80%] h-full bg-white shadow-lg overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-secondary/30">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-primary-light">
                    <Image 
                      src="/icons/Scaffold_Rust_Logo.jpg" 
                      alt="Stellar Market" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg bg-gradient-to-r from-primary-dark to-primary-light bg-clip-text">Stellar Market</h2>
                    <p className="text-xs text-text-light">Your marketplace for digital goods</p>
                  </div>
                </div>
                <motion.button 
                  onClick={toggleNav}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5 text-primary" />
                </motion.button>
              </div>

              <nav className="p-4 space-y-6">
                <div>
                  <h3 className="text-xs uppercase text-text-light font-semibold mb-3 px-2">Navigation</h3>
                  <ul className="space-y-1">
                    <li>
                      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                        <Link 
                          href="/" 
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
                          onClick={toggleNav}
                        >
                          <Home className="h-4 w-4 text-primary" />
                          <span>Home</span>
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                        <Link 
                          href="/marketplace" 
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors bg-secondary/80"
                          onClick={toggleNav}
                        >
                          <ShoppingBag className="h-4 w-4 text-primary" />
                          <span className="font-medium">Marketplace</span>
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                        <Link 
                          href="/categories" 
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
                          onClick={toggleNav}
                        >
                          <Grid className="h-4 w-4 text-primary" />
                          <span>Categories</span>
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                        <Link 
                          href="/deals" 
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
                          onClick={toggleNav}
                        >
                          <Tag className="h-4 w-4 text-primary" />
                          <span>Deals</span>
                          <span className="ml-auto inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">New</span>
                        </Link>
                      </motion.div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xs uppercase text-text-light font-semibold mb-3 px-2">Account</h3>
                  <ul className="space-y-1">
                    <li>
                      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                        <Link 
                          href="/profile" 
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
                          onClick={toggleNav}
                        >
                          <User className="h-4 w-4 text-primary" />
                          <span>Profile</span>
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                        <Link 
                          href="/orders" 
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
                          onClick={toggleNav}
                        >
                          <Package className="h-4 w-4 text-primary" />
                          <span>Orders</span>
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                        <Link 
                          href="/wishlist" 
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
                          onClick={toggleNav}
                        >
                          <Heart className="h-4 w-4 text-primary" />
                          <span>Wishlist</span>
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                        <Link 
                          href="/settings" 
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
                          onClick={toggleNav}
                        >
                          <Settings className="h-4 w-4 text-primary" />
                          <span>Settings</span>
                        </Link>
                      </motion.div>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <motion.button 
                    className="flex w-full items-center gap-3 p-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </motion.button>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
