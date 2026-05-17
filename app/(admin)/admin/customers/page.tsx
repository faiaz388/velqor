"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCustomersPage() {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-black mb-1">Customers</h1>
          <p className="text-sm text-black/60">View and manage your customer database.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm flex flex-col flex-1 items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-[#F5F5F0] rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-black/20" />
        </div>
        <h3 className="text-lg font-semibold text-black mb-2">No customers yet</h3>
        <p className="text-sm text-black/60 max-w-xs mb-6">
          Information about your customers will be collected and displayed here.
        </p>
        <Button variant="outline">Import Customers</Button>
      </div>
    </div>
  );
}
