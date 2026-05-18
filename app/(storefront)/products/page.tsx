"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  salePrice: number | null;
  imageTop: string;
  categoryId?: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        const { data: productsData, error: pError } = await supabase
          .from("products")
          .select("*, product_images(image_url)")
          .eq("status", "active");

        if (pError) console.error("Error fetching products:", pError);

        const { data: categoriesData, error: cError } = await supabase
          .from("categories")
          .select("*");

        if (cError) console.error("Error fetching categories:", cError);

        const productsMapped = productsData?.map(p => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: p.price,
          salePrice: p.sale_price,
          categoryId: p.category_id,
          imageTop: p.product_images?.[0]?.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
        })) || [];

        setProducts(productsMapped);
        setFilteredProducts(productsMapped);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Catastrophic error in products fetchData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  React.useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter(p => p.categoryId === selectedCategory));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const MOCK_PRODUCTS = filteredProducts;

  return (
    <div className="max-w-1440 mx-auto px-6 md:px-16 py-12 w-full flex flex-col min-h-screen">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-foreground/5 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-2">Ready to Wear</h1>
          <p className="text-foreground-secondary">Explore our latest arrivals</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="md:hidden flex-1 group" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </Button>
          <div className="flex items-center gap-2 relative bg-background-secondary rounded-md px-4 py-2 border border-foreground/5 shrink-0 flex-1 md:flex-none justify-between cursor-pointer">
            <span className="text-sm font-medium">Sort by: Featured</span>
            <ChevronDown className="w-4 h-4 text-foreground-secondary" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12 flex-1">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:flex flex-col w-64 shrink-0">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-foreground/5">
            <span className="font-semibold text-sm uppercase tracking-widest text-foreground">Filters</span>
            <Filter className="w-4 h-4 text-foreground-secondary" />
          </div>
          
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span className="font-medium text-sm">Category</span>
              <div className="flex flex-col gap-2">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setSelectedCategory(null)}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border transition-all",
                    !selectedCategory ? "bg-accent border-accent shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "border-foreground/20 group-hover:border-accent"
                  )} />
                  <span className={cn(
                    "text-sm transition-colors",
                    !selectedCategory ? "text-foreground font-semibold" : "text-foreground-secondary group-hover:text-foreground"
                  )}>All Collection</span>
                </div>
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border transition-all",
                      selectedCategory === cat.id ? "bg-accent border-accent shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "border-foreground/20 group-hover:border-accent"
                    )} />
                    <span className={cn(
                      "text-sm transition-colors",
                      selectedCategory === cat.id ? "text-foreground font-semibold" : "text-foreground-secondary group-hover:text-foreground"
                    )}>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-medium text-sm">Color</span>
              <div className="flex flex-wrap gap-2">
                {["#1A1A1A", "#F5F5F0", "#2563EB", "#8B4513", "#4B5320"].map((color) => (
                  <button 
                    key={color} 
                    className="w-6 h-6 rounded-full border border-foreground/10 hover:scale-110 transition-transform" 
                    style={{ backgroundColor: color }} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <span className="font-medium text-sm">Price Range</span>
              <div className="w-full h-1 bg-foreground/10 rounded-full my-2">
                 <div className="w-2/3 h-full bg-accent rounded-full" />
              </div>
              <div className="flex justify-between items-center text-xs text-foreground-secondary">
                <span>$0</span>
                <span>$500+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Overlay */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 bg-background md:hidden p-6 pb-24 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 border-b border-foreground/5 pb-4">
                <span className="font-serif text-xl">Filters</span>
                <button onClick={() => setShowFilters(false)} className="p-2 -mr-2 text-foreground-secondary hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Duplicate filter block for mobile brevity */}
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <span className="font-medium text-sm">Category</span>
                  <div className="flex flex-col gap-2">
                    {["T-Shirts", "Outerwear", "Trousers", "Accessories"].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer">
                        <div className="w-4 h-4 rounded border border-foreground/20" />
                        <span className="text-sm text-foreground-secondary">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-foreground/5">
                <Button onClick={() => setShowFilters(false)} variant="primary" className="w-full">Apply Filters</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 flex flex-col">
          <div className="flex gap-2 flex-wrap mb-6">
            <span className="text-sm text-foreground-secondary py-1 hidden md:block">12 Products</span>
            {/* Active Filters */}
            {selectedCategory && (
              <div className="flex gap-2 bg-background-secondary px-3 py-1 rounded-full items-center">
                <span className="text-xs">Category: {categories.find(c => c.id === selectedCategory)?.name}</span>
                <button onClick={() => setSelectedCategory(null)}><X className="w-3 h-3 hover:text-destructive transition-colors" /></button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-x-8 md:gap-y-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="w-full aspect-[3/4]" />
                  <Skeleton className="w-2/3 h-4" />
                  <Skeleton className="w-1/3 h-3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-x-8 md:gap-y-12">
              {MOCK_PRODUCTS.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          )}

          {!isLoading && (
            <div className="mt-16 text-center">
              <Button variant="outline" size="lg" className="px-12">Load More</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
