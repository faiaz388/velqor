"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight, TrendingUp, Users, DollarSign, ShoppingBag } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Dynamically import recharts to avoid SSR issues
const RechartsChart = dynamic(() => import("@/components/admin/revenue-chart"), { ssr: false });

interface Order {
  id: string;
  customer: string;
  status: "processing" | "shipped" | "delivered" | "pending";
  amount: number;
  date: string;
}

interface Product {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

const RECENT_ORDERS: Order[] = [
  { id: "ORD-73A8B1", customer: "Sophia Chen", status: "processing", amount: 145.00, date: "2 mins ago" },
  { id: "ORD-94C2F5", customer: "James Wilson", status: "shipped", amount: 320.50, date: "1 hour ago" },
  { id: "ORD-21E8D9", customer: "Emma Thompson", status: "delivered", amount: 85.00, date: "3 hours ago" },
  { id: "ORD-56B7A4", customer: "Michael Brown", status: "pending", amount: 210.00, date: "5 hours ago" },
  { id: "ORD-88F4C2", customer: "Oliver Garcia", status: "shipped", amount: 450.00, date: "1 day ago" },
];

const TOP_PRODUCTS: Product[] = [
  { id: "p1", name: "Essential Organic T-Shirt", sold: 342, revenue: 15390 },
  { id: "p2", name: "Heavyweight Boxy Hoodie", sold: 215, revenue: 25800 },
  { id: "p3", name: "Structured Leather Tote", sold: 89, revenue: 22250 },
];

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend?: "up" | "down";
}

function MetricCard({ title, value, change, icon: Icon, trend = "up" }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-black/60 mb-1">{title}</p>
          <h3 className="text-2xl font-semibold text-black">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={cn(
          "flex items-center font-medium",
          trend === "up" ? "text-green-600" : "text-red-600"
        )}>
          {trend === "up" ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1 rotate-180" />}
          {change}
        </span>
        <span className="text-black/50">vs last week</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-black mb-1">Dashboard</h1>
          <p className="text-sm text-black/60">Overview of your store&apos;s performance.</p>
        </div>
        <Button variant="primary">Download Report</Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value="$45,231.89" change="+20.1%" icon={DollarSign} trend="up" />
        <MetricCard title="Orders" value="356" change="+12.5%" icon={ShoppingBag} trend="up" />
        <MetricCard title="Active Customers" value="2,103" change="+5.2%" icon={Users} trend="up" />
        <MetricCard title="Conversion Rate" value="3.24%" change="-1.1%" icon={ArrowUpRight} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-black/5 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-black">Revenue Overview</h2>
            <select className="bg-transparent text-sm text-black/60 outline-none cursor-pointer">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <RechartsChart />
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm flex flex-col">
          <h2 className="text-base font-semibold text-black mb-6">Top Products</h2>
          <div className="flex flex-col gap-6 flex-1">
            {TOP_PRODUCTS.map((prod, i) => (
              <div key={prod.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{prod.name}</p>
                  <p className="text-xs text-black/50">{prod.sold} units sold</p>
                </div>
                <span className="text-sm font-semibold text-black">{formatCurrency(prod.revenue)}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6">View All Products</Button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <h2 className="text-base font-semibold text-black">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F5F0]/50 text-black/60 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {RECENT_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-[#F5F5F0]/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                  <td className="px-6 py-4 text-black">{order.customer}</td>
                  <td className="px-6 py-4 text-black/60">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                      order.status === "delivered" && "bg-green-100 text-green-700",
                      order.status === "shipped" && "bg-blue-100 text-blue-700",
                      order.status === "processing" && "bg-yellow-100 text-yellow-700",
                      order.status === "pending" && "bg-gray-100 text-gray-700",
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-black text-right">{formatCurrency(order.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
