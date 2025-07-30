"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export type SideBarProfile =
  | "profile"
  | "dashboard"
  | "analytics"
  | "products"
  | "transactions"
  | "invoices"
  | "billing"
  | "chat"
  | "tickets"
  | "faq"
  | "settings"
  | "help"
  | "orders"
  | "calendar"
  | "wishlists"
  | "nfts"
  | "messages";

interface SideBarContextType {
  activeComponent: SideBarProfile;
  setActiveComponent: (component: SideBarProfile) => void;
}

const SideBarContext = createContext<SideBarContextType>({
  activeComponent: "profile",
  setActiveComponent: () => {},
});

export const SideBarProvider = ({ children }: { children: ReactNode }) => {
  const [activeComponent, setActiveComponent] = useState<SideBarProfile>("profile");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // For profile page, we're using tab-based navigation instead of actual route changes
    // This allows us to stay on the same page but change content
    
    // Only push to new routes for pages that should navigate away from profile
    const externalRouteMap: Record<string, string> = {
      dashboard: "/seller/dashboard",
      analytics: "/seller/analytics",
      products: "/seller/products",
      transactions: "/seller/transactions",
      chat: "/seller/chat",
      tickets: "/seller/tickets",
      faq: "/seller/faq",
    };

    if (externalRouteMap[activeComponent]) {
      router.push(externalRouteMap[activeComponent]);
    }
    
    // For internal profile tabs, we just update the state and stay on the same page
  }, [activeComponent, router, pathname]);

  return (
    <SideBarContext.Provider value={{ activeComponent, setActiveComponent }}>
      {children}
    </SideBarContext.Provider>
  );
};

export const useSideBarProfile = (): SideBarContextType => {
  const context = useContext(SideBarContext);
  if (!context) {
    throw new Error("useSideBar must be used within a SideBarProvider");
  }
  return context;
};
