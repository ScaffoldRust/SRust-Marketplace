"use client";

import React, { useState } from "react";
import { HelpCircle, Search, MessageSquare, FileText, Phone } from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the &apost;Sign Up&apost; button in the top right corner of the homepage. Fill in your details including your name, email address, and create a password. Once submitted, you'll receive a verification email to activate your account."
    },
    {
      question: "How do I reset my password?",
      answer: "If you've forgotten your password, click on the &apost;Login&apost; button and then select &apost;Forgot Password&apost;. Enter the email address associated with your account, and we'll send you instructions on how to reset your password."
    },
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and navigating to the &apost;Orders&apost; section in your profile. Here you'll find a list of all your orders and their current status. Click on any order to view detailed tracking information."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, and cryptocurrency payments (Bitcoin, Ethereum). All transactions are secure and encrypted."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can contact our customer support team through the &apost;Contact Us&apost; form on our website, by emailing support@srust-marketplace.com, or by using the live chat feature available on the bottom right of every page. Our support team is available 24/7."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. If you&apost;re not satisfied with your purchase, you can request a return through your account within 30 days of receiving the item. Please note that some digital goods may have different return policies."
    },
    {
      question: "How do I become a seller on SRust Marketplace?",
      answer: "To become a seller, log into your account and navigate to the &apost;Seller Dashboard&apost; section. Click on &apost;Become a Seller&apost; and follow the instructions to set up your seller profile. You&apost;ll need to provide some additional information about your business and the products you plan to sell."
    },
    {
      question: "Are there any fees for selling on SRust Marketplace?",
      answer: "Yes, there is a small commission fee on each sale, which varies depending on the product category. We also offer premium seller plans with reduced commission rates and additional features. You can find detailed information about our fee structure in the Seller Help Center."
    }
  ];
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-text flex items-center gap-2">
          <HelpCircle className="text-primary" /> Help & Support
        </h1>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for help topics..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-text-light w-5 h-5" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary/10 rounded-lg p-4 flex flex-col items-center text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                <MessageSquare className="text-primary w-8 h-8 mb-2" />
                <h3 className="font-medium mb-1">Live Chat</h3>
                <p className="text-sm text-text-light">Chat with our support team</p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-4 flex flex-col items-center text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                <FileText className="text-primary w-8 h-8 mb-2" />
                <h3 className="font-medium mb-1">Documentation</h3>
                <p className="text-sm text-text-light">Browse our detailed guides</p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-4 flex flex-col items-center text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                <Phone className="text-primary w-8 h-8 mb-2" />
                <h3 className="font-medium mb-1">Call Us</h3>
                <p className="text-sm text-text-light">Speak with a representative</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            
            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex justify-between items-center p-4 cursor-pointer bg-secondary/10 hover:bg-secondary/20 transition-colors">
                        <h3 className="font-medium">{faq.question}</h3>
                        <svg className="w-5 h-5 text-text-light group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </summary>
                      <div className="p-4 bg-white">
                        <p className="text-text-light">{faq.answer}</p>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-light mb-4">No results found for &quot;{searchQuery}&quot;</p>
                <button 
                  className="text-primary-dark hover:underline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-text-light mb-4">Can&apost; find what you&apost;re looking for?</p>
              <button className="bg-primary-dark text-white px-4 py-2 rounded-lg hover:bg-primary-dark/90 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
