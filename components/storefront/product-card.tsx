"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/lib/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  salePrice?: number | null;
  imageTop: string;
  imageBottom?: string;
  badge?: string;
  outOfStock?: boolean;
}

export function ProductCard({
  id,
  slug,
  title,
  price,
  salePrice,
  imageTop,
  imageBottom,
  badge,
  outOfStock = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simulate flying image here via context or global state,
    // but for now just add to cart logic. The global animation
    // is tricky to do cross-component without a global target ref.
    addItem({
      id: Math.random().toString(),
      productId: id,
      productSlug: slug,
      title,
      price: salePrice || price,
      image: imageTop,
      quantity: 1,
    });
  };

  return (
    <motion.div
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col cursor-pointer relative"
    >
      <Link href={`/products/${slug}`} className="absolute inset-0 z-10" />
      
      <div className="relative aspect-[3/4] w-full bg-background-secondary rounded-md overflow-hidden mb-4">
        {badge && (
          <div className="absolute top-4 left-4 z-20 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
            {badge}
          </div>
        )}
        
        <motion.div
          variants={{
            hover: { scale: 1.05 },
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full h-full"
        >
          <Image
            src={imageTop}
            alt={title}
            fill
            className="object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: isHovered && imageBottom ? 0 : 1 }}
          />
          {imageBottom && (
            <Image
              src={imageBottom}
              alt={title}
              fill
              className="object-cover absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: isHovered ? 1 : 0 }}
            />
          )}
        </motion.div>

        <motion.div
          variants={{
            hover: { y: 0, opacity: 1 },
          }}
          initial={{ y: 20, opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="absolute bottom-4 left-4 right-4 z-20"
        >
          <Button
            variant="primary"
            className="w-full shadow-premium"
            disabled={outOfStock}
            onClick={handleQuickAdd}
          >
            {outOfStock ? "Out of Stock" : "Quick Add"}
          </Button>
        </motion.div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-serif font-medium text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="text-sm font-medium text-destructive">{formatCurrency(salePrice)}</span>
              <span className="text-xs text-foreground-secondary line-through">{formatCurrency(price)}</span>
            </>
          ) : (
            <span className="text-sm text-foreground-secondary">{formatCurrency(price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
