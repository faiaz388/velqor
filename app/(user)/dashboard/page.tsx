"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, LifeBuoy, LogOut, Camera, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { DashboardProfile } from "@/components/dashboard/dashboard-profile";
import { DashboardOrders } from "@/components/dashboard/dashboard-orders";
import { DashboardTickets } from "@/components/dashboard/dashboard-tickets";
import { cn } from "@/lib/utils";

type Tab = "profile" | "orders" | "tickets";

export default function DashboardPage() {
  const { profile, signOut, loading, user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<Tab>("profile");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Handle case where session exists but profile fetch failed (fixes the entirely blank page issue)
  if (user && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
         <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8" />
         </div>
         <h2 className="text-2xl font-serif text-foreground">Profile Error</h2>
         <p className="text-foreground-secondary max-w-md">There was a problem loading your profile data. If you just signed up, there might have been a delay. Please try refreshing.</p>
         <Button variant="primary" onClick={() => window.location.reload()}>Reload Page</Button>
         <Button variant="ghost" onClick={signOut} className="text-foreground-secondary">Sign Out</Button>
      </div>
    );
  }

  if (!profile) return null;

  const tabs = [
    { id: "profile" as Tab, label: "My Profile", icon: User },
    { id: "orders" as Tab, label: "My Orders", icon: Package },
    { id: "tickets" as Tab, label: "Support Tickets", icon: LifeBuoy },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-8 lg:gap-12"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col gap-6">
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-lg">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent/20 relative">
                  <Image 
                    src={profile.photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"} 
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-accent p-1.5 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold capitalize">{profile.name}</h3>
              <p className="text-xs text-foreground-secondary font-medium mb-3">@{profile.username}</p>
              <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-accent/10 rounded-full w-max">
                <Shield className="w-3 h-3 text-accent" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-accent">{profile.role}</span>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
               {tabs.map((tab) => {
                 const Icon = tab.icon;
                 const isActive = activeTab === tab.id;
                 return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={cn(
                       "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-sm font-medium",
                       isActive 
                         ? "bg-accent/10 text-accent" 
                         : "text-foreground-secondary hover:bg-white/5 hover:text-foreground"
                     )}
                   >
                     <Icon className="w-4 h-4" />
                     {tab.label}
                   </button>
                 );
               })}
               <div className="h-px w-full bg-white/10 my-2"></div>
               <button
                  onClick={signOut}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-sm font-medium text-red-500 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
            </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
           <AnimatePresence mode="wait">
              <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.2 }}
                 className="h-full"
              >
                 {activeTab === "profile" && <DashboardProfile />}
                 {activeTab === "orders" && <DashboardOrders />}
                 {activeTab === "tickets" && <DashboardTickets />}
              </motion.div>
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
