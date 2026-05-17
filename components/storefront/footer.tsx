import Link from "next/link";
import { Globe, Mail, MessageCircle, Video } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-foreground/5 py-12 md:py-20 mt-20">
      <div className="max-w-1440 mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-2xl font-serif tracking-tight text-foreground">
            VELQOR
          </Link>
          <p className="text-sm text-foreground-secondary leading-relaxed max-w-xs">
            Curating the finest minimalist essentials for your modern lifestyle.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href="#" className="text-foreground-secondary hover:text-accent transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="text-foreground-secondary hover:text-accent transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            <a href="#" className="text-foreground-secondary hover:text-accent transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="text-foreground-secondary hover:text-accent transition-colors">
              <Video className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground">Shop</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/products?category=new" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">New Arrivals</Link>
            <Link href="/products?category=bestsellers" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Best Sellers</Link>
            <Link href="/products?category=apparel" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Apparel</Link>
            <Link href="/products?category=accessories" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Accessories</Link>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground">Support</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/faq" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/shipping" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Shipping & Returns</Link>
            <Link href="/contact" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Contact Us</Link>
            <Link href="/dashboard" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Track Order</Link>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground">Legal</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/privacy" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">Terms of Service</Link>
          </nav>
        </div>
      </div>
      <div className="max-w-1440 mx-auto px-6 md:px-16 mt-12 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-foreground-secondary">
          &copy; {new Date().getFullYear()} Velqor. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
