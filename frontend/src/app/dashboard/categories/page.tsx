"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Plus, Search, Shapes, Laptop, Smartphone,
  Headphones, Monitor, Gamepad2, Package2, MoreVertical,
  Pencil, Trash2, X, Loader2, Tag, Coffee, Car, Watch,
  Tv, Camera, Speaker, HardDrive, ArrowUpDown, ChevronRight,
  TrendingUp, LayoutGrid, List, Layers, Check, AlertCircle,
  FileText
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
    // Backend returns a Page object with a .content array
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

  const totalProductsCount = productList.length;

  const productCountMap = useMemo(() => {
    const counts: Record<number, number> = {};
    productList.forEach((p: any) => {
      const catId = p.categoryId || p.category_id || p.category?.id;
      if (catId) counts[Number(catId)] = (counts[Number(catId)] || 0) + 1;
    });
    return counts;
  }, [productList]);

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const filtered = useMemo(() => {
    let list = categoryList.filter((c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === "active") list = list.filter((c: any) => (productCountMap[c.id] || 0) > 0);
    if (filter === "empty")  list = list.filter((c: any) => (productCountMap[c.id] || 0) === 0);
    
    return [...list].sort((a, b) => {
      if (sortKey === "name")  return a.name.localeCompare(b.name);
      if (sortKey === "count") return (productCountMap[b.id] || 0) - (productCountMap[a.id] || 0);
      return b.id - a.id;
    });
  }, [categoryList, search, filter, sortKey, productCountMap]);

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

        {/* Filter Toolbar */}
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

        {/* Form Panel */}
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12"><Shapes size={150} /></div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black">{editId ? "Update Category" : "Create New Category"}</h2>
                  <p className="text-xs text-muted-foreground mt-1">Refine your catalog organization.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={closeForm} className="rounded-full bg-secondary/50"><X size={16} /></Button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1">Display Name</label>
                    <Input 
                      required 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      placeholder="e.g., Electronics" 
                      className="h-14 rounded-2xl bg-background text-base font-semibold border-border" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1 flex items-center gap-2">
                      <FileText size={12} /> Description (Optional)
                    </label>
                    <textarea 
                      value={form.description} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Add details about this collection..."
                      className="w-full min-h-[100px] p-4 rounded-2xl bg-background text-sm font-medium border border-border focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={busy || !form.name.trim()}
                      className="flex-1 h-14 rounded-2xl font-bold btn-gradient text-white shadow-lg shadow-primary/20"
                    >
                      {busy ? <Loader2 className="animate-spin" /> : editId ? "Save Changes" : "Confirm Creation"}
                    </Button>
                  </div>
                  {formError && (
                    <p className="text-rose-500 text-sm font-semibold mt-2 px-1">{formError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1">Icon Selection</label>
                  <div className="grid grid-cols-5 gap-2 p-4 bg-background rounded-[1.5rem] border border-border max-h-[300px] overflow-y-auto">
                    {availableIcons.map((iconName) => {
                      const IconComp = iconMap[iconName];
                      const isSelected = form.icon === iconName;
                      return (
                        <button 
                          key={iconName} 
                          type="button" 
                          onClick={() => setForm({ ...form, icon: iconName })} 
                          className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                            isSelected ? "btn-gradient text-white scale-110 shadow-lg" : "hover:bg-secondary text-muted-foreground"
                          }`}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories List */}
        {catLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-3xl bg-card animate-pulse border border-border" />)}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State Card */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-20 bg-card/30 border-2 border-dashed border-border rounded-[3rem] text-center"
          >
            <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mb-4 text-muted-foreground">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold">No Categories Found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-2 leading-relaxed">
              We couldn't find any categories matching the "{filter}" filter or your search criteria.
            </p>
            <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }} className="mt-6 rounded-xl font-bold">Clear Filters</Button>
          </motion.div>
        ) : (
          <LayoutGroup>
            <motion.div layout className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
              <AnimatePresence mode="popLayout">
                {filtered.map((cat: any, i: number) => {
                  const Icon = iconMap[cat.icon] || Tag;
                  const tok = tokens[i % tokens.length];
                  const count = productCountMap[cat.id] || 0;

                  return (
                    <motion.div
                      key={cat.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      whileHover={{ y: -2 }}
                      className={`group relative bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-200 ${
                        viewMode === "grid" ? "rounded-[2rem] p-6" : "rounded-2xl p-4 flex items-center gap-4"
                      }`}
                    >
                      <div className={`flex items-center justify-center shrink-0 shadow-inner ${viewMode === "grid" ? "w-14 h-14 rounded-2xl mb-4" : "w-11 h-11 rounded-xl"}`} style={{ background: tok.iconBg, color: tok.iconColor }}>
                        <Icon size={viewMode === "grid" ? 28 : 20} strokeWidth={1.5} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-bold truncate ${viewMode === "grid" ? "text-lg" : "text-sm"}`}>{cat.name}</h3>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${count > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                            {count > 0 ? "Active" : "Empty"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                          {count} {count === 1 ? "Product" : "Products"} in collection
                        </p>
                      </div>

                      <div className={viewMode === "grid" ? "mt-6 pt-4 border-t border-border/50 flex items-center justify-between" : "flex items-center gap-2"}>
                        <span className="text-[10px] font-bold text-muted-foreground/40"># {cat.id}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary cursor-pointer">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 backdrop-blur-xl border-border">
                            <DropdownMenuItem onClick={() => openEdit(cat)} className="rounded-lg text-xs font-semibold gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                              <Pencil size={12} /> Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteTarget(cat)} className="rounded-lg text-xs font-semibold gap-2 text-destructive focus:bg-destructive/10 cursor-pointer">
                              <Trash2 size={12} /> Delete Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}
      </div>

      {/* Floating Action Button */}
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

      {/* Delete Confirmation — Apple/shadcn style */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl border-border/40 bg-background/80 backdrop-blur-3xl p-8 text-center max-w-sm sm:max-w-md overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
          <AlertDialogHeader className="relative z-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/10 flex items-center text-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-foreground w-full text-center sm:text-center">
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium leading-relaxed w-full text-center sm:text-center">
              This action cannot be undone. Deleting{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>{" "}
              will un-categorize all products in this collection.
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
                  deleteM.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 bg-emerald-600 text-white px-6 py-2.5 rounded-full shadow-2xl text-sm font-bold">
          {toast}
        </div>
      )}
    </div>
  );
}