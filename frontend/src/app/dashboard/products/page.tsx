"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, X, Package2, Hash, Tag,
  DollarSign, Boxes, ImagePlus, Link2, Check, Palette,
  Loader2, UploadCloud, Filter, ChevronDown, ChevronUp,
  CircleSlash
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from "@/lib/api";
import ProductsTable, { Product } from "@/components/dashboard/(products)/ProductTable";

const PALETTES = [
  { name: "Ocean", value: "#3B82F6" },
  { name: "Gray", value: "#808080" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Midnight", value: "#0F172A" },
];

const DEFAULT_FORM = {
  name: "", sku: "", description: "", quantity: 0,
  categoryId: 0, purchasePrice: 0, sellPrice: 0,
  minStockLevel: 5, brand: "", color: "#3B82F6", imageUrl: "",
};

const inputCls = `h-12 w-full rounded-2xl border-2 border-slate-200/80 bg-foreground/3 px-5 text-sm
  text-foreground placeholder:text-foreground/50 outline-none transition-all
  focus:border-primary focus:ring-1`;

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => fetchProducts(search),
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createM = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      closeForm();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      closeForm();
    },
  });

  const deleteM = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const products: Product[] = useMemo(() => (productsData as any)?.content || [], [productsData]);
  const busy = createM.isPending || updateM.isPending;

  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const available = products.filter(p => p.quantity > 0).length;

  const uniqueBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(brands);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchBrand = filterBrand === "all" || p.brand === filterBrand;
      const matchCat = filterCategory === "all" || p.categoryId.toString() === filterCategory;
      return matchBrand && matchCat;
    });
  }, [products, filterBrand, filterCategory]);

  const toggleForm = () => {
    if (showForm && !editId) {
      setShowForm(false);
    } else {
      setEditId(null);
      setForm(DEFAULT_FORM);
      setShowForm(true);
    }
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name, sku: p.sku, description: p.description || "",
      quantity: p.quantity, categoryId: p.categoryId,
      purchasePrice: p.purchasePrice, sellPrice: p.sellPrice,
      minStockLevel: p.minStockLevel, brand: p.brand || "",
      color: p.color || "#3B82F6", imageUrl: p.imageUrl || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateM.mutate({ id: editId, data: form });
    } else {
      createM.mutate(form);
    }
  };

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-8 text-foreground md:max-w-[1300px] mx-auto overflow-x-hidden max-w-full">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Products</p>
              <h2 className="text-3xl font-black text-foreground mt-1">{totalProducts}</h2>
            </div>
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Package2 size={24} /></div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Available</p>
              <h2 className="text-3xl font-black text-emerald-500 mt-1">{available}</h2>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center"><Check size={24} /></div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Out of Stock</p>
              <h2 className="text-3xl font-black text-rose-500 mt-1">{outOfStock}</h2>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center"><CircleSlash size={24} /></div>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Products List</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              className="h-10 rounded-2xl bg-card border border-border text-sm font-semibold px-4 shadow-sm outline-none cursor-pointer text-foreground"
            >
              <option value="all">All Categories</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select 
              value={filterBrand} 
              onChange={e => setFilterBrand(e.target.value)}
              className="h-10 rounded-2xl bg-card border border-border text-sm font-semibold px-4 shadow-sm outline-none cursor-pointer text-foreground"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map((b: any) => <option key={b as string} value={b as string}>{b as string}</option>)}
            </select>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Products..."  
                className="h-10 w-48 sm:w-64 pl-12 pr-4 rounded-2xl bg-card border border-border shadow-sm outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
            <button
              onClick={toggleForm}
              className="btn-gradient h-10 flex items-center gap-2 px-6 rounded-2xl font-bold cursor-pointer"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* Modal Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-card border border-border rounded-3xl shadow-2xl p-8 w-full max-w-4xl my-auto relative"
              >
                <button
                  onClick={closeForm}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-foreground shadow-sm shadow-accent flex items-center justify-center text-background">
                      <Package2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{editId ? 'Update Product' : 'Create New Product'}</h2>
                      <p className="text-sm text-foreground/60">Fill in the information below.</p>
                    </div>
                  </div>
                
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mr-4">
                  {/* Left Column: Basic Info */}
                  <div className="lg:col-span-2 space-y-6 ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">

                      <Field label="Product Name" icon={<Package2 size={12} />}>
                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="name " className={inputCls } style={{ paddingLeft: "1rem"  }} />
                      </Field>
                      <Field label="SKU" icon={<Hash size={12} />}>
                        <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. APP-IPH-15" className={inputCls} style={{ paddingLeft: "1rem" }} />
                      </Field>
                    <Field label="Category" icon={<Tag size={12} />}>
  <div className="relative ">
    <select
      required
      value={form.categoryId}
      onChange={(e) =>
        setForm({ ...form, categoryId: Number(e.target.value) })
      }
      className={`
        ${inputCls}
        appearance-none
        px-2 
        cursor-pointer
        backdrop-blur-xl
        border border-slate-200/70
        hover:border-indigo-300
        focus:border-indigo-500
        text-foreground
        font-medium
        shadow-sm
      `}
    >
      <option value={0} disabled>
        Select Category
      </option>

      {categories.map((c: any) => (
        <option
          key={c.id}
          value={c.id}
          className="bg-card text-foreground"
        >
          {c.name}
        </option>
      ))}
    </select>
  </div>
