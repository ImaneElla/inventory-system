"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@heroui/react";
import {
  Plus, Search, Loader2, Sparkles, X, ShoppingBag,
  Package, Hash, Tag, DollarSign, Palette, Filter, Info
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, createProduct, deleteProduct, fetchCategories, updateProduct } from "@/lib/api";
import ProductsTable, { Product } from "@/components/dashboard/(products)/ProductTable";

/* ─── helpers ─────────────────────────────────────────────────── */
const defaultForm = {
  name: "", sku: "", description: "", quantity: 0,
  categoryId: 0, purchasePrice: 0, sellPrice: 0,
  minStockLevel: 5, brand: "", color: "#6366f1", imageUrl: "",
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch]         = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  // Data Fetching
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => fetchProducts(search),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      quantity: product.quantity,
      categoryId: product.categoryId,
      purchasePrice: product.purchasePrice,
      sellPrice: product.sellPrice,
      minStockLevel: product.minStockLevel,
      brand: product.brand || "",
      color: product.color || "#6366f1",
      imageUrl: product.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const products = (productsData as any)?.content || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 p-6 md:p-10">
      {/* orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-violet-200/25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative space-y-7"
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5
                        bg-white/60 backdrop-blur-2xl border border-white/70
                        shadow-[0_8px_32px_rgba(99,102,241,0.08)] rounded-3xl px-7 py-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">Inventory</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Products</h1>
            <p className="text-sm text-slate-400 mt-0.5">Real-time stock management</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white
                       text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-colors"
          >
            <Plus size={17} strokeWidth={2.5} />
            New Product
          </motion.button>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium text-slate-800
                         placeholder:text-slate-400 bg-white/60 backdrop-blur-xl border border-white/70
                         focus:outline-none focus:ring-2 focus:ring-indigo-300/60 transition shadow-sm"
            />
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        <ProductsTable 
          products={products} 
          isLoading={isLoading} 
          onEdit={openEditModal}
          onDelete={(id) => deleteMutation.mutate(id)}
          deletingId={deleteMutation.isPending ? (deleteMutation.variables as any) : null}
        />
      </motion.div>

      {/* ── Add/Edit Product Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
              onClick={closeModal}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{   opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-2xl
                              bg-white/90 backdrop-blur-2xl border border-white/60
                              shadow-[0_24px_80px_rgba(99,102,241,0.18)]
                              rounded-[2rem] overflow-hidden max-h-[90vh] flex flex-col">

                {/* header */}
                <div className="flex items-start justify-between px-8 pt-7 pb-5 shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{editingId ? "Edit Product" : "New Product"}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Fill in details to save to inventory</p>
                  </div>
                  <button onClick={closeModal}
                          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <X size={15} className="text-slate-500" />
                  </button>
                </div>
                <div className="h-px bg-slate-100 mx-8 shrink-0" />

                {/* scrollable body */}
                <div className="overflow-y-auto flex-1 px-8 py-6">
                  <form id="prod-form" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* left */}
                      <div className="space-y-4">
                        <Field label="Product Name" icon={<Package size={11} />}>
                          <input required placeholder="e.g. MacBook Pro"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={inputCls} />
                        </Field>
                        <Field label="SKU" icon={<Hash size={11} />}>
                          <input required placeholder="MBP-001"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className={inputCls} />
                        </Field>
                        <Field label="Brand" icon={<Tag size={11} />}>
                          <input placeholder="Apple"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className={inputCls} />
                        </Field>
                        <Field label="Category" icon={<Tag size={11} />}>
                          <select required
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: Number.parseInt(e.target.value) })}
                            className={inputCls + " appearance-none"}>
                            <option value={0}>Select category</option>
                            {(categories as any[]).map((c: any) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      {/* right */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Purchase $" icon={<DollarSign size={11} />}>
                            <input type="number" step="0.01" required
                              value={formData.purchasePrice}
                              onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                              className={inputCls} />
                          </Field>
                          <Field label="Sell $" icon={<DollarSign size={11} />}>
                            <input type="number" step="0.01" required
                              value={formData.sellPrice}
                              onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) })}
                              className={inputCls} />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Quantity" icon={<Package size={11} />}>
                            <input type="number" required
                              value={formData.quantity}
                              onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) })}
                              className={inputCls} />
                          </Field>
                          <Field label="Min Stock" icon={<Filter size={11} />}>
                            <input type="number" required
                              value={formData.minStockLevel}
                              onChange={(e) => setFormData({ ...formData, minStockLevel: Number.parseInt(e.target.value) })}
                              className={inputCls} />
                          </Field>
                        </div>
                        <Field label="Color" icon={<Palette size={11} />}>
                          <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-200/80
                                          rounded-2xl px-3 py-2">
                            <input type="color"
                              value={formData.color}
                              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                              className="w-9 h-9 rounded-xl border-none bg-transparent cursor-pointer p-0" />
                            <span className="text-xs font-mono text-slate-500 uppercase">{formData.color}</span>
                          </div>
                        </Field>
                        <Field label="Image URL" icon={<Info size={11} />}>
                          <input placeholder="https://…"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className={inputCls} />
                        </Field>
                      </div>
                    </div>

                    {/* description full-width */}
                    <div className="mt-4">
                      <Field label="Description" icon={<Info size={11} />}>
                        <textarea rows={3} placeholder="Product details…"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className={inputCls + " resize-none"} />
                      </Field>
                    </div>
                  </form>
                </div>

                {/* footer */}
                <div className="flex justify-end gap-3 px-8 pb-7 pt-4 shrink-0 border-t border-slate-100">
                  <button type="button" onClick={closeModal}
                          className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-slate-600
                                     bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <motion.button
                    form="prod-form" type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-7 py-2.5 rounded-2xl text-sm font-bold text-white
                               bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200
                               disabled:opacity-60 transition-colors flex items-center gap-2">
                    {createMutation.isPending || updateMutation.isPending
                      ? <Loader2 size={16} className="animate-spin" />
                      : editingId ? "Update Product" : "Save Product"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── tiny helpers ─────────────────────────────────────────────── */
const inputCls = `w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-sm
  rounded-2xl px-4 py-2.5 placeholder:text-slate-400
  focus:outline-none focus:ring-2 focus:ring-indigo-300/60 transition`;

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}