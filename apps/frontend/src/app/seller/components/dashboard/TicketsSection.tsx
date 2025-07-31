"use client";

import React from "react";
import { Ticket as TicketIcon } from "lucide-react";

const TicketsSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <TicketIcon className="text-primary" /> Support Tickets
    </h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-secondary/30">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Ticket ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Subject</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Customer</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#TKT-2023-044</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Missing item in order</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">John Doe</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 28, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">New</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">View</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#TKT-2023-043</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Damaged product</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Robert Johnson</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 26, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">View</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#TKT-2023-042</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Wrong size received</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Jane Smith</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 15, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Resolved</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">View</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default TicketsSection;
