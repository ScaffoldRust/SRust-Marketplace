import Link from "next/link";
import Image from "next/image";
import React from "react";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Github, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Globe,
  Shield,
  HelpCircle
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary pt-16 pb-8 mt-16 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                <Image 
                  src="/icons/Scaffold_Rust_Logo.jpg" 
                  alt="Stellar Market" 
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-primary-dark to-primary-light bg-clip-text">
                Stellar Market
              </h3>
            </div>
            
            <p className="text-text-light text-sm leading-relaxed">
              The next generation marketplace for digital assets and physical goods, 
              powered by Stellar blockchain technology for secure and transparent transactions.
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <Link href="#" className="p-2 rounded-full bg-white shadow-sm hover:bg-primary transition-colors">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white shadow-sm hover:bg-primary transition-colors">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white shadow-sm hover:bg-primary transition-colors">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-white shadow-sm hover:bg-primary transition-colors">
                <Github size={18} />
              </Link>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-text">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Marketplace", href: "/marketplace" },
                { name: "Sell Products", href: "/seller" },
                { name: "Featured Items", href: "/featured" },
                { name: "New Arrivals", href: "/new" },
                { name: "Special Offers", href: "/offers" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-text-light hover:text-primary flex items-center gap-2 transition-colors text-sm group"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-text">Company</h4>
            <ul className="space-y-3">
              {[
                { name: "About Us", href: "/about", icon: <Globe size={14} /> },
                { name: "How It Works", href: "/how-it-works", icon: <HelpCircle size={14} /> },
                { name: "Privacy Policy", href: "/privacy", icon: <Shield size={14} /> },
                { name: "Terms of Service", href: "/terms", icon: <Shield size={14} /> },
                { name: "Help Center", href: "/help", icon: <HelpCircle size={14} /> },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-text-light hover:text-primary flex items-center gap-2 transition-colors text-sm"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-text">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-text-light">
                <MapPin size={16} className="mt-0.5 text-primary" />
                <span className="text-sm">123 Blockchain Avenue, Digital City, DC 10101</span>
              </li>
              <li className="flex items-center gap-3 text-text-light">
                <Phone size={16} className="text-primary" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-text-light">
                <Mail size={16} className="text-primary" />
                <span className="text-sm">support@stellarmarket.com</span>
              </li>
            </ul>
            
            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="text-sm font-medium mb-2">Subscribe to our newsletter</h5>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-3 py-2 text-sm rounded-l-md border border-gray-200 focus:outline-none focus:border-primary flex-1"
                />
                <button className="bg-primary text-white px-3 py-2 rounded-r-md hover:bg-primary-dark transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-light text-sm">
            © {new Date().getFullYear()} Stellar Market. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-text-light hover:text-primary text-xs transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="text-text-light hover:text-primary text-xs transition-colors">
              Terms of Service
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/cookies" className="text-text-light hover:text-primary text-xs transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
