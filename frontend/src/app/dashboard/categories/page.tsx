"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Plus, Search, Shapes, Laptop, Smartphone,
  Headphones, Monitor, Gamepad2, Package2, MoreVertical,
  Pencil, Trash2, X, Loader2, Tag, Coffee, Car, Watch,
  Tv, Camera, Speaker, HardDrive, ArrowUpDown, ChevronRight,
  Layers, Check,
  FileText, TrendingUp, LayoutGrid, List
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchProducts,
} from "@/lib/api";

const iconMap: Record<string, React.ElementType> = {
  Laptop, Smartphone, Headphones, Gamepad2, Monitor,
  Tag, Coffee, Car, Watch, Tv, Camera, Speaker, HardDrive, Package2
};

const availableIcons = Object.keys(iconMap);

const tokens = [
  { iconBg: "rgba(99,102,241,0.12)",  iconColor: "#6366f1" },
  { iconBg: "rgba(139,92,246,0.12)",  iconColor: "#8b5cf6" },
  { iconBg: "rgba(236,72,153,0.12)",  iconColor: "#ec4899" },
  { iconBg: "rgba(245,158,11,0.12)",  iconColor: "#f59e0b" },
  { iconBg: "rgba(16,185,129,0.12)",  iconColor: "#10b981" },
  { iconBg: "rgba(59,130,246,0.12)",  iconColor: "#3b82f6" },
];

const springConfig = { type: "spring", stiffness: 300, damping: 28 };

