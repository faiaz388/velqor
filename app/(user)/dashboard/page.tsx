"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, Calendar, Edit2, LogOut, Shield, Settings, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

export default function DashboardPage() {
  const { profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-foreground">My Profile</h1>
            <p className="text-foreground-secondary">Manage your account and preferences</p>
          </div>
          <Button variant="outline" onClick={signOut} className="text-red-500 hover:text-red-400 border-red-500/20 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl">
              <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent/20 relative">
                  <Image 
                    src={profile.photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"} 
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <button className="absolute bottom-1 right-1 bg-accent p-2 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-semibold capitalize">{profile.name}</h3>
              <p className="text-sm text-foreground-secondary font-medium">@{profile.username}</p>
              
              <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-accent/10 rounded-full">
                <Shield className="w-3 h-3 text-accent" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-accent">{profile.role}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-lg"><Mail className="w-4 h-4 text-foreground-secondary" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-tighter text-foreground-secondary font-bold">Email</span>
                  <span className="text-sm">{profile.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-lg"><Calendar className="w-4 h-4 text-foreground-secondary" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-tighter text-foreground-secondary font-bold">Member Since</span>
                  <span className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings / Content Area */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                <h4 className="text-lg font-medium flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Account Settings
                </h4>
                <Button variant="ghost" size="sm" className="text-accent">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Info
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-foreground-secondary uppercase tracking-widest">Display Name</span>
                    <span className="font-medium">{profile.name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-foreground-secondary uppercase tracking-widest">Username</span>
                    <span className="font-medium text-accent">@{profile.username}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-foreground-secondary uppercase tracking-widest">Two-Factor Auth</span>
                    <span className="text-sm text-foreground-secondary italic">Not Enabled</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-foreground-secondary uppercase tracking-widest">Login History</span>
                    <span className="text-sm underline cursor-pointer hover:text-accent">View all sessions</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                <p className="text-xs text-foreground-secondary leading-relaxed uppercase tracking-tighter">
                  Need to delete your account? This action is permanent and will remove all your data from our servers.
                  <button className="ml-2 text-red-500 font-bold hover:underline">Delete Account</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
