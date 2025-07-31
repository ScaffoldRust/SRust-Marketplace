"use client";

import React, { useEffect } from "react";
import SellerSidebar from "../components/sidebar/SellerSidebar";
import StoreOverview from "../components/overview/StoreOverview";
import { useSideBar } from "../components/context/sidebarContext";
import {
  AnalyticsSection,
  ProductsSection,
  TransactionsSection,
  ChatSection,
  TicketsSection,
  FAQSection
} from "../components/dashboard";

const Page = () => {
  const { activeComponent, setActiveComponent } = useSideBar();

  // Ensure dashboard is selected when directly accessing this page via URL
  useEffect(() => {
    // Only set to dashboard if coming from a direct URL access
    // and the active component isn't already set to something else by sidebar
    if (window.location.pathname === "/seller/dashboard" && 
        activeComponent !== "dashboard") {
      setActiveComponent("dashboard");
    }
  }, [activeComponent, setActiveComponent]);

  function renderComponent() {
    switch (activeComponent) {
      case "profile":
        return "profile";
      case "dashboard":
        return <StoreOverview />;
      case "analytics":
        return <AnalyticsSection />;
      case "products":
        return <ProductsSection />;
      case "transactions":
        return <TransactionsSection />;
      case "chat":
        return <ChatSection />;
      case "tickets":
        return <TicketsSection />;
      case "faq":
        return <FAQSection />;
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