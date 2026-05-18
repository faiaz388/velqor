"use client";

import * as React from "react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { CartProvider } from "@/lib/hooks/use-cart";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col relative pt-[80px]">
        <Header />
        <CartDrawer />
        <main className="flex-1 flex flex-col w-full relative">
          <AnimatePresence mode="wait">
            <React.Fragment key={pathname}>
              {children}
            </React.Fragment>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
