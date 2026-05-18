"use client";

import * as React from "react";
import { Plus, Search, Edit, Trash2, FolderPlus, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { slugify } from "@/lib/utils";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const supabase = createClient();

  // Form State
  const [editId, setEditId] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditId(cat.id);
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || "");
      setImageUrl(cat.image_url || "");
    } else {
      setEditId(null);
      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `cat-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
      setImageUrl(publicUrl);
    } catch (error) {
      addToast({ title: "Upload failed", description: (error as Error).message, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setIsSubmitting(true);

    const payload = {
      name,
      slug,
      description,
      image_url: imageUrl
    };

    try {
      if (editId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editId);
        if (error) throw error;
        addToast({ title: "Category updated", type: "success" });
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
        addToast({ title: "Category created", type: "success" });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      addToast({ title: "Error saving category", description: (error as Error).message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This might cause issues if products are attached.`)) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      addToast({ title: "Category deleted", type: "success" });
      fetchCategories();
    } catch (error) {
      addToast({ title: "Delete failed", description: (error as Error).message, type: "error" });
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-black mb-1">Categories</h1>
          <p className="text-sm text-black/60">Organize your products into logical collections.</p>
        </div>
        <Button variant="primary" className="gap-2 shadow-premium" onClick={() => openModal()}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm flex flex-col min-h-0 flex-1">
        <div className="p-4 border-b border-black/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
              <input 
                type="text" 
                placeholder="Search categories..." 
                className="w-full pl-10 pr-4 py-2 bg-[#F5F5F0] rounded-md text-sm border-none focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#F5F5F0]/50 text-black/60 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">Collection</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium w-10 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-4 animate-pulse bg-black/5 h-16" />
                  </tr>
                ))
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#F5F5F0]/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F5F0] rounded-md overflow-hidden shrink-0 relative">
                        {cat.image_url ? (
                          <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-black/5 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-black/20" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-black">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black/60 font-mono text-[10px] uppercase tracking-wider">{cat.slug}</td>
                  <td className="px-6 py-4 text-black/60 max-w-xs truncate">{cat.description || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openModal(cat)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteCategory(cat.id, cat.name)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
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
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[60] overflow-hidden"
            >
               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FolderPlus className="w-6 h-6" /></div>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors"><X className="w-5 h-5 text-black/20" /></button>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-serif text-black mb-2 uppercase tracking-tight">
                      {editId ? "Edit Category" : "Create Category"}
                    </h2>
                    <p className="text-xs text-black/40 font-bold uppercase tracking-widest">Define your collection and its aesthetic.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Category Name</label>
                        <input 
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (!editId) setSlug(slugify(e.target.value));
                            }}
                            placeholder="e.g. Premium Footwear"
                            className="w-full px-5 py-3 bg-[#F5F5F0] rounded-xl outline-none font-bold text-base border-2 border-transparent focus:border-blue-500/10 transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Slug</label>
                        <input 
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="URL safe handle"
                            className="w-full px-5 py-3 bg-[#F5F5F0] rounded-xl outline-none font-mono text-xs border-2 border-transparent focus:border-blue-500/10 transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Image Asset</label>
                        <div 
                          className="relative aspect-video rounded-2xl bg-[#F5F5F0] border-2 border-dashed border-black/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-black/5 transition-colors"
                          onClick={() => document.getElementById('catImage')?.click()}
                        >
                          {imageUrl ? (
                            <>
                              <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-xs font-bold uppercase tracking-widest">Replace</span>
                              </div>
                            </>
                          ) : (
                            <>
                              {uploading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-black/20" />
                              ) : (
                                <Upload className="w-5 h-5 text-black/20" />
                              )}
                              <span className="text-[10px] font-bold text-black/20 uppercase mt-2">Upload Cover</span>
                            </>
                          )}
                          <input id="catImage" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Brief Narrative</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="A few words about this collection..."
                            className="w-full px-5 py-3 bg-[#F5F5F0] rounded-xl outline-none font-medium text-sm border-2 border-transparent focus:border-blue-500/10 transition-all resize-none"
                        />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    variant="primary" 
                    className="w-full h-14 rounded-2xl shadow-premium text-sm uppercase tracking-[0.2em] font-black"
                    disabled={isSubmitting || !name || !slug}
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editId ? "Save Changes" : "Create Collection")}
                  </Button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
