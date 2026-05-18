"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Menu, User } from "lucide-react";
import { useCart } from "@/lib/hooks/use-cart";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-16 transition-all duration-300",
        isScrolled 
          ? "h-[60px] bg-background/80 backdrop-blur-xl border-b border-foreground/5 shadow-sm" 
          : "h-[80px] bg-black/10 backdrop-blur-md border-b border-white/5"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="md:hidden text-foreground hover:text-accent transition-colors p-2 -ml-2"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/products" className="text-sm font-medium hover:text-accent transition-colors">Shop</Link>
          <Link href="/categories" className="text-sm font-medium hover:text-accent transition-colors">Categories</Link>
          <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors">About</Link>
        </nav>
      </div>

      <div className="flex-1 flex justify-center">
        <Link href="/" className="text-2xl font-serif tracking-tight">
          VELQOR
        </Link>
      </div>

      <div className="flex items-center justify-end gap-6 flex-1">
        <button className="text-foreground hover:text-accent transition-colors">
          <Search className="w-5 h-5" />
        </button>
        
        <Link 
          href={user ? "/dashboard" : "/login"} 
          className="hidden md:flex items-center gap-2 text-foreground hover:text-accent transition-colors"
        >
          {profile?.photo_url ? (
            <div className="w-6 h-6 rounded-full overflow-hidden border border-foreground/10 bg-white/5 relative">
              <Image src={profile.photo_url} alt="Profile" fill className="object-cover" />
            </div>
          ) : (
            <User className="w-5 h-5" />
          )}
          {user && <span className="text-xs font-medium max-w-[80px] truncate">{profile?.name?.split(' ')[0] || profile?.username}</span>}
        </Link>

        <button 
          className="relative text-foreground hover:text-accent transition-colors"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <motion.span
              key="cart-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
            >
              {itemCount}
            </motion.span>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-background z-[101] md:hidden p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-xl font-serif">VELQOR</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2">
                  <Menu className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif hover:text-accent transition-colors">Shop All</Link>
                <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif hover:text-accent transition-colors">Categories</Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif hover:text-accent transition-colors">Our Story</Link>
              </nav>

              <div className="mt-auto pt-8 border-t border-foreground/5 flex flex-col gap-6">
                <Link 
                  href={user ? "/dashboard" : "/login"} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-lg font-medium"
                >
                  <User className="w-6 h-6" />
                  {user ? (profile?.name || profile?.username) : "Login / Sign up"}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
