"use client";

import React from "react";
// Note: We can't use export const metadata in client components
// The metadata will be inherited from the layout
import SellerSidebar from "./components/sidebar/ProfileSidebar";
import StoreOverview from "./components/profile-card/StoreOverview";
import { useSideBarProfile } from "./components/context/sidebarContext";
import { ShoppingBag, CreditCard, Calendar, Heart, Image as ImageIcon, MessageSquare, FileText, Settings, HelpCircle } from "lucide-react";

// Placeholder components for each section
const BillingSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <CreditCard className="text-primary" /> Billing
    </h2>
    <div className="space-y-4">
      <div className="p-4 bg-secondary/30 rounded-lg">
        <h3 className="font-medium mb-2">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-light">Pro Membership</p>
            <p className="font-medium">$19.99/month</p>
          </div>
          <button className="px-4 py-2 text-sm bg-primary-dark text-black rounded-lg hover:bg-primary-dark/90 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
      <div className="p-4 border border-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Payment Methods</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 bg-blue-600 rounded"></div>
            <p className="text-sm">•••• •••• •••• 4242</p>
          </div>
          <button className="text-sm text-primary-dark hover:underline">Edit</button>
        </div>
      </div>
    </div>
  </div>
);

const OrdersSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <ShoppingBag className="text-primary" /> Orders
    </h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-secondary/30">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Order ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Total</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#ORD-2023-1234</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 28, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Delivered</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$129.99</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">View Details</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#ORD-2023-1189</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 15, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Shipped</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$59.99</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">View Details</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const CalendarSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <Calendar className="text-primary" /> Calendar
    </h2>
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center py-2 font-medium text-sm text-text-light">{day}</div>
      ))}
      {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
        <div key={date} className={`text-center py-3 border rounded-md ${date === 15 ? 'bg-primary/10 border-primary' : 'border-gray-100 hover:border-primary/30'}`}>
          <span className="text-sm">{date}</span>
          {date === 15 && <div className="mt-1 mx-auto w-1.5 h-1.5 rounded-full bg-primary"></div>}
        </div>
      ))}
    </div>
  </div>
);

const WishlistsSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <Heart className="text-primary" /> Wishlists
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-gray-100 rounded-lg p-4 hover:border-primary/20 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium">My Favorites</h3>
          <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">3 items</span>
        </div>
        <p className="text-sm text-text-light mb-4">Products I want to purchase soon</p>
        <button className="text-sm text-primary-dark hover:underline">View Wishlist</button>
      </div>
      <div className="border border-gray-100 rounded-lg p-4 hover:border-primary/20 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium">Gift Ideas</h3>
          <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">5 items</span>
        </div>
        <p className="text-sm text-text-light mb-4">Products to gift to friends and family</p>
        <button className="text-sm text-primary-dark hover:underline">View Wishlist</button>
      </div>
    </div>
  </div>
);

const NFTsSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <ImageIcon className="text-primary" /> NFTs
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-40 bg-secondary/30 relative">
            <div className="absolute inset-0 flex items-center justify-center text-primary-dark font-medium">
              NFT #{i}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-1">Stellar NFT #{i}</h3>
            <p className="text-xs text-text-light mb-3">Purchased on July {10 + i}, 2025</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">0.{i*2} ETH</span>
              <button className="text-xs bg-primary-dark text-black px-2 py-1 rounded hover:bg-primary-dark/90 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MessagesSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <MessageSquare className="text-primary" /> Messages
    </h2>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="border border-gray-100 rounded-lg p-4 hover:bg-secondary/10 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">Support Team {i}</h3>
            <span className="text-xs text-text-light">July {25 + i}, 2025</span>
          </div>
          <p className="text-sm text-text-light mb-3 line-clamp-2">
            Thank you for your recent purchase. We wanted to follow up and ensure everything is working as expected with your order.  
          </p>
          <button className="text-xs bg-primary-dark text-black px-2 py-1 rounded hover:bg-primary-dark/90 transition-colors">
            Reply
          </button>
        </div>
      ))}
    </div>
  </div>
);

const InvoicesSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <FileText className="text-primary" /> Invoices
    </h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-secondary/30">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Invoice #</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">INV-2023-056</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 28, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$129.99</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">Download PDF</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">INV-2023-042</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 15, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$59.99</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">Download PDF</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <Settings className="text-primary" /> Settings
    </h2>
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">Email Address</label>
            <input type="email" defaultValue="user@example.com" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">Password</label>
            <input type="password" defaultValue="********" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Email notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-dark"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">SMS notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-dark"></div>
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button className="bg-primary-dark text-black px-4 py-2 rounded-lg hover:bg-primary-dark/90 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

const HelpSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <HelpCircle className="text-primary" /> Help & Support
    </h2>
    <div className="space-y-6">
      <div className="bg-secondary/20 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Need assistance?</h3>
        <p className="text-sm text-text-light mb-4">Our support team is here to help you with any questions or issues you may have.</p>
        <button className="bg-primary-dark text-black px-4 py-2 rounded-lg hover:bg-primary-dark/90 transition-colors text-sm">
          Contact Support
        </button>
      </div>
      <div>
        <h3 className="font-medium mb-3">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {['How do I change my password?', 'How do I track my order?', 'What payment methods do you accept?'].map((q, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 hover:border-primary/20 transition-colors">
              <button className="w-full text-left font-medium text-sm flex justify-between items-center">
                {q}
                <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Page = () => {
  const { activeComponent } = useSideBarProfile();

  function renderComponent() {
    switch (activeComponent) {
      case "profile":
        return <StoreOverview />;
      case "billing":
        return <BillingSection />;
      case "orders":
        return <OrdersSection />;
      case "calendar":
        return <CalendarSection />;
      case "wishlists":
        return <WishlistsSection />;
      case "nfts":
        return <NFTsSection />;
      case "messages":
        return <MessagesSection />;
      case "invoices":
        return <InvoicesSection />;
      case "settings":
        return <SettingsSection />;
      case "help":
        return <HelpSection />;
      default:
        return <StoreOverview />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <SellerSidebar />
      <section className="flex-1 p-4">{renderComponent()}</section>
    </div>
  );
};

export default Page;
