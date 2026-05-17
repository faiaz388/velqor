"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Star, Minus, Plus, ChevronDown, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/hooks/use-cart";
import { formatCurrency, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const fetchProductBySlug = async (slug: string) => {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name), product_images(image_url), product_options(*, product_option_values(*))")
    .eq("slug", slug)
    .single();

  if (!product) return null;

  return {
    id: product.id,
    title: product.title,
    price: product.price,
    salePrice: product.sale_price,
    sku: product.sku,
    description: product.description,
    images: product.product_images?.length > 0 
      ? product.product_images.map((img: any) => img.image_url) 
      : ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop"],
    colors: product.product_options?.find((o: any) => o.name.toLowerCase().includes("color"))?.product_option_values?.map((v: any) => ({
        id: v.id, name: v.value, hex: v.value // Fallback hex to common names
    })) || [],
    sizes: product.product_options?.find((o: any) => o.name.toLowerCase().includes("size"))?.product_option_values?.map((v: any) => ({
        id: v.id, name: v.value, inStock: true
    })) || [],
  };
};

const MOCK_PRODUCT = {
  id: "p1",
  title: "Essential Organic T-Shirt",
  price: 45,
  salePrice: null,
  sku: "VEL-TSHIRT-01",
  rating: 4.8,
  reviewsCount: 124,
  description: "Crafted from 100% organic cotton, this t-shirt offers an unparalleled combination of softness, breathability, and durability. The tailored fit ensures a modern silhouette that holds its shape wash after wash.",
  images: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1489987707023-afc82478163a?q=80&w=1780&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1780&auto=format&fit=crop",
  ],
  colors: [
    { id: "c1", name: "Off White", hex: "#F5F5F0" },
    { id: "c2", name: "Deep Black", hex: "#1A1A1A" },
    { id: "c3", name: "Navy Blue", hex: "#2563EB" },
  ],
  sizes: [
    { id: "s1", name: "S", inStock: true },
    { id: "s2", name: "M", inStock: true },
    { id: "s3", name: "L", inStock: false },
    { id: "s4", name: "XL", inStock: true },
  ],
};

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-foreground/10 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex w-full justify-between items-center text-left py-2 font-medium text-foreground hover:text-accent transition-colors"
      >
        <span>{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-2 text-foreground-secondary text-sm leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart();
  const [product, setProduct] = React.useState<any>(null);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<any>(null);
  const [selectedSize, setSelectedSize] = React.useState<any>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isZooming, setIsZooming] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProductBySlug(params.slug).then(res => {
        if (res) {
            setProduct(res);
            if (res.colors.length > 0) setSelectedColor(res.colors[0]);
            if (res.sizes.length > 0) setSelectedSize(res.sizes[0]);
        }
        setLoading(false);
    });
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-serif">Product not found</h2>
        <Link href="/"><Button variant="outline">Return Home</Button></Link>
    </div>
  );

  const handleAddToCart = () => {
    addItem({
      id: Math.random().toString(),
      productId: product.id,
      productSlug: params.slug,
      title: product.title,
      price: product.salePrice || product.price,
      image: product.images[0],
      quantity,
      variantId: `${selectedColor?.id || 'none'}-${selectedSize?.id || 'none'}`,
      variantName: `${selectedColor?.name || ''} ${selectedSize?.name || ''}`.trim(),
    });
  };

  return (
    <div className="max-w-1440 mx-auto px-6 md:px-16 py-6 md:py-12 w-full flex flex-col">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-foreground-secondary mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{product.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-24">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:w-3/5">
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-4 overflow-x-auto hide-scrollbar">
            {product.images.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative w-20 h-24 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                  selectedImage === i ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          
          {/* Main Image */}
          <div 
            className="relative aspect-[3/4] w-full bg-background-secondary rounded-lg overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: isZooming ? 1.05 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Image
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1">
          <h1 className="text-3xl md:text-5xl font-serif text-foreground mb-4">{product.title}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-medium text-foreground">{formatCurrency(product.price)}</span>
            <div className="flex items-center gap-2 border-l border-foreground/10 pl-4">
              <div className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-foreground-secondary underline decoration-foreground/20 underline-offset-4 cursor-pointer hover:text-foreground">
                0 Reviews
              </span>
            </div>
          </div>
          
          <p className="text-foreground-secondary mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="flex flex-col gap-8 mb-8 border-t border-b border-foreground/10 py-8">
            {/* Color Selector */}
            {product.colors.length > 0 && (
                <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium uppercase tracking-widest text-foreground">
                        Color <span className="text-foreground-secondary ml-1 lowercase tracking-normal font-normal">— {selectedColor?.name}</span>
                    </span>
                    <div className="flex gap-3">
                        {product.colors.map((color: any) => (
                        <button
                            key={color.id}
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            selectedColor?.id === color.id ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : "hover:scale-110"
                            )}
                            style={{ backgroundColor: color.hex, border: (color.hex === '#F5F5F0' || color.hex === 'white') ? '1px solid #ddd' : 'none' }}
                        >
                            {selectedColor?.id === color.id && <Check className={(color.hex === '#F5F5F0' || color.hex === 'white') ? 'text-black w-4 h-4' : 'text-white w-4 h-4'} />}
                        </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium uppercase tracking-widest text-foreground">Size</span>
                        <button className="text-xs text-foreground-secondary underline decoration-foreground/20 hover:text-foreground">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {product.sizes.map((size: any) => (
                        <button
                            key={size.id}
                            disabled={!size.inStock}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                            "h-12 min-w-[3rem] px-5 rounded-md border text-sm font-medium transition-colors relative",
                            !size.inStock && "opacity-50 cursor-not-allowed border-foreground/10 bg-background-secondary text-foreground-secondary overflow-hidden",
                            size.inStock && selectedSize?.id === size.id ? "border-foreground bg-foreground text-background" : "border-foreground/20 hover:border-foreground",
                            )}
                        >
                            {size.name}
                        </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium uppercase tracking-widest text-foreground">Quantity</span>
              <div className="flex items-center border border-foreground/20 rounded-md w-max h-12">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 flex items-center justify-center text-foreground-secondary hover:bg-background-secondary transition-colors h-full"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 flex items-center justify-center text-sm font-medium h-full border-x border-foreground/10">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 flex items-center justify-center text-foreground-secondary hover:bg-background-secondary transition-colors h-full"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full h-14 text-base"
            onClick={handleAddToCart}
          >
            Add to Bag — {formatCurrency((product.salePrice || product.price) * quantity)}
          </Button>
          <div className="flex items-center gap-2 justify-center mt-4 text-xs text-foreground-secondary">
            <ShieldCheck className="w-4 h-4" /> Secure checkout
          </div>

          {/* Accordions */}
          <div className="mt-12 flex flex-col">
            <Accordion title="Description" defaultOpen>
              <p>{product.description}</p>
            </Accordion>
            <Accordion title="Shipping & Returns">
              <p>Free standard shipping on orders over $15 order. Delivery within 3-5 business days.</p>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
