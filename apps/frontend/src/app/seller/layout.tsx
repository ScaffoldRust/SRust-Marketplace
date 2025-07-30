import React from "react";
import { SideBarProvider } from "./components/context/sidebarContext";

export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SideBarProvider>
      <main>{children}</main>
    </SideBarProvider>
  );
}
