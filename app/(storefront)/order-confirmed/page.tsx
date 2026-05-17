"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Package, Truck, Home, Search, Calendar, CreditCard, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";

export default function OrderConfirmedPage() {
  const [orderId] = React.useState(`VEL-${Math.floor(Math.random() * 90000) + 10000}`);
  const [status, setStatus] = React.useState("processing");

  const steps = [
    { id: "pending", label: "Confirmed", icon: Check, active: true },
    { id: "processing", label: "Processing", icon: Package, active: true },
    { id: "shipped", label: "Shipped", icon: Truck, active: false },
    { id: "delivered", label: "Delivered", icon: Home, active: false },
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif mb-3">Thank you for your order</h1>
          <p className="text-foreground-secondary">
            Your order <span className="text-foreground font-bold">{orderId}</span> has been successfully placed and is being verified.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tracking */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-foreground/5 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-lg font-serif">Track Your Order</h2>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  VERIFYING PAYMENT
                </div>
              </div>

              <div className="relative flex justify-between">
                {/* Progress Line */}
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-foreground/5 -z-0" />
                
                {steps.map((step, idx) => (
                  <div key={step.id} className="relative flex flex-col items-center z-10 gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm",
                      step.active ? "bg-black text-white" : "bg-white border border-foreground/10 text-foreground/30"
                    )}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-[10px] uppercase font-bold tracking-widest",
                      step.active ? "text-black" : "text-foreground/30"
                    )}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-4 bg-background-secondary rounded-xl flex items-start gap-4">
                <Calendar className="w-5 h-5 text-foreground-secondary mt-1" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Estimated Delivery</span>
                  <span className="text-sm font-medium">October 14th - October 18th, 2023</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-foreground/5 p-6 shadow-sm divide-y divide-foreground/5">
              <div className="pb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-3">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Subtotal</span>
                    <span>{formatCurrency(145)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(145)}</span>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-3">Payment Info</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#F5F5F0] flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-foreground-secondary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">bKash Manual</span>
                    <span className="text-[10px] text-foreground-secondary">TrxID: 8J9K2L1M...</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button variant="outline" className="w-full gap-2">
                  <Printer className="w-4 h-4" /> Download Invoice
                </Button>
                <Link href="/products">
                  <Button variant="primary" className="w-full">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
