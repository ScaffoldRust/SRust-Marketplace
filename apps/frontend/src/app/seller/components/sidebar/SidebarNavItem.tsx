import React from "react";
import dashboard from "../../../../../public/dashboard.svg";
import person1 from "../../../../../public/profile1.svg";
import Image from "next/image";
import analytics from "../../../../../public/analytics.svg";
import billing from "../../../../../public/billing.svg";
import chat from "../../../../../public/chat.svg";
import dollar from "../../../../../public/dollar.svg";
import help from "../../../../../public/help.svg";
import invoices from "../../../../../public/invoices.svg";
import products from "../../../../../public/products.svg";
// import sellerStar from "../../../../../public/seller-star.svg";
import setting from "../../../../../public/setting.svg";
import supportTick from "../../../../../public/supportTick.svg";
import { MenuSection, MenuItem } from "@/app/types/sidebar";
import { useSideBar } from "../context/sidebarContext";
import { Menu, X } from "lucide-react";

export const sidebarData: MenuSection[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        icon: <Image src={person1} alt="icon" />,
        label: "Profile",
        id: "profile",
      },
      {
        icon: <Image src={dashboard} alt="icon" />,
        label: "Dashboard",
        id: "dashboard",
      },
      {
        icon: <Image src={analytics} alt="icon" />,
        label: "Analytics",
        id: "analytics",
      },
      {
        icon: <Image src={products} alt="icon" />,
        label: "Products",
        id: "products",
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        icon: <Image src={dollar} alt="icon" />,
        label: "Transactions",
        id: "transactions",
      },
      {
        icon: <Image src={invoices} alt="icon" />,
        label: "Invoices",
        id: "invoices",
      },
      {
        icon: <Image src={billing} alt="icon" />,
        label: "Billing",
        id: "billing",
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { icon: <Image src={chat} alt="icon" />, label: "Chat", id: "chat" },
      {
        icon: <Image src={supportTick} alt="icon" />,
        label: "Support Tickets",
        id: "tickets",
      },
      { icon: <Image src={help} alt="icon" />, label: "FAQ", id: "faq" },
    ],
  },
];

const bottomSideBarItems: MenuItem[] = [
  {
    icon: <Image src={setting} alt="icon" />,
    label: "Settings",
    id: "settings",
  },
  {
    icon: <Image src={help} alt="icon" />,
    label: "Help",
    id: "help",
  },
];

const SidebarNavItem: React.FC<{
  isOpen: boolean;
  toggleSidebar: () => void;
}> = ({ isOpen, toggleSidebar }) => {
  const { activeComponent, setActiveComponent } = useSideBar();
  return (
    <>
      <button
        className="md:hidden p-3 fixed top-12 left-5 bg-white rounded-full z-50 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
      </button>

      <div
        className={`fixed md:sticky top-0 left-0 h-screen bg-white w-72 py-0 border-r border-[#E4E4E7] transition-all duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:flex flex-col z-40 shadow-lg md:shadow-none overflow-y-auto`}
      >
        <div className="px-6 py-5 border-b border-[#E4E4E7] bg-gradient-to-r from-primary-dark to-primary flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Seller Dashboard</h2>
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
        </div>
        {sidebarData.map((section, index) => (
          <div key={index} className="mb-6 px-6">
            <h3 className="mb-3 text-sm font-bold tracking-wider text-gray-500">
              {section.title}
            </h3>
            <ul className="my-1">
              {section.items.map((item, idx) => {
                return (
                  <li key={idx}>
                    <span
                      className={`flex cursor-pointer rounded-lg items-center my-1 px-5 py-3 text-sm transition-all duration-200 ${
                        activeComponent == item.id
                          ? "bg-primary-dark/10 font-medium text-primary-dark"
                          : "hover:bg-gray-50 hover:text-primary-dark/80"
                      }`}
                      onClick={() => {
                        setActiveComponent(item.id);
                        // Keep the user on the dashboard page but change the active component
                        // This ensures the sidebar context state is maintained
                      }}
                    >
                      <span className={`mr-4 ${activeComponent == item.id ? "text-primary-dark" : "text-gray-600"}`}>{item.icon}</span>
                      <span className={`${activeComponent == item.id ? "text-primary-dark" : "text-gray-800"} text-base`}>{item.label}</span>
                      {activeComponent == item.id && (
                        <span className="ml-auto w-1.5 h-5 bg-primary-dark rounded-full animate-pulse"></span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-auto pt-4 px-5 border-t border-[#E4E4E7] w-full bg-gray-50">
          <ul className="mt-1">
            {bottomSideBarItems.map((item, idx) => (
              <li key={idx} className="mt-3">
                <span
                  className={`flex w-full cursor-pointer rounded-lg items-center py-3 px-5 text-sm transition-all duration-200 ${
                    activeComponent == item.id
                      ? "bg-primary-dark/10 font-medium text-primary-dark"
                      : "hover:bg-gray-50 hover:text-primary-dark/80"
                  }`}
                  onClick={() => setActiveComponent(item.id)}
                >
                  <span className={`mr-3 ${activeComponent == item.id ? "text-primary-dark" : "text-gray-600"}`}>{item.icon}</span>
                  <span className={`${activeComponent == item.id ? "text-primary-dark" : "text-gray-800"} text-base`}>{item.label}</span>
                  {activeComponent == item.id && (
                    <span className="ml-auto w-1.5 h-5 bg-primary-dark rounded-full animate-pulse"></span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SidebarNavItem;
