"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const { addToast } = useToast();
  const supabase = createClient();
  
  const [categories, setCategories] = React.useState<{ id: string, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // existingImages: already in DB, images: new uploads
  const [existingImages, setExistingImages] = React.useState<{ id: string; url: string }[]>([]);
  const [newImages, setNewImages] = React.useState<{ file: File; preview: string }[]>([]);
  
  const [currentValueInput, setCurrentValueInput] = React.useState<{ [key: number]: string }>({});

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    control,
    formState: { errors }
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "options"
  });

  const options = watch("options");

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Categories
      const { data: catData } = await supabase.from("categories").select("id, name").order("name");
      if (catData) setCategories(catData);

      // Fetch Product
      const { data: product, error: pError } = await supabase
        .from("products")
        .select("*, product_images(*), product_options(*, product_option_values(*))")
        .eq("id", productId)
        .single();

      if (pError) throw pError;

      // Populate Form
      setValue("title", product.title);
      setValue("slug", product.slug);
      setValue("description", product.description || "");
      setValue("price", product.price);
      setValue("sale_price", product.sale_price);
      setValue("stock_quantity", product.stock_quantity);
      setValue("sku", product.sku);
      setValue("status", product.status);
      setValue("category_id", product.category_id);
      setValue("track_inventory", product.track_inventory);

      // Populate Images
      if (product.product_images) {
        setExistingImages(product.product_images.map((img: { id: string, image_url: string }) => ({ id: img.id, url: img.image_url })));
      }

      // Populate Variations
      if (product.product_options) {
        const formattedOptions = product.product_options.map((opt: { name: string, product_option_values: { value: string }[] }) => ({
          name: opt.name,
          values: opt.product_option_values.map((v) => v.value)
        }));
        replace(formattedOptions);
      }

    } catch (error) {
      const err = error as Error;
      addToast({ title: "Error loading product", description: err.message, type: "error" });
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, productId, setValue, replace, addToast, router]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setNewImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeExistingImage = (id: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => {
        const updated = [...prev];
        URL.revokeObjectURL(updated[index].preview);
        updated.splice(index, 1);
        return updated;
    });
  };

  const addOptionValue = (index: number) => {
    const val = currentValueInput[index];
    if (val) {
      const currentValues = options[index].values || [];
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
    setIsSubmitting(true);
    addToast({ title: "Updating product...", type: "info" });

    try {
      // 1. Upload New Images
      const uploadedImageUrls: string[] = [];
      for (const img of newImages) {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${data.slug}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, img.file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
        uploadedImageUrls.push(publicUrl);
      }

      // 2. Update Product Table
      const { error: productError } = await supabase
        .from("products")
        .update({
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
        .eq("id", productId);

      if (productError) throw productError;

      // 3. Sync Variations (Delete all and re-insert is most reliable)
      await supabase.from("product_options").delete().eq("product_id", productId);
      for (const opt of data.options) {
        const { data: optionRow } = await supabase
          .from("product_options")
          .insert({ product_id: productId, name: opt.name })
          .select()
          .single();
        
        if (optionRow && opt.values.length > 0) {
           const valInserts = opt.values.map((v: string) => ({ option_id: optionRow.id, value: v }));
           await supabase.from("product_option_values").insert(valInserts);
        }
      }

      // 4. Sync Images
      // Delete old images NOT in existingImages from DB (storage cleanup can be handled by a separate task)
      await supabase.from("product_images").delete().eq("product_id", productId);
      
      const allImageUrls = [
        ...existingImages.map(img => img.url),
        ...uploadedImageUrls
      ];

      if (allImageUrls.length > 0) {
        const imgInserts = allImageUrls.map((url) => ({
          product_id: productId,
          image_url: url,
        }));
        await supabase.from("product_images").insert(imgInserts);
      }

      addToast({ title: "Product updated successfully!", type: "success" });
      router.push("/admin/products");
    } catch (error) {
      const err = error as Error;
      console.error("Update Error:", err);
      addToast({ title: "Failed to update product", description: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );
  }

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
                <span>Dashboard</span> / <span>Products</span> / <span className="text-black">Edit Listing</span>
              </div>
              <h1 className="text-xl font-serif text-black leading-none uppercase tracking-tight">Modify Product</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" className="shadow-premium min-w-[140px]" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-10 border-b border-black/5 pb-6">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package className="w-5 h-5" /></div>
                 <h2 className="text-lg font-serif">Product Information</h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Product Title</label>
                        <input {...register("title")} className="w-full px-5 py-4 bg-[#F5F5F0] rounded-xl outline-none font-medium border-2 border-transparent focus:border-blue-500/10 transition-all font-serif" />
                        {errors.title && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">{errors.title.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">URL Slug</label>
                        <input {...register("slug")} className="w-full px-5 py-4 bg-[#F5F5F0] rounded-xl outline-none font-medium text-black/40 border-2 border-transparent focus:border-blue-500/10 transition-all font-mono text-sm" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Description</label>
                    <textarea {...register("description")} rows={6} className="w-full px-5 py-4 bg-[#F5F5F0] rounded-xl outline-none resize-none font-medium border-2 border-transparent focus:border-blue-500/20" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
               <div className="flex items-center gap-3 mb-10 border-b border-black/5 pb-6">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Eye className="w-5 h-5" /></div>
                 <h2 className="text-lg font-serif">Product Media</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {/* Existing Images */}
                {existingImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-black/5 shadow-sm">
                    <div className="relative aspect-square w-full h-full">
                      <Image 
                        src={img.url} 
                        alt="Product" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                
                {/* New Image Previews */}
                {newImages.map((img, i) => (
                  <div key={img.preview} className="relative aspect-square rounded-2xl overflow-hidden group border border-blue-500/20 shadow-sm">
                    <Image src={img.preview} alt="" fill unoptimized className="object-cover" />
                    <div className="absolute top-2 left-2 bg-blue-600 text-[8px] font-black text-white px-1.5 py-0.5 rounded uppercase">New</div>
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100"><X className="w-3 h-3" /></button>
                  </div>
                ))}

                {/* Upload Trigger */}
                <button 
                  type="button" 
                  onClick={() => document.getElementById('imageInput')?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-black/5 flex flex-col items-center justify-center hover:bg-blue-50/20 transition-all"
                >
                  <Upload className="w-6 h-6 text-black/20" />
                  <span className="text-[10px] font-black uppercase text-black/20 mt-2">Add Photo</span>
                  <input id="imageInput" type="file" multiple accept="image/*" onChange={onImageUpload} className="hidden" />
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
               <div className="flex justify-between items-center mb-10 border-b border-black/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Settings className="w-5 h-5" /></div>
                    <h2 className="text-lg font-serif uppercase tracking-tight">Variants & Options</h2>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "New Attribute", values: [] })} className="text-[10px] font-black uppercase tracking-wider"><Plus className="w-3 h-3 mr-2" /> Add Option</Button>
               </div>
               <div className="space-y-12">
                  {fields.map((field, index) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={field.id} className="p-6 bg-[#F5F5F0]/50 rounded-3xl relative">
                       <button type="button" onClick={() => remove(index)} className="absolute -top-3 -right-3 p-2 bg-white border border-black/5 text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
                       <div className="flex flex-col md:flex-row gap-8">
                          <div className="w-full md:w-1/3 space-y-4">
                             <div className="flex items-center gap-2 ml-1">
                                <Settings className="w-3 h-3 text-black/40" />
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Option Name</label>
                             </div>
                             <input {...register(`options.${index}.name`)} className="w-full px-5 py-4 bg-white rounded-2xl outline-none font-bold text-sm shadow-sm border border-transparent focus:border-blue-500/20" />
                          </div>
                          <div className="flex-1 space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block ml-1 font-serif">Values</label>
                             <div className="flex flex-wrap gap-2 mb-4 min-h-[56px] p-3 bg-white rounded-2xl border border-black/5 shadow-inner leading-relaxed">
                                {options[index]?.values?.map((v: string, vIdx: number) => (
                                    <span key={vIdx} className="px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg flex items-center gap-2">
                                        {v}
                                        <button type="button" onClick={() => removeOptionValue(index, vIdx)}><X className="w-3 h-3 text-white/50 hover:text-white" /></button>
                                    </span>
                                ))}
                             </div>
                             <div className="flex gap-2">
                                <input 
                                    value={currentValueInput[index] || ""}
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
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-8">Status</h3>
                <div className="flex gap-2">
                    {["active", "draft"].map(s => (
                        <button key={s} type="button" onClick={() => setValue("status", s)} className={cn("flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", watch("status") === s ? "bg-black text-white shadow-xl" : "bg-[#F5F5F0] text-black/40 hover:bg-black/5")}>{s}</button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-8">
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

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">SKU</label>
                   <input {...register("sku")} className="w-full px-5 py-4 bg-[#F5F5F0] rounded-2xl outline-none font-bold text-sm tracking-[0.3em]" />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2 border-b border-black/5 pb-4">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-tight">Pricing</h3>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block ml-1">Standard Price</label>
                        <div className="relative"><span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-black/20">$</span><input {...register("price")} type="number" step="0.01" className="w-full pl-12 pr-6 py-5 bg-[#F5F5F0] rounded-2xl outline-none font-bold text-lg" /></div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block ml-1 text-blue-600">Sale Price (Optional)</label>
                        <div className="relative"><span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-black/20 text-blue-200">$</span><input {...register("sale_price")} type="number" step="0.01" className="w-full pl-12 pr-6 py-5 bg-blue-50/50 rounded-2xl outline-none font-bold text-lg border border-blue-500/10" /></div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block ml-1">Stock Quantity</label>
                    <input {...register("stock_quantity")} type="number" className="w-full px-5 py-5 bg-[#F5F5F0] rounded-2xl outline-none font-bold text-lg" />
                </div>
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}
