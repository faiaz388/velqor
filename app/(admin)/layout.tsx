"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  Bell, 
  Search,
  LogOut,
  AlignLeft,
  FileText,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: AlignLeft },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Banners", href: "/admin/banners", icon: Bell },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex overflow-hidden relative">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative top-0 bottom-0 left-0 bg-white border-r border-[#1A1A1A]/5 flex flex-col transition-all duration-300 z-[50] shrink-0 print:hidden h-full",
        isSidebarOpen ? "w-64 translate-x-0" : "w-64 md:w-20 -translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1A1A1A]/5">
          {isSidebarOpen ? (
            <Link href="/admin" className="font-serif text-xl tracking-tight text-[#1A1A1A]">VELQOR</Link>
          ) : (
            <Link href="/admin" className="font-serif text-xl tracking-tight text-[#1A1A1A] mx-auto hidden md:block">V</Link>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#1A1A1A]/50 hover:text-[#1A1A1A]">
            <AlignLeft className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                  isActive ? "bg-[#1A1A1A]/5 text-[#2563EB]" : "text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
                )}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-[#2563EB]" : "text-[#1A1A1A]/50")} />
                {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#1A1A1A]/5 flex flex-col gap-1">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-left text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 hover:text-[#2563EB] transition-colors"
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">View Store</span>}
          </Link>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-left text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full min-w-0 print:bg-white">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#1A1A1A]/5 flex items-center justify-between px-6 z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] p-2 -ml-2" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <AlignLeft className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/40" />
              <input 
                type="text" 
                placeholder="Search orders, products, customers..." 
                className="w-full pl-10 pr-4 py-2 bg-[#F5F5F0] rounded-md text-sm border-none focus:ring-1 focus:ring-[#2563EB] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F0] transition-colors text-[#1A1A1A]/70">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-sm font-medium">
              VJ
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
