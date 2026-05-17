"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ShoppingCart, Search, Menu, User } from "lucide-react";
import { useCart } from "@/lib/hooks/use-cart";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { user, profile } = useAuth();

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
        isScrolled ? "h-[60px] bg-background/80 backdrop-blur-md border-b border-foreground/5" : "h-[80px] bg-transparent"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-foreground hover:text-accent transition-colors">
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
            <div className="w-6 h-6 rounded-full overflow-hidden border border-foreground/10 bg-white/5">
              <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
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
    </motion.header>
  );
}
