"use client";

import * as React from "react";
import { Plus, Trash2, ExternalLink, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [forms, setForms] = React.useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
  });
  const supabase = createClient();

  const fetchBanners = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setBanners(data);
    setLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("banners").insert([
      { ...forms, is_active: true }
    ]);

    if (!error) {
      setForms({ title: "", subtitle: "", image_url: "", link_url: "" });
      setShowAddForm(false);
      fetchBanners();
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("banners")
      .update({ is_active: !current })
      .eq("id", id);
    if (!error) fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (!error) fetchBanners();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A]">Homepage Banners</h1>
          <p className="text-[#1A1A1A]/40 text-sm mt-1 uppercase tracking-widest font-black">Management Portal</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-black hover:bg-neutral-800 text-white rounded-2xl px-6 py-6 h-auto transition-all shadow-xl"
        >
          {showAddForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Post New Banner</>}
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm mb-10"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                id="banner-title"
                label="Banner Title" 
                value={forms.title} 
                onChange={e => setForms({...forms, title: e.target.value})} 
                placeholder="Ex: Summer Collection 2024" 
                required 
                className="bg-transparent" 
              />
              <Input 
                id="banner-subtitle"
                label="Subtitle" 
                value={forms.subtitle} 
                onChange={e => setForms({...forms, subtitle: e.target.value})} 
                placeholder="Ex: Up to 50% Off" 
                required 
                className="bg-transparent" 
              />
              <Input 
                id="banner-image"
                label="Image URL" 
                value={forms.image_url} 
                onChange={e => setForms({...forms, image_url: e.target.value})} 
                placeholder="Paste direct image link here" 
                required 
                className="bg-transparent" 
              />
              <Input 
                id="banner-link"
                label="Destination Link" 
                value={forms.link_url} 
                onChange={e => setForms({...forms, link_url: e.target.value})} 
                placeholder="Ex: /products?category=ID" 
                className="bg-transparent" 
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-12 h-14 font-bold shadow-lg shadow-blue-500/20">POST BANNER</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array.from({length: 4}).map((_, i) => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-black/5" />)
        ) : banners.length > 0 ? (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
               <div className="relative aspect-[21/9] overflow-hidden bg-neutral-100">
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                  <div className="absolute bottom-4 left-6 text-white drop-shadow-lg">
                    <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-70">{banner.subtitle}</p>
                    <h3 className="text-xl font-serif">{banner.title}</h3>
                  </div>
               </div>
               <div className="p-6 flex justify-between items-center bg-white">
                  <div className="flex gap-4">
                    <button onClick={() => toggleStatus(banner.id, banner.is_active)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${banner.is_active ? 'border-green-500 text-green-500 bg-green-50' : 'border-neutral-200 text-neutral-400 bg-neutral-50'}`}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <a href={banner.link_url} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black">
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <button onClick={() => deleteBanner(banner.id)} className="p-2.5 text-red-500/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-black/10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F0] flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-black/20" />
            </div>
            <h3 className="font-serif text-xl">No banners yet</h3>
            <p className="text-black/40 text-sm mt-1">Start posting banners to engage your visitors.</p>
          </div>
        )}
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
         <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
         <div>
            <p className="text-sm font-bold text-blue-900">Database Setup Required</p>
            <p className="text-xs text-blue-700/70 leading-relaxed mt-1">
              Ensure you have the `banners` table created in your Supabase project. If you experience errors, check the database schema.
            </p>
         </div>
      </div>
    </div>
  );
}