import { CategoryForm } from "@/components/dashboard/(categories)/CategoryForm";
import { CategoryCard } from "@/components/dashboard/(categories)/CategoryCard";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch]             = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [editId, setEditId]             = useState<number | null>(null);
  const [form, setForm]                 = useState({ name: "", icon: "Tag", description: "" });
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [sortKey, setSortKey]           = useState<"name" | "count" | "id">("name");
  const [filter, setFilter]             = useState<"all" | "active" | "empty">("all");
  const [viewMode, setViewMode]         = useState<"grid" | "list">("list");
  const [formError, setFormError]       = useState("");
  const [toast, setToast]               = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const { data: categoriesData = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: rawProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(undefined, 0, 1000),
  });

  const productList = useMemo(() => {
    if (!rawProducts) return [];
    const p = rawProducts as any;
    if (Array.isArray(p)) return p;
    return p.content || p.data?.data || p.data || p.products || p.results || p.items || [];
  }, [rawProducts]);

  const categoryList = useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    const c = categoriesData as any;
    return c.data?.data || c.data || c.categories || [];
  }, [categoriesData]);

  const totalProductsCount = useMemo(() => {
    if (!rawProducts) return 0;
    const p = rawProducts as any;
    return p.totalElements ?? p.total_elements ?? productList.length;
  }, [rawProducts, productList]);

  const productCountMap = useMemo(() => {
    const counts: Record<number, number> = {};
    const stock: Record<number, number> = {};
    productList.forEach((p: any) => {
      const catId = p.categoryId || p.category_id || p.category?.id;
      if (catId) {
        const id = Number(catId);
        counts[id] = (counts[id] || 0) + 1;
        stock[id]  = (stock[id]  || 0) + (p.quantity || 0);
      }
    });
    return { counts, stock };
  }, [productList]);

  const { counts: prodCounts, stock: prodStock } = productCountMap;

  const createM = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); closeForm(); showToast("Category created!"); },
    onError: (e: any) => setFormError(e?.message || "Failed to create category"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); closeForm(); showToast("Category updated!"); },
    onError: (e: any) => setFormError(e?.message || "Failed to update category"),
  });

  const deleteM = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); showToast("Category deleted!"); },
  });

  const filtered = useMemo(() => {
    let list = categoryList.filter((c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === "active") list = list.filter((c: any) => (prodCounts[c.id] || 0) > 0);
    if (filter === "empty")  list = list.filter((c: any) => (prodCounts[c.id] || 0) === 0);
    
    return [...list].sort((a, b) => {
      if (sortKey === "name")  return a.name.localeCompare(b.name);
      if (sortKey === "count") return (prodCounts[b.id] || 0) - (prodCounts[a.id] || 0);
      return b.id - a.id;
    });
  }, [categoryList, search, filter, sortKey, prodCounts]);

  const busy = createM.isPending || updateM.isPending;

  const closeForm = () => { 
    setShowForm(false); 
    setEditId(null); 
    setForm({ name: "", icon: "Tag", description: "" });
    setFormError("");
  };

  const toggleForm = () => { 
    if (showForm && !editId) { setShowForm(false); return; } 
    setEditId(null); 
    setForm({ name: "", icon: "Tag", description: "" }); 
    setShowForm(true); 
  };

  const openEdit = (cat: any) => { 
    setEditId(cat.id); 
    setForm({ 
      name: cat.name, 
      icon: cat.icon || "Tag", 
      description: cat.description || "" 
    }); 
    setShowForm(true); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name.trim()) { setFormError("Name is required"); return; }
    setFormError("");
    if (editId) {
      updateM.mutate({ id: editId, data: form });
    } else {
      createM.mutate(form);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-8 pb-32 md:px-8 md:pt-10 relative overflow-hidden text-foreground">
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Store Catalog</p>
            <h1 className="text-4xl font-black tracking-tight">Categories</h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="flex gap-2"
          >
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md border border-border rounded-2xl px-4 py-2 shadow-sm">
              <Layers size={14} className="text-primary" />
              <span className="text-xs font-bold">{categoryList.length} Total</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md border border-border rounded-2xl px-4 py-2 shadow-sm">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-xs font-bold">{totalProductsCount} Products</span>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="h-12 pl-11 pr-10 rounded-2xl bg-card border-border shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>

          <div className="lg:col-span-4 flex items-center gap-2">
            <div className="flex-1 flex bg-card border border-border rounded-2xl p-1 shadow-sm">
              {(["all", "active", "empty"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filter === f ? "btn-gradient text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <div className="flex bg-card border border-border rounded-2xl p-1 shadow-sm">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}><List size={16} /></button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showForm && (
            <CategoryForm
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              onClose={closeForm}
              editId={editId}
              busy={busy}
              error={formError}
            />
          )}
        </AnimatePresence>

        {catLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-3xl bg-card animate-pulse border border-border" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-20 bg-card/30 border-2 border-dashed border-border rounded-[3rem] text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 text-primary shadow-inner">
              <Shapes size={40} className="animate-bounce" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">
              {filter === "all" ? "No Categories Created" : `No ${filter} categories found`}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-3 leading-relaxed font-medium">
              {filter === "all" 
                ? "Your catalog is currently empty. Start by creating a new category to organize your products."
                : `There are no ${filter} categories to display. Try changing the filters or create a new one.`}
            </p>
            <div className="flex gap-4 m">
               <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }} className="rounded-2xl font-bold px-8 h-12">Show All</Button>
               <Button onClick={toggleForm} className="rounded-2xl font-bold px-8 h-12 btn-gradient text-white shadow-lg shadow-primary/20">Add Category</Button>
            </div>
          </motion.div>
        ) : (
          <LayoutGroup>
            <motion.div layout className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
              <AnimatePresence mode="popLayout">
                {filtered.map((cat: any, i: number) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    index={i}
                    viewMode={viewMode}
                    productCount={prodCounts[cat.id] || 0}
                    stockCount={prodStock[cat.id] || 0}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <motion.button
          onClick={toggleForm}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-3 h-14 px-8 rounded-full font-black text-sm shadow-2xl transition-all duration-500 cursor-pointer ${
            showForm && !editId ? "bg-card border border-border text-foreground" : "btn-gradient text-white shadow-primary/30"
          }`}
        >
          <motion.div animate={{ rotate: showForm && !editId ? 135 : 0 }}><Plus size={20} strokeWidth={3} /></motion.div>
          {showForm && !editId ? "Close Panel" : "New Category"}
        </motion.button>
      </div>

      <DeleteConfirmationDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category?"
        description={(
          <>
            This action cannot be undone. Deleting{" "}
            <strong className="text-foreground">{deleteTarget?.name}</strong>{" "}
            will un-categorize all products in this collection.
          </>
        )}
        onConfirm={() => {
          if (deleteTarget !== null) {
            deleteM.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 bg-emerald-600 text-white px-6 py-2.5 rounded-full shadow-2xl text-sm font-bold">
          {toast}
        </div>
      )}
    </div>
  );
}