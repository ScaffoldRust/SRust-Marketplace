"use client";

import React from "react";
import { Settings, User, Bell, Shield, Database, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-text flex items-center gap-2">
          <Settings className="text-primary" /> Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-secondary/10 border-b border-gray-100">
                <h2 className="font-medium">Settings Categories</h2>
              </div>
              <div className="p-0">
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/10 transition-colors border-l-4 border-primary">
                  <User className="text-primary h-5 w-5" />
                  <span>Account</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/10 transition-colors border-l-4 border-transparent">
                  <Bell className="text-text-light h-5 w-5" />
                  <span>Notifications</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/10 transition-colors border-l-4 border-transparent">
                  <Shield className="text-text-light h-5 w-5" />
                  <span>Privacy & Security</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/10 transition-colors border-l-4 border-transparent">
                  <Database className="text-text-light h-5 w-5" />
                  <span>Data & Storage</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/10 transition-colors border-l-4 border-transparent">
                  <CreditCard className="text-text-light h-5 w-5" />
                  <span>Billing</span>
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary-dark/20 flex items-center justify-center text-primary-dark font-bold text-xl">
                      JS
                    </div>
                    <button className="px-4 py-2 bg-secondary/20 rounded-lg text-sm hover:bg-secondary/30 transition-colors">
                      Change Photo
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">First Name</label>
                    <input 
                      type="text" 
                      defaultValue="John" 
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">Last Name</label>
                    <input 
                      type="text" 
                      defaultValue="Smith" 
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="john.smith@example.com" 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567" 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Bio</label>
                  <textarea 
                    rows={4}
                    defaultValue="I'm a digital goods enthusiast and collector. I love finding unique digital items and supporting independent creators." 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-1">Current Password</label>
                      <input 
                        type="password" 
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-1">New Password</label>
                      <input 
                        type="password" 
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      />
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
          </div>
        </div>
      </div>
    </div>
  );
}