</Field>
                      <Field label="Brand" icon={<Boxes size={12} />}>
                        <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Apple" className={inputCls} style={{ paddingLeft: "1rem" ,}} />
                      </Field>
                    </div>
                    <Field label="Description">
                      <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the product details..." className={`${inputCls} h-auto py-4 resize-none rounded-2xl border-0 bg-transparent `}style={{ paddingLeft: "1rem" , paddingBottom: "1rem", height:"6rem" }} />
                    </Field>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 mb-4">
                      <Field label="Buy Price" >
                        <input type="number" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 })} className={inputCls} style={{ paddingLeft: "1rem" ,}} />
                      </Field>
                      <Field label="Sell Price">
                        <input type="number" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: parseFloat(e.target.value) || 0 })} className={inputCls} style={{ paddingLeft: "1rem" ,}} />
                      </Field>
                      <Field label="Quantity">
                        <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} className={inputCls} style={{ paddingLeft: "1rem" ,}} />
                      </Field>
                      <Field label="Min Stock">
                        <input type="number" value={form.minStockLevel} onChange={e => setForm({ ...form, minStockLevel: parseInt(e.target.value) || 0 })} className={inputCls} style={{ paddingLeft: "1rem" ,}} />
                      </Field>
                    </div>
                  </div>

                  {/* Right Column: Media & Color */}
                  <div className="space-y-8 p-6 rounded-[2rem] ">
                    <Field label="Product Image" icon={<ImagePlus size={12} />}>
                      <div className="flex gap-2 mb-3 bg-primary/10 p-1 rounded-xl border-none ">
                        <button type="button" onClick={() => setImageMode('url')} className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${imageMode === 'url' ? ' text-foreground shadow-md' : 'text-slate-500'}`}>URL</button>
                        <button type="button" onClick={() => setImageMode('upload')} className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${imageMode === 'upload' ? ' text-foreground shadow-md' : 'text-slate-500'}`}>Upload</button>
                      </div>
                      {imageMode === 'url' ? (
                        <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL...(https://..)" className={`${inputCls} h-12 bg-card/10 px-4`} />
                      ) : (
                        <div className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-card/50 text-foreground hover:border-indigo-400 transition-colors cursor-pointer">
                          <UploadCloud size={20} className="text-slate-400 mb-1" />
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          <span className="text-[10px] font-bold text-slate-500">CLICK TO UPLOAD</span>
                        </div>
                      )}
                    </Field>

                    <Field label="Product Theme Color" icon={<Palette size={12} />}>
                      <div className="grid grid-cols-3 gap-2 pt-4">
                        {PALETTES.map(pal => (
                          <button
                            key={pal.value}
                            type="button"
                            onClick={() => setForm({ ...form, color: pal.value })}
                            className={`h-10 rounded-2xl border-2 transition-all flex items-center justify-center ${form.color === pal.value ? 'border-indigo-500 bg-foreground ring-4 ring-indigo-500/10' : 'border-transparent bg-foreground/20 shadow-sm'}`}
                          >
                            <div className="w-5 h-5 rounded-full shadow-inner" style={{ background: pal.value }} />
                        
                          <label
      className={`
        relative h-5 rounded-full border-2 border-dashed
        flex items-center justify-center cursor-pointer
        overflow-hidden transition-all
        ${
          !PALETTES.some((p) => p.value === form.color)
            ? "border-indigo-500 ring-4 ring-indigo-500/15"
            : "border-slate-300 hover:border-slate-400"
        }
      `}
      style={{ background: form.color }}
    >
      <Palette size={16} className="text-white drop-shadow" />

      <input
        type="color"
        value={form.color}
        onChange={(e) =>
          setForm({ ...form, color: e.target.value })
        }
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </label>
        </button>
                        ))}
                      </div>
                    </Field>

                    <div className="pt-4 bg">
                      <button
                        type="submit"
                        disabled={busy}
                        className="w-full h-14 bg-linear-to-l from-blue-500 via-blue-800 to-indigo-900 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="animate-spin" /> : editId ? 'Update Product' : 'Create Product'}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Section */}
        <div className="bg-card text-foreground border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          
          </div>
          <ProductsTable
            products={filteredProducts}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={id => deleteM.mutate(id)}
            onViewDetails={setViewProduct}
            deletingId={deleteM.isPending ? (deleteM.variables as any) : null}
          />
        </div>

        {/* Product Details Modal */}
        <AnimatePresence>
          {viewProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setViewProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl"
              >
                <div className="relative h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {viewProduct.imageUrl ? (
                    <img src={viewProduct.imageUrl} alt={viewProduct.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package2 size={64} className="text-slate-300" />
                  )}
                  <button
                    onClick={() => setViewProduct(null)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {viewProduct.color && (
                      <span className="w-6 h-6 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: viewProduct.color }} />
                    )}
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-bold text-slate-800 shadow-sm">
                      {viewProduct.brand || 'No Brand'}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-1">{viewProduct.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-sm font-mono text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-lg">{viewProduct.sku}</p>
                        <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                          {categories.find((c: any) => c.id === viewProduct.categoryId)?.name || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{viewProduct.sellPrice.toFixed(2)} DH</div>
                      <div className="text-sm font-bold text-slate-400 mt-1">Cost: <span className="text-slate-500">{viewProduct.purchasePrice.toFixed(2)} DH</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{viewProduct.description || 'No description available.'}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock</span>
                      <span className="text-lg font-black text-slate-900">{viewProduct.quantity}</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Min Level</span>
                      <span className="text-lg font-black text-slate-900">{viewProduct.minStockLevel}</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                      <span className={`text-sm font-bold mt-1 ${viewProduct.quantity === 0 ? "text-rose-500" : viewProduct.quantity <= viewProduct.minStockLevel ? "text-amber-500" : "text-emerald-500"}`}>
                        {viewProduct.quantity === 0 ? 'Empty' : viewProduct.quantity <= viewProduct.minStockLevel ? 'Low' : 'In Stock'}
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Added On</span>
                      <span className="text-xs font-bold text-slate-900 mt-1">
                        {viewProduct.createdAt ? new Date(viewProduct.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}