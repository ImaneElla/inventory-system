"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Sparkles, Shapes, Laptop, Smartphone,
  Headphones, Monitor, Gamepad2, Package2, MoreVertical,
  Pencil, Trash2, X, Loader2, Check, Tag, Coffee,
  Car, Watch, Tv, Camera, Speaker, HardDrive
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { fetchCategories, createCategory, updateCategory, deleteCategory, fetchProducts } from "@/lib/api";

const iconMap: Record<string, React.ElementType> = {
  Laptop, Smartphone, Headphones, Gamepad2, Monitor,
  Tag, Coffee, Car, Watch, Tv, Camera, Speaker, HardDrive
};

const availableIcons = Object.keys(iconMap);

const tokens = [
  { orb: "#6366f1", light: "rgba(99,102,241,0.08)",  iconBg: "rgba(99,102,241,0.12)",  iconColor: "#6366f1" },
  { orb: "#8b5cf6", light: "rgba(139,92,246,0.08)",  iconBg: "rgba(139,92,246,0.12)",  iconColor: "#8b5cf6" },
  { orb: "#ec4899", light: "rgba(236,72,153,0.08)",  iconBg: "rgba(236,72,153,0.12)",  iconColor: "#ec4899" },
  { orb: "#f59e0b", light: "rgba(245,158,11,0.08)",  iconBg: "rgba(245,158,11,0.12)",  iconColor: "#f59e0b" },
  { orb: "#10b981", light: "rgba(16,185,129,0.08)",  iconBg: "rgba(16,185,129,0.12)",  iconColor: "#10b981" },
  { orb: "#3b82f6", light: "rgba(59,130,246,0.08)",  iconBg: "rgba(59,130,246,0.12)",  iconColor: "#3b82f6" },
];

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", icon: "Tag" });
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const { data: categories = [], isLoading: catLoading } = useQuery<any[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const productList = Array.isArray(products)
    ? products
    : (products as any)?.data || (products as any)?.products || [];

  const productCountMap = useMemo(() => {
    const counts: Record<number, number> = {};
    if (Array.isArray(productList)) {
      productList.forEach((p) => {
        const catId = p.categoryId || p.category_id;
        if (catId) counts[catId] = (counts[catId] || 0) + 1;
      });
    }
    return counts;
  }, [productList]);

  const createM = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      closeForm();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); closeForm(); },
  });

  const deleteM = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const filtered = useMemo(() =>
    categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  );

  const busy = createM.isPending || updateM.isPending;

  const toggleForm = () => {
    if (showForm && !editId) {
      setShowForm(false);
    } else {
      setEditId(null);
      setForm({ name: "", icon: "Tag" });
      setShowForm(true);
    }
  };

  const openEdit = (cat: any) => {
    setEditId(cat.id);
    setForm({ name: cat.name, icon: cat.icon || "Tag" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", icon: "Tag" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editId ? updateM.mutate({ id: editId, data: form }) : createM.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-8 relative overflow-hidden text-foreground">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              <Sparkles size={11} /> Inventory Architecture
            </div>
            <h1 className="text-4xl font-black tracking-tight">Categories</h1>
            <p className="text-muted-foreground font-medium">Manage and organize your product collections.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="h-12 w-full sm:w-72 pl-12 rounded-2xl bg-card border-border shadow-sm"
              />
            </div>
            <Button
              onClick={toggleForm}
              variant={showForm && !editId ? "secondary" : "default"}
              className="h-12 rounded-2xl font-bold px-6 shadow-lg shadow-primary/20"
            >
              {showForm && !editId ? <X size={18} className="mr-2" /> : <Plus size={18} className="mr-2" strokeWidth={2.5} />}
              {showForm && !editId ? "Close Form" : "Add Category"}
            </Button>
          </div>
        </div>

        {/* Inline form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-foreground">
                  <Shapes size={120} />
                </div>

                <form onSubmit={handleSubmit} className="relative space-y-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Icon picker */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground px-1">
                        Select Icon
                      </label>
                      <div className="grid grid-cols-5 gap-2 p-4 bg-background rounded-[2rem] border-2 border-border max-w-fit">
                        {availableIcons.map((iconName) => {
                          const IconComp = iconMap[iconName];
                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setForm({ ...form, icon: iconName })}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                form.icon === iconName
                                  ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                                  : "hover:bg-secondary text-muted-foreground"
                              }`}
                            >
                              <IconComp size={20} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex-1 space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground px-1">
                        Category Name
                      </label>
                      <Input
                        required
                        autoFocus
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Laptops, Smart Home..."
                        className="h-14 rounded-2xl bg-background border-2 border-border text-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t pt-6 border-border/50">
                    <Button type="button" variant="ghost" onClick={closeForm} className="h-14 px-6 rounded-2xl font-bold">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={busy || !form.name.trim()}
                      className="h-14 px-10 rounded-2xl font-bold shadow-lg shadow-primary/20"
                    >
                      {busy ? <Loader2 size={18} className="animate-spin" /> : editId ? "Save Changes" : "Create Category"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {catLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-card/50 border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-card border border-dashed border-border rounded-[3rem] text-center">
            <Shapes size={40} className="text-muted-foreground mb-6 opacity-20" />
            <h3 className="text-xl font-bold">No results found</h3>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((cat, i) => {
                const Icon = iconMap[cat.icon] || iconMap[cat.name] || Tag;
                const tok = tokens[i % tokens.length];
                const count = productCountMap[cat.id] || 0;

                return (
                  <motion.div
                    key={cat.id}
                    layout
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-card border border-border rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all"
                  >
                    <div className="absolute top-0 right-0 p-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100">
                            <MoreVertical size={18} className="text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                          <DropdownMenuItem onClick={() => openEdit(cat)} className="rounded-xl cursor-pointer">
                            <Pencil size={14} className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(cat)} className="rounded-xl text-destructive">
                            <Trash2 size={14} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500"
                      style={{ background: tok.iconBg, color: tok.iconColor }}
                    >
                      <Icon size={32} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-2xl font-black mb-2 truncate pr-8">{cat.name}</h3>

                    <div className="flex items-center gap-2 mb-8">
                      <div className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full text-[11px] font-bold text-muted-foreground">
                        <Package2 size={12} />
                        {count} Products
                      </div>
                      <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Active</span>
                    </div>

                    <div className="pt-5 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: {cat.id}</span>
                      <div className="h-2 w-12 rounded-full" style={{ background: tok.iconColor, opacity: 0.2 }} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl border-white/40 bg-background/80 backdrop-blur-3xl p-8 text-center max-w-sm sm:max-w-md overflow-hidden">
          <AlertDialogHeader className="relative z-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-foreground text-center">
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium leading-relaxed text-center">
              This will permanently delete <strong className="text-foreground">{deleteTarget?.name}</strong>. Products in this category will become uncategorized.
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
    </div>
  );
}