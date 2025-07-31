import React from "react";
import { Metadata } from "next";
import { SideBarProvider } from "./components/context/sidebarContext";

export const metadata: Metadata = {
  title: "User Profile | SRust Marketplace",
  description: "Manage your account, orders, wishlists, and seller settings in your SRust Marketplace profile.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "User Profile | SRust Marketplace",
    description: "Manage your account, orders, wishlists, and seller settings.",
    url: "/profile",
  },
};

export default function RootLayout({
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
