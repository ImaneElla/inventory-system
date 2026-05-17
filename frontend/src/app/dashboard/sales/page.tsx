"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Sale } from "@/types/sale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, TrendingUp,
  ShoppingBag, Calendar,
  Trash2, X, Loader2, Check, Package2,
  ChevronLeft, ChevronRight, Filter, ShoppingCart
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSales, createSale, deleteSale, fetchProductsByName } from "@/lib/api";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { cn } from "@/lib/utils";

// --- Product autocomplete types ---
interface ProductSuggestion {
  id: number;
  name: string;
  sellPrice: number;
  quantity: number;
}

interface BasketItem {
  product: ProductSuggestion;
  quantity: number;
}

// --- Product Search Input ---
function ProductSearchInput({
  onSelect,
  disabled
}: {
  onSelect: (p: ProductSuggestion) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchProductsByName(query);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch (err) { 
        console.error("Search failed:", err);
        setSuggestions([]); 
      }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  return (
    <div className="relative w-full" ref={wrapRef}>
      <div className="relative">
        <Package2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          disabled={disabled}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search products to add..."
          className="h-12 w-full rounded-xl border border-border bg-card/50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:bg-card transition-all capitalize disabled:opacity-50"
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
            className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto"
          >
            {suggestions.map(p => (
              <li
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-foreground capitalize">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.quantity} in stock</span>
                </div>
                <span className="font-mono font-bold text-primary">{Number(p.sellPrice).toFixed(2)} DH</span>
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
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  // Basket state for multi-item order
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [error, setError] = useState("");

  // Fetch sales with filters
const { data: salesData, isLoading } = useQuery({
  queryKey: ["sales", search, status, dateStart, dateEnd, page],

  queryFn: async () => {
    const data = await fetchSales({
      search,
      status: status || undefined,
      start: dateStart
       ? `${dateStart}T00:00:00` 
      : undefined,
      end: dateEnd
        ? `${dateEnd}T23:59:59`
        : undefined,
      page,
      size
    });

    console.log("SALES DATA:", data);

    return data;
  },
});

 const sales = Array.isArray(salesData?.content)
  ? salesData.content
  : [];

const totalPages =
  typeof salesData?.totalPages === "number"
    ? salesData.totalPages
    : 0;

  const createM = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      closeForm();
    },
    onError: (e: any) => setError(e.message || "Failed to process order"),
  });

  const deleteM = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const basketTotal = useMemo(() => 
    basket.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0),
    [basket]
  );

  const closeForm = () => {
    setShowForm(false);
    setBasket([]);
    setError("");
  };

  const addToBasket = (product: ProductSuggestion) => {
    const existing = basket.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        setError(`Cannot add more ${product.name}. Max stock reached.`);
        return;
      }
      setBasket(basket.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.quantity < 1) {
        setError(`${product.name} is out of stock.`);
        return;
      }
      setBasket([...basket, { product, quantity: 1 }]);
    }
    setError("");
  };

  const removeFromBasket = (productId: number) => {
    setBasket(basket.filter(item => item.product.id !== productId));
  };

  const updateBasketQuantity = (productId: number, q: number) => {
    setBasket(basket.map(item => {
      if (item.product.id === productId) {
        const newQ = Math.max(1, Math.min(q, item.product.quantity));
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

 const handleConfirmOrder = () => {
  if (basket.length === 0) {
    setError("Basket is empty");
    return;
  }

  const payload = {
    items: basket.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }))
  };

  console.log("SALE PAYLOAD:", payload);

  createM.mutate(payload);
};

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-8 relative overflow-hidden text-foreground">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              <TrendingUp size={11} /> POS System Active
            </div>
            <h1 className="text-4xl font-black tracking-tight">Sales & Orders</h1>
            <p className="text-muted-foreground font-medium mt-1">Manage multi-item transactions and track revenue.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(!showForm)}
              className={cn(
                "h-12 inline-flex items-center justify-center gap-2 rounded-2xl font-bold px-8 shadow-lg transition-all border-none cursor-pointer",
                showForm ? "bg-secondary text-foreground" : "btn-gradient text-white shadow-primary/20 hover:bg-primary/90"
              )}
            >
              {showForm ? <X size={18} /> : <Plus size={18} strokeWidth={2.5} />}
              {showForm ? "Close" : "New Transaction"}
            </motion.button>
          </div>
        </div>

        {/* Multi-Item Order Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 relative mb-8">
                <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
                  {/* Left: Product Selection */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Package2 size={20} />
                      </div>
                      <h3 className="font-bold text-lg">Add Products</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Search and select items to add to the current order.</p>
                      <ProductSearchInput onSelect={addToBasket} disabled={createM.isPending} />
                      
                      {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">
                          {error}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Right: Basket & Checkout */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <ShoppingCart size={20} />
                        </div>
                        <h3 className="font-bold text-lg">Current Basket</h3>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{basket.length} Items</span>
                    </div>

                    <div className="min-h-[200px] bg-muted/20 rounded-[2rem] border border-border p-4">
                      {basket.length === 0 ? (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                          <ShoppingBag size={40} className="opacity-20" />
                          <p className="text-sm font-medium">Your basket is empty.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {basket.map((item) => (
                            <motion.div
                              layout
                              key={item.product.id}
                              className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm group"
                            >
                              <div className="flex-1">
                                <p className="font-bold text-sm capitalize">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{item.product.sellPrice.toFixed(2)} DH / unit</p>
                              </div>
                              
                              <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-xl border border-border/50">
                                <button 
                                  onClick={() => updateBasketQuantity(item.product.id, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card transition-colors text-muted-foreground cursor-pointer"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                                <button 
                                  onClick={() => updateBasketQuantity(item.product.id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-card transition-colors text-muted-foreground cursor-pointer"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>

                              <div className="w-24 text-right">
                                <p className="text-sm font-black text-primary">{(item.product.sellPrice * item.quantity).toFixed(2)} DH</p>
                              </div>

                              <button 
                                onClick={() => removeFromBasket(item.product.id)}
                                className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-border">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Grand Total</p>
                        <p className="text-4xl font-black text-foreground">{basketTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-lg font-bold text-muted-foreground">DH</span></p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleConfirmOrder}
                        disabled={basket.length === 0 || createM.isPending}
                        className="h-14 px-10 rounded-2xl btn-gradient text-white font-black shadow-xl shadow-primary/25 border-none cursor-pointer flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {createM.isPending ? <Loader2 size={20} className="animate-spin" /> : <><Check size={20} /> Checkout Order</>}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Bar */}
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by ID or product..."
              className="h-11 w-full pl-11 pr-4 rounded-xl border border-border bg-muted/20 outline-none focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select 
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(0); }}
              className="h-11 px-4 rounded-xl border border-border bg-muted/20 outline-none text-sm font-medium focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-xl px-3 h-11">
            <Calendar size={16} className="text-muted-foreground" />
            <input 
              type="date" 
              value={dateStart}
              onChange={e => { setDateStart(e.target.value); setPage(0); }}
              className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-tighter"
            />
            <span className="text-muted-foreground">→</span>
            <input 
              type="date" 
              value={dateEnd}
              onChange={e => { setDateEnd(e.target.value); setPage(0); }}
              className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-tighter"
            />
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Order Summary</th>
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
                      <td colSpan={6} className="p-6"><div className="h-14 bg-muted/40 rounded-2xl" /></td>
                    </tr>
                  ))
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center text-muted-foreground font-medium">
                      No matching transactions found.
                    </td>
                  </tr>
                ) : sales.map((sale: Sale) => (
                  <tr key={sale.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <ShoppingBag size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">
                            {sale.items?.length || 0} Products
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[200px] capitalize">
                            {sale.items?.map(i => i.productName).join(", ")}
                          </p>
                        </div>
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
                          onClick={() => setDeleteTarget(sale)}
                          className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 bg-muted/10 border-t border-border flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-card disabled:opacity-30 transition-all cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-card disabled:opacity-30 transition-all cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteM.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Transaction?"
        description={`This will permanently remove transaction ${deleteTarget?.transactionId} and restore the stock levels.`}
      />
    </div>
  );
}