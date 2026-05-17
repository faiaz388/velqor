"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-accent/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-foreground">VELQOR</h1>
          <p className="text-foreground-secondary text-sm font-medium tracking-widest uppercase mt-2">Premium Experience</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {children}
        </div>
        
        <div className="mt-8 text-center text-xs text-foreground-secondary flex items-center justify-center gap-4">
          <Link href="/terms" virtual-link="true" className="hover:text-foreground">Terms</Link>
          <div className="w-1 h-1 bg-white/10 rounded-full" />
          <Link href="/privacy" virtual-link="true" className="hover:text-foreground">Privacy</Link>
          <div className="w-1 h-1 bg-white/10 rounded-full" />
          <Link href="/support" virtual-link="true" className="hover:text-foreground">Support</Link>
        </div>
      </motion.div>
    </div>
  );
}

// Helper to avoid import issues in this snippet
import Link from 'next/link';
