"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, X, Package2, Hash, Tag,
  Boxes, ImagePlus, Check, Palette,
  Loader2, UploadCloud, CircleSlash, Filter,
  MoreVertical, LayoutGrid, List, Edit3, Trash2, Eye, Pipette,
  PowerOff, Power
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQuery, useQueryClient } from "@/lib/react-query-custom";
import { fetchProducts, createProduct, updateProduct, deleteProduct, deleteProducts, fetchCategories, fetchDashboardStats, toggleProductActive } from "@/lib/api";
import ProductsTable, { Product } from "@/components/dashboard/(products)/ProductTable";
import { useActivityLog } from "@/lib/activityLog";

const PALETTES = [
  { name: "Ocean",    value: "#3B82F6" },
  { name: "Gray",     value: "#808080" },
  { name: "Rose",     value: "#F43F5E" },
  { name: "Emerald",  value: "#10B981" },
  { name: "Amber",    value: "#F59E0B" },
  { name: "Midnight", value: "#0F172A" },
];

const DEFAULT_FORM = {
  name: "", sku: "", description: "", quantity: 0,
  categoryId: 0, purchasePrice: 0, sellPrice: 0,
  minStockLevel: 5, brand: "", color: "#3B82F6", imageUrl: "",
};

const inputCls = `h-12 w-full rounded-2xl border border-border bg-card/50 px-5 text-sm
  text-foreground placeholder:text-muted-foreground/50 outline-none transition-all
  focus:ring-2 focus:ring-primary/20 focus:border-primary`;

