"use client";

import * as React from "react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { CartProvider } from "@/lib/hooks/use-cart";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isCheckout = pathname === '/checkout';

  return (
    <CartProvider>
      <div className={cn("min-h-screen flex flex-col relative", !isCheckout && "pt-[80px]")}>
        {!isCheckout && <Header />}
        {!isCheckout && <CartDrawer />}
        <main className="flex-1 flex flex-col w-full relative">
          <AnimatePresence mode="wait">
            <React.Fragment key={pathname}>
              {children}
            </React.Fragment>
          </AnimatePresence>
        </main>
        {!isCheckout && <Footer />}
      </div>
    </CartProvider>
  );
}
