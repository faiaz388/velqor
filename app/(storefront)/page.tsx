"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/storefront/product-card";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  salePrice: number | null;
  imageTop: string;
  badge?: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
    heading: "The Minimalist Collection",
    subheading: "Elevate your everyday essentials with our new autumn arrivals.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
    heading: "Aesthetic Precision",
    subheading: "Designed with purpose. Crafted for longevity.",
  }
];

// Dynamic Data Fetching
const fetchHomeData = async () => {
  const supabase = createClient();
  
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(image_url)")
    .eq("status", "active")
    .limit(4);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .limit(3);

  return {
    products: products?.map((p: { id: string, slug: string, title: string, price: number, sale_price: number | null, product_images: { image_url: string }[] }) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price,
      salePrice: p.sale_price,
      imageTop: p.product_images?.[0]?.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
      badge: p.sale_price ? "SALE" : undefined
    })) || [],
    categories: (categories as Category[]) || []
  };
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [data, setData] = React.useState<{ products: Product[], categories: Category[] }>({ products: [], categories: [] });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    
    fetchHomeData().then(res => {
      setData(res);
      setLoading(false);
    });

    return () => clearInterval(timer);
  }, []);

  if (loading) return null;

  const { products: MOCK_PRODUCTS, categories: CATEGORIES } = data;

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-screen w-full bg-background-secondary overflow-hidden -mt-[80px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_SLIDES[currentSlide].image}
              alt="Hero"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
            
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
              <div className="max-w-3xl flex flex-col items-center">
                <motion.h1 
                  className="text-4xl md:text-7xl font-serif text-white mb-6 leading-tight"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                  }}
                >
                  {HERO_SLIDES[currentSlide].heading.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      className="inline-block mr-[0.25em]"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-white/90 text-lg md:text-xl mb-10 max-w-xl"
                >
                  {HERO_SLIDES[currentSlide].subheading}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Button variant="primary" size="lg" className="w-[200px]">
                    Shop the Collection
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="group relative h-2 flex items-center justify-center p-2 cursor-pointer"
            >
              <span className={`block h-[2px] w-8 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-white' : 'bg-white/40 group-hover:bg-white/60'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 md:py-32 px-6 md:px-16 max-w-1440 mx-auto w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
          className="flex justify-between items-end mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif">Featured Concept</h2>
          <Link href="/categories" className="text-sm font-medium hover:text-accent flex items-center gap-2 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={i}
              className="min-w-[280px] md:min-w-[340px] aspect-[4/5] rounded-lg overflow-hidden relative group cursor-pointer snap-start shrink-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: i * 0.1 } }
              }}
            >
              <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="bg-white/90 backdrop-blur-sm text-foreground px-4 py-2 rounded text-sm font-medium">
                  {cat.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {MOCK_PRODUCTS.length > 0 && (
        <section className="py-24 px-6 md:px-16 max-w-1440 mx-auto w-full bg-background-secondary rounded-3xl mb-24 md:mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Just Landed</span>
            <h2 className="text-3xl md:text-4xl font-serif">New Arrivals</h2>
          </motion.div>

          <motion.div 
            className={`grid gap-6 md:gap-8 ${
              MOCK_PRODUCTS.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : 
              MOCK_PRODUCTS.length === 2 ? "grid-cols-2 max-w-2xl mx-auto" : 
              MOCK_PRODUCTS.length === 3 ? "grid-cols-3 max-w-4xl mx-auto" : 
              "grid-cols-2 md:grid-cols-4"
            }`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {MOCK_PRODUCTS.map((prod) => (
              <motion.div
                key={prod.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
                }}
              >
                <ProductCard {...prod} />
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-16 text-center">
            <Button variant="outline" size="lg">View Entire Collection</Button>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-16 bg-background border-t border-b border-foreground/5 overflow-hidden flex flex-col items-center">
        <h3 className="text-sm text-foreground-secondary mb-8 uppercase tracking-widest font-medium">Why Choose Velqor</h3>
        <div className="flex gap-16 md:gap-32 w-max animate-marquee">
          <div className="flex flex-col items-center gap-3 text-center">
            <Truck className="w-8 h-8 text-foreground" strokeWidth={1} />
            <span className="text-sm font-medium">Free Global Shipping</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <ShieldCheck className="w-8 h-8 text-foreground" strokeWidth={1} />
            <span className="text-sm font-medium">Lifetime Warranty</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <RefreshCw className="w-8 h-8 text-foreground" strokeWidth={1} />
            <span className="text-sm font-medium">30-Day Returns</span>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 md:py-32 px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
          }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Join the Club</h2>
          <p className="text-foreground-secondary mb-8 max-w-md mx-auto">
            Subscribe to our newsletter and get 10% off your first order. Plus early access to new drops.
          </p>
          <div className="flex gap-4 max-w-md mx-auto relative">
            <Input label="Your email address" type="email" className="w-full" />
            <Button variant="primary" className="absolute right-0 top-5 bottom-0 h-10 px-6 rounded-l-none border-b border-transparent">
              Subscribe
            </Button>
          </div>
        </motion.div>
      </section>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          /* Setup basic marquee animation loop */
        }
      `}</style>
    </div>
  );
}
