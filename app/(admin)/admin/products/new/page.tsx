"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Upload, 
  X, 
  Loader2, 
  Package,
  Eye,
  DollarSign,
  Plus,
  Settings,
  Palette,
  Ruler,
  FolderPlus
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { cn, slugify, generateSKU } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

// --- Validation Schemas ---
const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.coerce.number(),
  sale_price: z.coerce.number().optional().nullable(),
  stock_quantity: z.coerce.number().default(0),
  track_inventory: z.boolean().default(true),
  sku: z.string().optional(),
  status: z.string().default("active"),
  category_id: z.string().min(1, "Please select a category"),
  options: z.array(z.object({
    name: z.string(),
    values: z.array(z.string())
  })).optional().default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();
  
  const [categories, setCategories] = React.useState<{ id: string, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [images, setImages] = React.useState<{ file: File; preview: string }[]>([]);
  const [currentValueInput, setCurrentValueInput] = React.useState<{ [key: number]: string }>({});
  
  // Create Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    control,
    formState: { errors, isDirty }
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      status: "active",
      track_inventory: true,
      options: [
        { name: "Size", values: ["S", "M", "L", "XL"] },
        { name: "Color", values: [] }
      ],
      sku: generateSKU(),
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const productTitle = watch("title");
  const options = watch("options");

  const fetchCategories = React.useCallback(async () => {
    const { data } = await supabase.from("categories").select("id, name").order("name");
    if (data) setCategories(data);
  }, [supabase]);

  React.useEffect(() => {
    if (productTitle && !isDirty) {
      setValue("slug", slugify(productTitle), { shouldValidate: true });
    }
  }, [productTitle, setValue, isDirty]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Create Category Handler
  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    setIsCreatingCategory(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ 
            name: newCategoryName, 
            slug: slugify(newCategoryName) 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      addToast({ title: "Category created!", type: "success" });
      await fetchCategories();
      setValue("category_id", data.id);
      setIsCategoryModalOpen(false);
      setNewCategoryName("");
    } catch (error) {
      const err = error as Error;
      addToast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
        const updated = [...prev];
        URL.revokeObjectURL(updated[index].preview);
        updated.splice(index, 1);
        return updated;
    });
  };

  const addOptionValue = (index: number) => {
    const val = currentValueInput[index];
    if (val) {
      const currentValues = options[index].values;
      if (!currentValues.includes(val)) {
        setValue(`options.${index}.values`, [...currentValues, val]);
        setCurrentValueInput(prev => ({ ...prev, [index]: "" }));
      }
    }
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const currentValues = [...options[optionIndex].values];
    currentValues.splice(valueIndex, 1);
    setValue(`options.${optionIndex}.values`, currentValues);
  };

  const onSubmit = async (data: ProductFormValues) => {
    console.log("Submit clicked", data);
    addToast({ title: "Publishing...", description: "Connecting to database", type: "info" });
    setIsSubmitting(true);
    try {
      const uploadedImageUrls: string[] = [];
      for (const img of images) {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${data.slug}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        console.log("Uploading file:", fileName);
        const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, img.file);
        
        if (uploadError) {
          console.error("Upload failed for:", fileName, uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
        console.log("Generated Public URL:", publicUrl);
        uploadedImageUrls.push(publicUrl);
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          title: data.title,
          slug: data.slug,
          description: data.description,
          price: data.price,
          sale_price: data.sale_price ?? null,
          stock_quantity: data.stock_quantity,
          track_inventory: data.track_inventory,
          sku: data.sku,
          status: data.status,
          category_id: data.category_id,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert Options
      for (const opt of data.options) {
        const { data: optionRow } = await supabase
          .from("product_options")
          .insert({ product_id: product.id, name: opt.name })
          .select()
          .single();
        
        if (optionRow) {
           const valInserts = opt.values.map((v: string) => ({ option_id: optionRow.id, value: v }));
           await supabase.from("product_option_values").insert(valInserts);
        }
      }

      if (uploadedImageUrls.length > 0) {
        console.log("Inserting image links...", uploadedImageUrls);
        const imgInserts = uploadedImageUrls.map((url) => ({
          product_id: product.id,
          image_url: url,
        }));
        const { error: imgError } = await supabase.from("product_images").insert(imgInserts);
        if (imgError) {
          console.error("Image link insertion failed:", imgError);
          throw imgError;
        }
      }

      addToast({ title: "Product published successfully!", type: "success" });
      router.push("/admin/products");
    } catch (error) {
      const err = error as Error;
      console.error("Submission Error:", err);
      addToast({ title: "Failed to create product", description: err.message || "Unknown error", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-20">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/products" className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-black/40" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">
                <span>Dashboard</span> / <span>Products</span> / <span className="text-black">Add Product</span>
              </div>
              <h1 className="text-xl font-serif text-black leading-none uppercase tracking-tight">Create Listing</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="bg-white" onClick={() => setValue("status", "draft")}>Save Draft</Button>
            <Button type="submit" variant="primary" className="shadow-premium min-w-[140px]" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Product"}
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-10 border-b border-black/5 pb-6">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package className="w-5 h-5" /></div>
                 <h2 className="text-lg font-serif">Product Identity</h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Product Title</label>
                        <input {...register("title")} className="w-full px-5 py-4 bg-[#F5F5F0] rounded-xl outline-none font-medium border-2 border-transparent focus:border-blue-500/10 transition-all font-serif" placeholder="Enter product name..." />
                        {errors.title && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">URL Slug</label>
                        <input {...register("slug")} className="w-full px-5 py-4 bg-[#F5F5F0] rounded-xl outline-none font-medium text-black/40 border-2 border-transparent focus:border-blue-500/10 transition-all font-mono text-sm" />
                        {errors.slug && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">{errors.slug.message}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Description</label>
                    <textarea {...register("description")} rows={6} className="w-full px-5 py-4 bg-[#F5F5F0] rounded-xl outline-none resize-none font-medium border-2 border-transparent focus:border-blue-500/20" placeholder="Tell more about this product..." />
                    {errors.description && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">{errors.description.message}</p>}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
               <div className="flex items-center gap-3 mb-10 border-b border-black/5 pb-6">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Eye className="w-5 h-5" /></div>
                 <h2 className="text-lg font-serif">Media Assets</h2>
              </div>
              <div className="border-2 border-dashed border-black/5 rounded-3xl p-16 text-center hover:bg-blue-50/20 transition-all cursor-pointer group" onClick={() => document.getElementById('imageInput')?.click()}>
                <input id="imageInput" type="file" multiple accept="image/*" onChange={onImageUpload} className="hidden" />
                <Upload className="w-10 h-10 mx-auto text-black/20 group-hover:text-blue-600 transition-colors mb-4" />
                <h3 className="text-sm font-bold text-black mb-1">Upload Gallery</h3>
                <p className="text-xs text-black/40 uppercase tracking-widest font-bold">Multiple selection enabled</p>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-8">
                  {images.map((img, i) => (
                    <div key={img.preview} className="relative aspect-square rounded-2xl overflow-hidden group border border-black/5 shadow-sm">
                      <Image 
                        src={img.preview} 
                        alt={`Product ${i}`} 
                        fill 
                        className="object-cover"
                      />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
               <div className="flex justify-between items-center mb-10 border-b border-black/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Settings className="w-5 h-5" /></div>
                    <h2 className="text-lg font-serif uppercase tracking-tight">Product Attributes</h2>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "New Attribute", values: [] })} className="text-[10px] font-black uppercase tracking-wider"><Plus className="w-3 h-3 mr-2" /> Add Variant</Button>
               </div>
               <div className="space-y-12">
                  {fields.map((field, index) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={field.id} className="p-6 bg-[#F5F5F0]/50 rounded-3xl relative">
                       <button type="button" onClick={() => remove(index)} className="absolute -top-3 -right-3 p-2 bg-white border border-black/5 text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
                       <div className="flex flex-col md:flex-row gap-8">
                          <div className="w-full md:w-1/3 space-y-4">
                             <div className="flex items-center gap-2 ml-1">
                                {options[index]?.name.toLowerCase().includes('color') ? <Palette className="w-3 h-3 text-black/40" /> : 
                                 options[index]?.name.toLowerCase().includes('size') ? <Ruler className="w-3 h-3 text-black/40" /> : <Settings className="w-3 h-3 text-black/40" />}
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Label</label>
                             </div>
                             <input {...register(`options.${index}.name`)} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold text-sm shadow-sm border border-transparent focus:border-blue-500/20" />
                          </div>
                          <div className="flex-1 space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block ml-1 font-serif">Values (Press Enter)</label>
                             <div className="flex flex-wrap gap-2 mb-4 min-h-[56px] p-3 bg-white rounded-2xl border border-black/5 shadow-inner leading-relaxed">
                                {options[index]?.values.map((v: string, vIdx: number) => (
                                    <span key={vIdx} className="px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                        {v}
                                        <button type="button" onClick={() => removeOptionValue(index, vIdx)}><X className="w-3 h-3 text-white/50 hover:text-white" /></button>
                                    </span>
                                ))}
                             </div>
                             <div className="flex gap-2">
                                <input 
                                    value={currentValueInput[index] || ""}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onChange={(e) => setCurrentValueInput(prev => ({ ...prev, [index]: e.target.value }))}
                                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addOptionValue(index); } }}
                                    placeholder="Add value..."
                                    className="flex-1 px-5 py-3 bg-white rounded-2xl outline-none font-medium text-sm border border-transparent focus:border-blue-500/20"
                                />
                                <Button type="button" variant="primary" size="sm" onClick={() => addOptionValue(index)} className="rounded-2xl px-6">Add</Button>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Availability</h3>
                   <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                </div>
                <div className="flex gap-2">
                    {["active", "draft"].map(s => (
                        <button key={s} type="button" onClick={() => setValue("status", s as "active" | "draft")} className={cn("flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", watch("status") === s ? "bg-black text-white shadow-xl" : "bg-[#F5F5F0] text-black/40 hover:bg-black/5")}>{s}</button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-10">
                <div className="space-y-4">
                   <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block">Classification</label>
                        <button 
                            type="button" 
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="text-[9px] font-black text-blue-600 flex items-center gap-1 hover:underline"
                        >
                            <Plus className="w-3 h-3" /> New Category
                        </button>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                        {categories.map(cat => (
                            <button 
                                key={cat.id} 
                                type="button" 
                                onClick={() => setValue("category_id", cat.id, { shouldValidate: true })}
                                className={cn(
                                    "px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all text-center border-2",
                                    watch("category_id") === cat.id 
                                        ? "bg-black text-white border-black shadow-lg" 
                                        : "bg-[#F5F5F0] text-black/40 border-transparent hover:bg-black/5"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                   </div>
                   {errors.category_id && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.category_id.message as string}</p>}
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Reference SKU</label>
                      <button type="button" onClick={() => setValue("sku", generateSKU())} className="text-[9px] font-black text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Regen</button>
                   </div>
                   <input {...register("sku")} className="w-full px-5 py-4 bg-[#F5F5F0] rounded-2xl outline-none font-bold text-sm tracking-[0.3em]" />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-10">
                <div className="flex items-center gap-3 mb-2 border-b border-black/5 pb-4">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-tight">Financials</h3>
                </div>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block ml-1">MSRP / Price</label>
                        <div className="relative"><span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-black/20">$</span><input {...register("price")} type="number" step="0.01" className="w-full pl-12 pr-6 py-5 bg-[#F5F5F0] rounded-2xl outline-none font-bold text-lg" /></div>
                        {errors.price && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.price.message}</p>}
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block ml-1">Stock On Hand</label>
                    <input {...register("stock_quantity")} type="number" className="w-full px-5 py-5 bg-[#F5F5F0] rounded-2xl outline-none font-bold text-lg" />
                </div>
            </div>
          </div>
        </main>
      </form>

      {/* Category Modal Overlay */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setIsCategoryModalOpen(false)}
               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[60] overflow-hidden"
            >
               <div className="p-8 space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FolderPlus className="w-6 h-6" /></div>
                    <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors"><X className="w-5 h-5 text-black/20" /></button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-black mb-2 uppercase tracking-tight">Create Category</h2>
                    <p className="text-xs text-black/40 font-bold uppercase tracking-widest">Grouping items helps in discovery.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Category Name</label>
                        <input 
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleCreateCategory(); }}
                            placeholder="e.g. Premium Footwear"
                            className="w-full px-6 py-5 bg-[#F5F5F0] rounded-2xl outline-none font-bold text-lg border-2 border-transparent focus:border-blue-500/10 transition-all"
                            autoFocus
                        />
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full h-16 rounded-2xl shadow-premium text-sm uppercase tracking-[0.2em] font-black"
                    disabled={isCreatingCategory || !newCategoryName}
                    onClick={handleCreateCategory}
                  >
                    {isCreatingCategory ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Category"}
                  </Button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
