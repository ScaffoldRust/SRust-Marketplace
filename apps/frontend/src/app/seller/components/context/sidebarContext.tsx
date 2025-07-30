"use client";

import { createContext, useContext, useState } from "react";
import { ReactNode } from "react";

export type SidebarSec =
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
  activeComponent: SidebarSec;
  setActiveComponent: (component: SidebarSec) => void;
}

const SideBarContext = createContext<SideBarContextType | undefined>(undefined);

export const SideBarProvider = ({ children }: { children: ReactNode }) => {
  const [activeComponent, setActiveComponent] =
    useState<SidebarSec>("dashboard");

  return (
    <SideBarContext.Provider value={{ activeComponent, setActiveComponent }}>
      {children}
    </SideBarContext.Provider>
  );
};

export const useSideBar = (): SideBarContextType => {
  const context = useContext(SideBarContext);
  if (!context) {
    throw new Error("useSideBar must be used within a SideBarProvider");
  }
  return context;
};
