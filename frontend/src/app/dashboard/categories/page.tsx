"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Sparkles, Shapes, Laptop, Smartphone,
  Headphones, Monitor, Gamepad2, Package2, MoreVertical,
  Pencil, Trash2, X, Loader2, Check, Tag, ChevronDown, ChevronUp
} from "lucide-react";
import {
  Dropdown, DropdownItem, DropdownMenu, DropdownTrigger,
} from "@heroui/react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api";

const iconMap: Record<string, React.ElementType> = {
  Laptops: Laptop, Phones: Smartphone, Accessories: Headphones,
  Gaming: Gamepad2, Monitors: Monitor,
};

const tokens = [
  { orb: "#6366f1", light: "rgba(99,102,241,0.08)", iconBg: "rgba(99,102,241,0.12)", iconColor: "#6366f1", ring: "rgba(99,102,241,0.18)" },
  { orb: "#8b5cf6", light: "rgba(139,92,246,0.08)", iconBg: "rgba(139,92,246,0.12)", iconColor: "#8b5cf6", ring: "rgba(139,92,246,0.18)" },
  { orb: "#ec4899", light: "rgba(236,72,153,0.08)", iconBg: "rgba(236,72,153,0.12)", iconColor: "#ec4899", ring: "rgba(236,72,153,0.18)" },
  { orb: "#f59e0b", light: "rgba(245,158,11,0.08)", iconBg: "rgba(245,158,11,0.12)", iconColor: "#f59e0b", ring: "rgba(245,158,11,0.18)" },
  { orb: "#10b981", light: "rgba(16,185,129,0.08)", iconBg: "rgba(16,185,129,0.12)", iconColor: "#10b981", ring: "rgba(16,185,129,0.18)" },
  { orb: "#3b82f6", light: "rgba(59,130,246,0.08)", iconBg: "rgba(59,130,246,0.12)", iconColor: "#3b82f6", ring: "rgba(59,130,246,0.18)" },
];

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false); 
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const { data: categories = [], isLoading } = useQuery<any[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createM = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      closeForm();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      closeForm();
    },
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
      setForm({ name: "" });
      setShowForm(true);
    }
  };

  const openEdit = (cat: any) => {
    setEditId(cat.id);
    setForm({ name: cat.name });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ name: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editId ? updateM.mutate({ id: editId, data: form }) : createM.mutate(form);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 space-y-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              <Sparkles size={11} /> Inventory Architecture
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Categories</h1>
            <p className="text-slate-500 font-medium">Manage and organize your product collections.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="h-12 w-full sm:w-72 pl-12 pr-5 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleForm}
              className={`h-12 inline-flex items-center justify-center gap-2 rounded-2xl font-bold px-6 shadow-lg transition-all cursor-pointer border-none ${showForm && !editId ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700'}`}
            >
              {showForm && !editId ? <X size={18} /> : <Plus size={18} strokeWidth={2.5} />}
              {showForm && !editId ? "Close Form" : "Add Category"}
            </motion.button>
          </div>
        </div>

        {/* Inline Form Drop-down */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-8 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Shapes size={120} />
                </div>
                
                <div className="relative flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{editId ? 'Update Category' : 'New Category'}</h2>
                    <p className="text-sm text-slate-500">Define a new collection for your products.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2 px-1">
                      Category Name
                    </label>
                    <input
                      required
                      autoFocus
                      value={form.name}
                      onChange={e => setForm({ name: e.target.value })}
                      placeholder="e.g. Laptops, Smart Home, Wearables..."
                      className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <motion.button
                      type="button"
                      onClick={closeForm}
                      whileHover={{ scale: 1.02 }}
                      className="h-14 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={busy || !form.name.trim()}
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(99,102,241,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                      className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 border-none cursor-pointer"
                    >
                      {busy ? <Loader2 size={18} className="animate-spin" /> : editId ? <><Check size={18} /> Save Changes</> : <><Plus size={18} /> Create Category</>}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-[3rem] text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 text-slate-300">
              <Shapes size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No results found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or add a new category.</p>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((cat, i) => {
                const Icon = iconMap[cat.name] || Tag;
                const tok = tokens[i % tokens.length];
                return (
                  <motion.div
                    key={cat.id}
                    layout
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all cursor-default"
                  >
                    <div className="absolute top-0 right-0 p-6">
                      <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                          <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none bg-transparent">
                            <MoreVertical size={18} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu className="w-48 p-2 rounded-2xl">
                          <DropdownItem key="edit" onPress={() => openEdit(cat)} startContent={<Pencil size={14} />} className="rounded-xl">
                            Edit Category
                          </DropdownItem>
                          <DropdownItem key="delete" onPress={() => setDeleteTarget(cat)} startContent={<Trash2 size={14} />} className="text-danger rounded-xl" color="danger">
                            Delete Category
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500" 
                         style={{ background: tok.iconBg, color: tok.iconColor }}>
                      <Icon size={32} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2 truncate pr-8">{cat.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-8">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-[11px] font-bold text-slate-500">
                        <Package2 size={12} />
                        {cat.productCount ?? 0} Products
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Active</span>
                    </div>

                    <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collection</span>
                      <div className="h-2 w-12 rounded-full" style={{ background: tok.iconColor, opacity: 0.2 }} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-white/40 bg-white/80 backdrop-blur-3xl shadow-[0_30px_100px_-15px_rgba(0,0,0,0.15)] p-8 max-w-sm sm:max-w-md overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-rose-500/10 to-transparent pointer-events-none" />
          <AlertDialogHeader className="relative z-10 flex flex-col items-center text-center sm:text-center space-y-3 w-full">
            <div className="w-16 h-16 rounded-full bg-rose-100/50 flex items-center justify-center mb-4 border border-rose-200/50">
              <Trash2 size={28} className="text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-slate-900 w-full text-center sm:text-center">
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed w-full text-center sm:text-center">
              This action cannot be undone. This will permanently delete <strong className="text-slate-800">{deleteTarget?.name}</strong> from the inventory system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="relative z-10 sm:justify-center gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl h-12 px-6 font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border-none transition-all flex-1">
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
