"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  image_url: string;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [supabase]);

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-1440 mx-auto px-6 md:px-16">
        {/* Header Section */}
        <section className="py-20 md:py-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Curated Concept</span>
            <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6 leading-tight uppercase tracking-tight">Our Collections</h1>
            <p className="text-foreground-secondary text-lg md:text-xl">
              Explore our curated selection of premium garments and accessories, designed for the modern minimalist.
            </p>
          </motion.div>
        </section>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Skeleton Loader
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-background-secondary animate-pulse" />
            ))
          ) : categories.length > 0 ? (
            categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link 
                  href={`/products?category=${cat.id}`}
                  className="group block relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm"
                >
                  <Image 
                    src={cat.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop"} 
                    alt={cat.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-8 flex flex-col justify-end">
                    <div className="flex flex-col gap-2 transform transition-transform duration-500 group-hover:-translate-y-2">
                       <h3 className="text-2xl font-serif text-white">{cat.name}</h3>
                       <div className="flex items-center gap-2 text-white/70 text-xs font-medium uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                          Explore Collection <ArrowRight className="w-3 h-3" />
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center flex flex-col items-center gap-6">
               <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center">
                  <Inbox className="w-10 h-10 text-foreground-secondary/40" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-serif">No categories found</h3>
                  <p className="text-foreground-secondary">We haven&apos;t added any collections yet. Check back later.</p>
               </div>
               <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Refresh Page</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
