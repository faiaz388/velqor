"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeItem, subtotal } = useCart();

  // Prevent scroll when open
  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[400px] bg-background shadow-premium border-l border-foreground/5 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-foreground/5">
              <h2 className="text-xl font-serif text-foreground">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 -mr-2 text-foreground-secondary hover:text-foreground transition-colors rounded-full hover:bg-background-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-4 text-center"
                  >
                    <div className="w-24 h-24 bg-background-secondary rounded-full flex items-center justify-center mb-4">
                      <Trash2 className="w-8 h-8 text-foreground-secondary opacity-50" />
                    </div>
                    <p className="text-foreground-secondary">Your cart is empty.</p>
                    <Button onClick={() => setIsCartOpen(false)} className="mt-4">
                      Continue Shopping
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={{
                      show: { transition: { staggerChildren: 0.05 } },
                    }}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-6"
                  >
                    {items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.variantId || "default"}`}
                        variants={{
                          hidden: { opacity: 0, x: 50 },
                          show: { opacity: 1, x: 0 },
                        }}
                        exit={{ opacity: 0, height: 0, x: 50, marginBottom: 0, overflow: "hidden" }}
                        className="flex gap-4"
                      >
                        <div className="relative w-20 h-24 bg-background-secondary rounded-md overflow-hidden shrink-0">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-medium text-foreground line-clamp-1">{item.title}</h3>
                              {item.variantName && (
                                <p className="text-xs text-foreground-secondary mt-1">{item.variantName}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.productId, item.variantId)}
                              className="text-foreground-secondary hover:text-destructive transition-colors ml-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-foreground/10 rounded-md">
                              <button
                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-background-secondary transition-colors text-foreground-secondary"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-background-secondary transition-colors text-foreground-secondary"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-foreground/5 bg-background">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-foreground font-medium">Subtotal</span>
                  <span className="text-lg font-medium text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-foreground-secondary mb-4 text-center">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
