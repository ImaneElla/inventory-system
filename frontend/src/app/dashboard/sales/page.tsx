"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Sale } from "@/types/sale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, TrendingUp,
  ShoppingBag, CreditCard, Calendar, DollarSign,
  Trash2, X, Loader2, Check, ArrowUpRight, Receipt, Package2
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSales, createSale, deleteSale, fetchProductsByName } from "@/lib/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Product autocomplete types ---
interface ProductSuggestion {
  id: number;
  name: string;
  sellPrice: number;
  quantity: number;
}

// --- Product Search Input ---
function ProductSearchInput({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (p: ProductSuggestion) => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchProductsByName(query);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <Package2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          required
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search product..."
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all capitalize"
        />
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto"
          >
            {suggestions.map(p => (
              <li
                key={p.id}
                onClick={() => {
                  setQuery(capitalize(p.name));
                  onSelect(p);
                  setOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer hover:bg-emerald-50 transition-colors"
              >
                <span className="font-semibold text-slate-800 capitalize">{p.name}</span>
                <span className="text-xs text-slate-400 font-mono">{Number(p.sellPrice).toFixed(2)} DH · {p.quantity} in stock</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Page ---
export default function SalesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);

  // Form state: one item at a time
  const [selectedProduct, setSelectedProduct] = useState<ProductSuggestion | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const computedTotal = selectedProduct ? (Number(selectedProduct.sellPrice) * quantity) : 0;

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: fetchSales,
  });

  const createM = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      closeForm();
    },
    onError: (e: any) => setError(e.message || "Failed to create sale"),
  });

  const deleteM = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sales"] }),
  });

  const filtered = useMemo(() =>
    sales.filter((s) =>
      s.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      s.items?.[0]?.product?.name?.toLowerCase().includes(search.toLowerCase())
    ),
    [sales, search],
  );

  const stats = useMemo(() => {
    const total = sales.reduce((acc, s) => acc + Number(s.totalAmount), 0);
    return {
      revenue: total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      count: sales.length,
      average: sales.length ? (total / sales.length).toFixed(2) : "0.00",
    };
  }, [sales]);

  const closeForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
    setQuantity(1);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) { setError("Please select a product"); return; }
    if (quantity < 1) { setError("Quantity must be at least 1"); return; }
    if (quantity > selectedProduct.quantity) { setError(`Only ${selectedProduct.quantity} in stock`); return; }
    setError("");
    createM.mutate({ items: [{ productId: selectedProduct.id, quantity }] });
  };

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-8 relative overflow-hidden text-foreground">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              <TrendingUp size={11} /> Revenue Tracking
            </div>
            <h1 className="text-4xl font-black tracking-tight">Sales Ledger</h1>
            <p className="text-muted-foreground font-medium mt-1">Track your revenue and customer transactions.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="h-12 w-full sm:w-72 pl-12 pr-5 rounded-2xl border border-border bg-card/50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-foreground"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(!showForm)}
              className={`h-12 inline-flex items-center justify-center gap-2 rounded-2xl font-bold px-6 shadow-lg transition-all border-none cursor-pointer ${showForm ? 'bg-secondary text-foreground' : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700'}`}
            >
              {showForm ? <X size={18} /> : <Plus size={18} strokeWidth={2.5} />}
              {showForm ? "Cancel" : "New Sale"}
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: "Total Revenue", value: `${stats.revenue} DH`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-500/10" },
            { label: "Transactions", value: stats.count, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-500/10" },
            { label: "Avg. Sale Value", value: `${stats.average} DH`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-3xl flex items-center gap-5 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Inline Sale Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="relative flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Receipt size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Record New Transaction</h2>
                  <p className="text-sm text-muted-foreground">Select a product and enter quantity to create a sale.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Product</label>
                  <ProductSearchInput
                    value={selectedProduct ? capitalize(selectedProduct.name) : ""}
                    onSelect={(p) => { setSelectedProduct(p); setError(""); }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Quantity</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={selectedProduct?.quantity ?? 9999}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-12 w-full rounded-xl border border-border bg-card/50 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-card transition-all text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Total</label>
                  <div className="h-12 w-full rounded-xl border border-border bg-emerald-500/5 px-4 flex items-center font-black text-emerald-600 text-sm">
                    {computedTotal.toFixed(2)} DH
                  </div>
                </div>
              </form>

              {error && (
                <p className="mt-3 text-sm text-rose-500 font-semibold">{error}</p>
              )}

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit as any}
                  disabled={createM.isPending || !selectedProduct}
                  className="h-12 px-8 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 border-none cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {createM.isPending ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Confirm Sale</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sales Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Product</th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Transaction ID</th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Date</th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Total</th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Status</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-6"><div className="h-12 bg-muted/40 rounded-xl" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center text-muted-foreground font-medium">
                      {search ? "No matching transactions found." : "No sales recorded yet. Add your first sale!"}
                    </td>
                  </tr>
                ) : filtered.map((sale) => (
                  <tr key={sale.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-colors">
                          <ShoppingBag size={18} />
                        </div>
                        <span className="font-bold text-foreground capitalize">
                          {sale.items?.[0]?.product?.name ? capitalize(sale.items[0].product.name) : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-muted-foreground font-mono text-sm">{sale.transactionId}</td>
                    <td className="p-6 text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "—"}
                      </div>
                    </td>
                    <td className="p-6 font-black text-foreground">{Number(sale.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })} DH</td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                          title="View Details"
                        >
                          <ArrowUpRight size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sale)}
                          className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl border-border/40 bg-background/80 backdrop-blur-3xl p-8 text-center max-w-sm sm:max-w-md overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-rose-500/10 to-transparent pointer-events-none" />
          <AlertDialogHeader className="relative z-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-linear-to-b from-rose-500/10 to-transparent border border-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-foreground w-full text-center">
              Delete Sale?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium leading-relaxed w-full text-center">
              This action cannot be undone. This will permanently delete transaction{" "}
              <strong className="text-foreground">{deleteTarget?.transactionId}</strong> from the records.
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