// --- Actions Menu ---
function ProductActions({
  onEdit, onDelete, onView, onToggleActive, isDeleting, isToggling, isActive
}: {
  onEdit: () => void; onDelete: () => void; onView: () => void; onToggleActive: () => void; isDeleting?: boolean; isToggling?: boolean; isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-2 hover:bg-muted/20 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
      >
        <MoreVertical size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl z-[10] overflow-hidden backdrop-blur-xl cursor-default"
          >
            <div className="p-2 space-y-1">
              <button onClick={() => { onView(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-1 text-sm font-bold hover:bg-muted/10 rounded-xl transition-all cursor-pointer">
                <Eye size={16} /> View Details
              </button>
              <button onClick={() => { onEdit(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-1.5 text-sm font-bold text-foreground hover:bg-muted/10 rounded-xl transition-all cursor-pointer">
                <Edit3 size={16} className="text-amber-500" /> Edit Product
              </button>
              
              <div className="h-px bg-border my-1" />
              
              <button
                disabled={isToggling}
                onClick={() => { onToggleActive(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-sm font-bold text-foreground hover:bg-muted/10 rounded-xl transition-all cursor-pointer"
              >
                {isToggling ? <Loader2 size={16} className="animate-spin text-slate-500" /> : 
                  isActive ? <PowerOff size={16} className="text-slate-500" /> : <Power size={16} className="text-emerald-500" />
                }
                {isActive ? "Deactivate" : "Activate"}
              </button>
              
              <div className="h-px bg-border my-1" />
              <button
                disabled={isDeleting}
                onClick={() => { onDelete(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-muted-foreground/80">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, iconBg, iconColor, valueColor, primary = false }: {
  icon: React.ReactNode; label: string; value: number;
  iconBg: string; iconColor: string; valueColor: string; primary?: boolean;
}) {
  return (
    <div className={`bg-card/40 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-center border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 select-none ${primary ? "border-primary/30 ring-1 ring-primary/5" : "border-border"}`} style={{ minHeight: 140 }}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} ${iconColor} shadow-inner`}>{icon}</div>
      <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">{label}</p>
      <p className={`text-4xl font-black tabular-nums tracking-tight ${valueColor}`}>{value}</p>
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const nativeRef = useRef<HTMLInputElement>(null);

  // Check if current value matches a preset
  const isPreset = PALETTES.some(p => p.value.toLowerCase() === value.toLowerCase());

  return (
    <div className="space-y-3">
      {/* Preset swatches */}
      <div className="grid grid-cols-3 gap-3">
        {PALETTES.map((pal) => (
          <button
            key={pal.value}
            type="button"
            onClick={() => { onChange(pal.value); setShowCustom(false); }}
            className={`h-12 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
              value === pal.value
                ? "border-primary ring-4 ring-primary/10"
                : "border-transparent bg-muted/10"
            }`}
          >
            <div className="w-5 h-5 rounded-full shadow-lg" style={{ background: pal.value }} />
            <span className="text-[10px] font-bold text-muted-foreground">{pal.name}</span>
          </button>
        ))}

        {/* Custom swatch button */}
        <button
          type="button"
          onClick={() => {
            setShowCustom((v) => !v);
            if (!isPreset) setTimeout(() => nativeRef.current?.click(), 50);
          }}
          className={`h-12 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
            !isPreset
              ? "border-primary ring-4 ring-primary/10"
              : "border-dashed border-border bg-muted/5 hover:bg-muted/10"
          }`}
        >
          {!isPreset ? (
            <>
              <div className="w-5 h-5 rounded-full shadow-lg" style={{ background: value }} />
              <span className="text-[10px] font-bold text-muted-foreground">Custom</span>
            </>
          ) : (
            <>
              <Pipette size={14} className="text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground">Custom</span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {(showCustom || !isPreset) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/5 border border-border/60">
              {/* Native color wheel */}
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border shadow-inner overflow-hidden"
                  style={{ background: value }}
                  onClick={() => nativeRef.current?.click()}
                  title="Open color picker"
                >
                  <input
                    ref={nativeRef}
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    tabIndex={-1}
                  />
                </div>
              </div>

              {/* Hex text input */}
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hex code</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const v = e.target.value;
                    // Accept partial input but only call onChange for valid hex
                    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
                    else if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                      e.target.value = v;
                    }
                  }}
                  onBlur={(e) => {
                    if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                      e.target.value = value;
                    }
                  }}
                  maxLength={7}
                  placeholder="#3B82F6"
                  className={`${inputCls} h-10 font-mono uppercase`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preview</label>
                <div
                  className="w-20 h-10 rounded-xl border border-border shadow-inner"
                  style={{ background: value }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { addLog } = useActivityLog();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | Product[] | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search, filterActive, filterStock, filterCategory, filterBrand],
    queryFn: () => fetchProducts(search, 0, 100, {
      isActive: filterActive !== "all" ? filterActive : undefined,
      stockStatus: filterStock !== "all" ? filterStock : undefined,
      categoryId: filterCategory !== "all" ? Number(filterCategory) : undefined,
      brand: filterBrand !== "all" ? filterBrand : undefined,
    }),
  });

  const { data: statsData } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createM = useMutation({
    mutationFn: createProduct,
    onSuccess: (data: any) => { qc.invalidateQueries({ queryKey: ["products"] }); closeForm(); showToast("Product created!"); addLog(`Created product: ${data.name}`, "product"); },
    onError: (e: any) => setFormError(e?.message || "Failed to create product"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateProduct(id, data),
    onSuccess: (data: any) => { qc.invalidateQueries({ queryKey: ["products"] }); closeForm(); showToast("Product updated!"); addLog(`Updated product: ${data.name}`, "product"); },
    onError: (e: any) => setFormError(e?.message || "Failed to update product"),
  });

  const deleteM = useMutation({
    mutationFn: (p: Product) => deleteProduct(p.id),
    onSuccess: (_, p) => { qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["dashboardStats"] }); showToast("Product deleted!"); addLog(`Deleted product: ${p.name}`, "product"); },
  });

  const deleteMultipleM = useMutation({
    mutationFn: (ids: number[]) => deleteProducts(ids),
    onSuccess: (_, ids) => { 
      qc.invalidateQueries({ queryKey: ["products"] }); 
      qc.invalidateQueries({ queryKey: ["dashboardStats"] }); 
      showToast(`Deleted ${ids.length} products!`);
      addLog(`Deleted ${ids.length} products in batch`, "product"); 
    },
    onError: (e: any) => showToast(e?.message || "Failed to delete products"),
  });

  const toggleActiveM = useMutation({
    mutationFn: toggleProductActive,
    onSuccess: (data: any) => { qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["dashboardStats"] }); showToast("Product status updated!"); addLog(`${data.isActive ? "Activated" : "Deactivated"} product: ${data.name}`, "product"); },
    onError: (e: any) => setFormError(e?.message || "Failed to toggle status"),
  });

  const products: Product[] = useMemo(() => (productsData as any)?.content || [], [productsData]);
  const busy = createM.isPending || updateM.isPending;

  const filteredProducts = products; // Backend already does filtering

  const toggleForm = () => {
    if (showForm && !editId) setShowForm(false);
    else { setEditId(null); setForm(DEFAULT_FORM); setShowForm(true); }
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name, sku: p.sku, description: p.description || "", quantity: p.quantity,
      categoryId: p.categoryId, purchasePrice: p.purchasePrice, sellPrice: p.sellPrice,
      minStockLevel: p.minStockLevel, brand: p.brand || "", color: p.color || "#3B82F6",
      imageUrl: p.imageUrl || "",
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(DEFAULT_FORM); setFormError(""); };

 const handleSubmit = (e?: React.FormEvent) => {
  e?.preventDefault();

  // Required fields
  if (!form.name.trim() || !form.sku.trim() || !form.categoryId) {
    setFormError("Name, SKU and Category are required");
    return;
  }

  // Number validation
  if (
    form.purchasePrice <= 0 ||
    form.sellPrice <= 0 ||
    form.quantity < 0 ||
    form.minStockLevel < 0
  ) {
    setFormError("Please enter valid values");
    return;
  }

  setFormError("");

  if (editId !== null) {
    updateM.mutate({
      id: editId,
      data: { ...form, isActive: products.find(p => p.id === editId)?.isActive ?? true },
    });
  } else {
    createM.mutate({ ...form, isActive: true });
  }
};

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 py-8 md:px-8 lg:px-12 space-y-10">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={<Package2 size={24} />} label="Total" value={statsData?.totalProducts || 0} iconBg="bg-primary/10" iconColor="text-primary" valueColor="text-blue-500"  />
          <StatCard icon={<Check size={24} />} label="Available" value={statsData?.availableCount || 0} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" valueColor="text-emerald-500" />
          <StatCard icon={<PowerOff size={24} />} label="Deactivated" value={statsData?.deactivatedCount || 0} iconBg="bg-slate-500/10" iconColor="text-slate-500" valueColor="text-slate-500" />
          <StatCard icon={<CircleSlash size={24} />} label="Out of Stock" value={statsData?.outOfStockCount || 0} iconBg="bg-rose-500/10" iconColor="text-rose-500" valueColor="text-rose-500" />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-4xl font-black tracking-tight text-foreground">Product List</h1>
            <button onClick={toggleForm} className="btn-gradient h-12 flex items-center justify-center gap-2 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              <Plus size={20} /> Add Product
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/30 p-4 rounded-[2.5rem] border border-border backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." className="h-11 w-full pl-12 pr-4 rounded-2xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-1 p-1 bg-background border border-border rounded-2xl mr-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-xl transition-all ${viewMode === "table" ? "btn-gradient duration-300 ease-in-out shadow-lg" : "text-muted-foreground hover:bg-primary/10 ease-out duration-300"}`}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "btn-gradient duration-300 ease-in-out shadow-lg" : "text-muted-foreground hover:bg-primary/10"}`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-2xl">
                <Power size={14} className="text-muted-foreground" />
                <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer pr-2">
                  <option value="all" className="bg-background text-foreground">Status</option>
                  <option value="true" className="bg-background text-foreground">Active</option>
                  <option value="false" className="bg-background text-foreground">Deactivated</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-2xl">
                <Check size={14} className="text-muted-foreground" />
                <select value={filterStock} onChange={e => setFilterStock(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer pr-2">
                  <option value="all" className="bg-background text-foreground">Stock</option>
                  <option value="IN_STOCK" className="bg-background text-foreground">In Stock</option>
                  <option value="LOW_STOCK" className="bg-background text-foreground">Low Stock</option>
                  <option value="OUT_OF_STOCK" className="bg-background text-foreground">Out of Stock</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-2xl">
                <Filter size={14} className="text-muted-foreground" />
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer pr-2 max-w-[120px]">
                  <option value="all" className="bg-background text-foreground">Categories</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id} className="bg-background text-foreground">{c.name}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-2xl">
                <Boxes size={14} className="text-muted-foreground" />
                <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer pr-2 max-w-[120px]">
                  <option value="all" className="bg-background text-foreground">Brands</option>
                  {[...new Set(products.map(p => p.brand).filter(Boolean))].map((b) => (
                    <option key={b} value={b} className="bg-background text-foreground">{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          {viewMode === "table" ? (
            <div className="relative rounded-[2.5rem] border border-border bg-card/30 backdrop-blur-md overflow-hidden transition-all">
              <div className="h-2" />
              <div className="p-1 md:p-0">
                <ProductsTable
                  products={filteredProducts}
                  isLoading={isLoading}
                  onEdit={openEdit}
                  onDelete={p => setDeleteTarget(p)}
                  onDeleteSelected={prods => setDeleteTarget(prods)}
                  onViewDetails={setViewProduct}
                  onToggleActive={(p) => toggleActiveM.mutate(p.id)}
                  deletingId={deleteM.isPending ? deleteM.variables?.id : null}
                  togglingId={toggleActiveM.isPending ? (toggleActiveM.variables as any) : null}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  className="group bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-48 bg-muted/10 flex items-center justify-center overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <Package2 size={40} className="text-muted-foreground/20" />
                    )}
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md rounded-2xl p-1 border border-border shadow-lg">
                      <ProductActions
                        onEdit={() => openEdit(p)}
                        onDelete={() => setDeleteTarget(p)}
                        onView={() => setViewProduct(p)}
                        onToggleActive={() => toggleActiveM.mutate(p.id)}
                        isDeleting={deleteM.isPending && deleteM.variables?.id === p.id}
                        isToggling={toggleActiveM.isPending && (toggleActiveM.variables as any) === p.id}
                        isActive={p.isActive !== false}
                      />
                    </div>
                    {p.quantity === 0 ? (
                      <div className="absolute top-4 left-4 bg-rose-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Out of Stock</div>
                    ) : p.quantity <= p.minStockLevel ? (
                      <div className="absolute top-4 left-4 bg-amber-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Low Stock</div>
                    ) : null}
                    {p.quantity > p.minStockLevel && p.isActive && (
                      <div className="absolute top-4 left-4 bg-blue-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Available</div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-lg truncate pr-2">{p.name}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.brand || "Generics"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary">{p.sellPrice} DH</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-[11px] font-bold text-muted-foreground">{p.quantity} in stock</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/60">{p.sku}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
   {/* --- Modals (Form & Details) --- */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg"
            >
              <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 40 }}
                className="bg-card border border-border rounded-[2rem] shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto relative mt-16 mb-2"
              >
                <button
                  onClick={closeForm}
                  className="absolute top-8 right-8 p-2 rounded-2xl cursor-pointer hover:bg-foreground/20 text-foreground transition-colors z-10 bg-foreground/5"
                >
                  <X size={24} />
                </button>

                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-14 h-14 rounded-[1.25rem] btn-gradient flex items-center justify-center shadow-xl">
                      <Package2 size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black">{editId ? "Edit Product" : "New Product"}</h2>
                      <p className="text-muted-foreground font-medium">Define your product specifications</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left column */}
                    <div className="lg:col-span-7 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Name" icon={<Package2 size={12} />}>
                          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter name" className={inputCls} />
                        </Field>
                        <Field label="SKU" icon={<Hash size={12} />}>
                          <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" className={inputCls} />
                        </Field>
                        <Field label="Category" icon={<Tag size={12} />}>
                          <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })} className={`${inputCls} appearance-none cursor-pointer`}>
                            <option value={0} disabled>Select</option>
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </Field>
                        <Field label="Brand" icon={<Boxes size={12} />}>
                          <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Brand" className={inputCls} />
                        </Field>
                      </div>

                      <Field label="Description">
                        <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product narrative..." className={`${inputCls} h-32 py-4 resize-none`} />
                      </Field>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-muted/5 border border-border/50">
                        <Field label="Purchase (DH)">
                          <input type="number" value={form.purchasePrice} onChange={e =>
                            setForm({
                              ...form,
                              purchasePrice: e.target.value === "" ? 0 : Number.parseFloat(e.target.value),
                            })
                          } className={inputCls} />
                        </Field>
                        <Field label="Sell (DH)">
                          <input type="number" value={form.sellPrice} onChange={e =>
                            setForm({
                              ...form,
                              sellPrice: e.target.value === "" ? 0 : Number.parseFloat(e.target.value),
                            })
                          } className={inputCls} />
                        </Field>
                        <Field label="Stock">
                          <input type="number" value={form.quantity} onChange={e =>
                            setForm({
                              ...form,
                              quantity: e.target.value === "" ? 0 : Number.parseInt(e.target.value),
                            })
                          } className={inputCls} />
                        </Field>
                        <Field label="Alert At">
                          <input type="number" value={form.minStockLevel} onChange={e =>
                            setForm({
                              ...form,
                              minStockLevel: e.target.value === "" ? 0 : Number.parseInt(e.target.value),
                            })
                          } className={inputCls} />
                        </Field>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-5 space-y-8">
                      <Field label="Media" icon={<ImagePlus size={12} />}>
                        <div className="space-y-4">
                          <div className="flex gap-1 p-1 bg-muted/10 rounded-2xl">
                            {(["url", "upload"] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setImageMode(mode)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${imageMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>

                          {imageMode === "url" ? (
                            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className={inputCls} />
                          ) : (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="group h-48 border-2 border-dashed border-border rounded-[2rem] flex flex-col items-center justify-center gap-3 bg-muted/5 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer overflow-hidden"
                            >
                              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                              {form.imageUrl && imageMode === "upload" ? (
                                <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" />
                              ) : (
                                <>
                                  <div className="p-4 rounded-2xl bg-background shadow-sm group-hover:scale-110 transition-transform">
                                    <UploadCloud size={24} className="text-primary" />
                                  </div>
                                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Drop or Click</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </Field>

                      {/*  Visual Identity  */}
                      <Field label="Visual Identity" icon={<Palette size={12} />}>
                        <ColorPicker
                          value={form.color}
                          onChange={(color) => setForm({ ...form, color })}
                        />
                      </Field>

                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={busy}
                        className="w-60 h-12 btn-gradient rounded-3xl mt-8 font-black text-[14px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-foreground/10 mx-auto"
                      >
                        {busy ? <Loader2 className="animate-spin" size={24} /> : (editId ? "Save Changes" : "Create Product")}
                      </button>
                      {formError && (
                        <p className="text-rose-500 text-sm font-semibold mt-3 text-center">{formError}</p>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
              onClick={() => setViewProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl"
              >
                <div className="relative h-72 bg-background backdrop-blur-xl flex items-center justify-center">
                  {viewProduct.imageUrl ? (
                    <img src={viewProduct.imageUrl} alt={viewProduct.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package2 size={80} className="text-muted-foreground/20" />
                  )}
                  <button
                    onClick={() => setViewProduct(null)}
                    className="absolute top-6 right-6 p-3 bg-background/80 hover:bg-background text-foreground rounded-2xl backdrop-blur-md transition-all shadow-lg"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-6 left-6 flex gap-3 items-center">
                    {viewProduct.color && (
                      <span className="w-8 h-8 rounded-full border-2 border-background/60 shadow-2xl" style={{ backgroundColor: viewProduct.color }} />
                    )}
                    <span className="px-4 py-1.5 rounded-xl bg-foreground backdrop-blur text-[10px] font-black uppercase tracking-widest text-background shadow-sm border border-border">
                      {viewProduct.brand || "Generics"}
                    </span>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-4xl font-black tracking-tight">{viewProduct.name}</h2>
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-xs font-bold font-mono text-muted-foreground bg-background px-3 py-1 rounded-lg border border-border/50">{viewProduct.sku}</span>
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg uppercase tracking-[0.15em]">
                          {categories.find((c: any) => c.id === viewProduct.categoryId)?.name || "Default"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-foreground">{viewProduct.sellPrice.toLocaleString()} DH</div>
                      <div className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">Cost: {viewProduct.purchasePrice} DH</div>
                    </div>
                  </div>

                  <div className="bg-background/80 backdrop-blur-xl rounded-3xl p-6 border border-border/50">
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">{viewProduct.description || "No description provided for this item."}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Stock",   value: viewProduct.quantity },
                      { label: "Minimum", value: viewProduct.minStockLevel },
                      {
                        label: "Status",
                        value: viewProduct.quantity === 0 ? "Out of stock" : viewProduct.quantity <= viewProduct.minStockLevel ? "Low stock" : "In stock",
                        color: viewProduct.quantity === 0 ? "text-rose-500" : viewProduct.quantity <= viewProduct.minStockLevel ? "text-amber-500" : "text-emerald-500",
                      },
                      {
                        label: "Added",
                        value: viewProduct.createdAt ? new Date(viewProduct.createdAt).toLocaleDateString() : "N/A",
                        isSmall: true,
                      },
                    ].map(item => (
                      <div key={item.label} className="bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">{item.label}</span>
                        <span className={`font-black tracking-tight ${(item as any).color || "text-foreground"} ${(item as any).isSmall ? "text-sm" : "text-xl"}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl border-border/40 bg-background/80 backdrop-blur-3xl p-8 text-center max-w-sm sm:max-w-md overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-rose-500/10 to-transparent pointer-events-none" />
          <AlertDialogHeader className="relative z-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-linear-to-b from-rose-500/10 to-transparent border border-rose-500/10 flex items-center text-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-foreground w-full text-center sm:text-center">
              {Array.isArray(deleteTarget) ? `Delete ${deleteTarget.length} Products?` : "Delete Product?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium leading-relaxed w-full text-center sm:text-center">
              {Array.isArray(deleteTarget) ? (
                <>
                  This action cannot be undone. Deleting{" "}
                  <strong className="text-foreground">{deleteTarget.length} products</strong>{" "}
                  will permanently remove them from your inventory.
                </>
              ) : (
                <>
                  This action cannot be undone. Deleting{" "}
                  <strong className="text-foreground">{deleteTarget?.name}</strong>{" "}
                  will permanently remove it from your inventory.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="relative z-10 sm:justify-center gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl h-12 px-6 font-semibold cursor-pointer border-none transition-all flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl h-12 px-6 font-semibold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer border-none shadow-lg shadow-rose-500/25 transition-all flex-1"
              onClick={() => {
                if (deleteTarget !== null) {
                  if (Array.isArray(deleteTarget)) {
                    deleteMultipleM.mutate(deleteTarget.map(p => p.id));
                  } else {
                    deleteM.mutate(deleteTarget);
                  }
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 btn-gradient text-white px-6 py-2.5 rounded-full shadow-2xl text-sm font-bold">
          {toast}
        </div>
      )}
    </div>
  );
}