"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const supabase = createClient();

  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    
    if (data) {
      setProducts(data.map(p => ({
        id: p.id,
        name: p.title,
        sku: p.sku || "N/A",
        status: p.status,
        price: p.price,
        stock: p.stock_quantity,
        category: p.categories?.name || "Uncategorized"
      })));
    }
    setIsLoading(false);
  }, [supabase]);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      
      addToast({ title: "Product deleted", type: "success" });
      fetchProducts();
    } catch (error: any) {
      addToast({ title: "Delete failed", description: error.message, type: "error" });
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const MOCK_PRODUCTS = products;
  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-black mb-1">Products</h1>
          <p className="text-sm text-black/60">Manage your store's inventory and categories.</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary" className="gap-2 shadow-premium">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm flex flex-col min-h-0 flex-1">
        <div className="p-4 border-b border-black/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
              <input 
                type="text" 
                placeholder="Search products by name or SKU" 
                className="w-full pl-10 pr-4 py-2 bg-[#F5F5F0] rounded-md text-sm border-none focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2 flex-1 md:flex-none">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#F5F5F0]/50 text-black/60 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium w-10"><input type="checkbox" className="rounded border-black/20 text-blue-600 focus:ring-blue-600" /></th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Inventory</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Price</th>
                <th className="px-6 py-4 font-medium w-10 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {MOCK_PRODUCTS.map((product) => (
                <tr key={product.id} className="hover:bg-[#F5F5F0]/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-black/20 text-blue-600 focus:ring-blue-600" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F5F0] rounded-md overflow-hidden shrink-0">
                        {/* Placeholder image */}
                        <div className="w-full h-full bg-black/5" />
                      </div>
                      <span className="font-medium text-black">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black/60">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={product.stock === 0 ? "text-red-500 font-medium" : "text-black"}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-black/60">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-black text-right">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/products/${product.id}`}>
                            <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit Product">
                                <Edit className="w-4 h-4" />
                            </button>
                        </Link>
                        <button 
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" 
                            title="Delete Product"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteProduct(product.id, product.name);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-black/5 flex items-center justify-between text-sm text-black/60">
          <span>Showing 1 to 5 of 5 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-black/10 rounded-md hover:bg-[#F5F5F0] disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-black/10 rounded-md hover:bg-[#F5F5F0] disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
