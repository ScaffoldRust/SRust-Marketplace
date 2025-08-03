"use client";

import React from "react";
import { FileText } from "lucide-react";

const TransactionsSection = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-6 text-text flex items-center gap-2">
      <FileText className="text-primary" /> Transactions
    </h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-secondary/30">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Customer</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#TRX-7829</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">John Doe</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 28, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$89.99</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">View</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#TRX-7828</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Jane Smith</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 27, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$59.99</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">View</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">#TRX-7827</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">Robert Johnson</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">July 26, 2025</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">$29.99</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-dark hover:underline cursor-pointer">View</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default TransactionsSection;
