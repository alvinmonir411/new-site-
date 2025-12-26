"use client";

import React, { useEffect, useState } from "react";

interface Order {
  id: string;
  regNo: string;
  total: string;
  status: string;
  dates: string[];
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-[#00b875] text-white rounded-lg hover:bg-[#009e66] transition-colors shadow-sm font-medium"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b875]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Registration</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Dates</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Date Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {order.regNo}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{order.email}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {order.dates && order.dates.length > 0 ? (
                              order.dates.map((date, idx) => (
                                <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {date}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">No dates</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          £{order.total}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
