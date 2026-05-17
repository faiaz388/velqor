"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-black mb-1">Store Settings</h1>
          <p className="text-sm text-black/60">Configure your store details, payments, and notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">General Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs font-medium text-black/40">Store Name</label>
                <input type="text" defaultValue="VELQOR BD" className="w-full p-2 bg-[#F5F5F0] rounded border-none focus:ring-1 focus:ring-blue-600 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-1 gap-1">
                <label className="text-xs font-medium text-black/40">Contact Email</label>
                <input type="email" defaultValue="admin@velqor.bd" className="w-full p-2 bg-[#F5F5F0] rounded border-none focus:ring-1 focus:ring-blue-600 outline-none text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">Payment Configuration</h3>
            <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Razorpay Payments</p>
                <p className="text-xs text-black/60">Connected and ready for production.</p>
              </div>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Active</span>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="primary">Save Changes</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">System Status</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-xs">
                <span className="text-black/60">API Status</span>
                <span className="text-green-600 font-medium">Operational</span>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="text-black/60">Database</span>
                <span className="text-green-600 font-medium">Connected</span>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="text-black/60">Vercel Deployment</span>
                <span className="text-green-600 font-medium">Success</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
