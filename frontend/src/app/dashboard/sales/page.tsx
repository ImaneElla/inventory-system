"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Sale } from "@/types/sale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, TrendingUp, ShoppingBag, Calendar,
  Trash2, X, Loader2, Check, Package2,
  ChevronLeft, ChevronRight, Filter, ShoppingCart,
  Wallet, CreditCard, Smartphone, User, Tag,
  Download, Printer, ChevronDown, ChevronUp,
  Share2
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSales, createSale, deleteSale, fetchProductsByName } from "@/lib/api";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { cn } from "@/lib/utils";
import { body, div } from "framer-motion/client";

// --- Types ---
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

// --- Product Search Input (Refactored with forwardRef for Hotkeys) ---
const ProductSearchInput = React.forwardRef<HTMLInputElement, {
  onSelect: (p: ProductSuggestion) => void;
  disabled?: boolean;
}>(({ onSelect, disabled }, ref) => {
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
        setSuggestions([]);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative w-full" ref={wrapRef}>
      <div className="relative">
        <Package2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={ref}
          disabled={disabled}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search products (F2 to focus)..."
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
});
ProductSearchInput.displayName = "ProductSearchInput";


// --- Main Page ---
export default function SalesPage() {
  const qc = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // General State
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [expandedId, setExpandedId] = useState<number | string | null>(null); // For Expandable Row
  const [receiptData, setReceiptData] = useState<any>(null); // For Thermal Receipt

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  // Advanced Checkout State
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "MOBILE">("CASH");
  const [amountTendered, setAmountTendered] = useState<number | "">("");
  const [discount, setDiscount] = useState<number>(0);
  const [clientName, setClientName] = useState("");

  // Totals Calculation
  const basketTotal = useMemo(() => basket.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0), [basket]);
  const finalTotal = useMemo(() => Math.max(0, basketTotal - discount), [basketTotal, discount]);
  const changeDue = useMemo(() => paymentMethod === "CASH" ? Math.max(0, Number(amountTendered) - finalTotal) : 0, [amountTendered, finalTotal, paymentMethod]);

  // Global Hotkeys (F2, Ctrl+Enter, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2" || (e.ctrlKey && e.key === "n")) {
        e.preventDefault();
        setShowForm(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.ctrlKey && e.key === "Enter" && showForm && basket.length > 0) {
        e.preventDefault();
        handleConfirmOrder();
      }
      if (e.key === "Escape") {
        setShowForm(false);
        setReceiptData(null);
        setExpandedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm, basket, paymentMethod, amountTendered]);

  // Fetch Sales
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales", search, status, dateStart, dateEnd, page],
    queryFn: async () => {
      return await fetchSales({
        search, status: status || undefined,
        start: dateStart ? `${dateStart}T00:00:00` : undefined,
        end: dateEnd ? `${dateEnd}T23:59:59` : undefined,
        page, size
      });
    },
  });

  const sales = Array.isArray(salesData?.content) ? salesData.content : [];
  const totalPages = typeof salesData?.totalPages === "number" ? salesData.totalPages : 0;


  const createM = useMutation({
    mutationFn: createSale,
    onMutate: async (newSalePayload) => {
      await qc.cancelQueries({ queryKey: ["products"] });
      await qc.cancelQueries({ queryKey: ["sales"] });

    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      
      // Trigger Receipt Modal automatically
      setReceiptData({
        ...data,
        basket: [...basket],
        finalTotal,
        paymentMethod,
        amountTendered: paymentMethod === "CASH" ? Number(amountTendered) : finalTotal,
        changeDue
      });
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

  const closeForm = () => {
    setShowForm(false);
    setBasket([]);
    setError("");
    setDiscount(0);
    setAmountTendered("");
    setPaymentMethod("CASH");
    setClientName("");
  };

  const addToBasket = (product: ProductSuggestion) => {
    const existing = basket.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        setError(`Max stock reached for ${product.name}.`); return;
      }
      setBasket(basket.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.quantity < 1) { setError(`Out of stock.`); return; }
      setBasket([...basket, { product, quantity: 1 }]);
    }
    setError("");
  };

  const removeFromBasket = (productId: number) => setBasket(basket.filter(item => item.product.id !== productId));
  
  const updateBasketQuantity = (productId: number, q: number) => {
    setBasket(basket.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(1, Math.min(q, item.product.quantity)) };
      }
      return item;
    }));
  };

  const handleConfirmOrder = () => {
    if (basket.length === 0) return setError("Basket is empty");
    if (paymentMethod === "CASH" && Number(amountTendered) < finalTotal) return setError("Amount tendered is less than total.");

    const payload = {
      clientName: clientName || "Walk-in Customer",
      paymentMethod,
      discountApplied: discount,
      amountTendered: Number(amountTendered),
      items: basket.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };
    createM.mutate(payload);
  };

  // Data Export to CSV
  const handleExportCSV = () => {
    if (!sales || sales.length === 0) return;
    const headers = "Items,Transaction ID,Date,Status,Total Amount\n";
    const csvContent = sales.map((s: Sale) => {
      const itemsStr = s.items?.map(i => `${i.quantity}x ${i.productName}`).join(" | ") || "";
      const date = s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : "";
      return `"${itemsStr}",${s.transactionId},${date},${s.status},${s.totalAmount}`;
    }).join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Thermal Receipt Print Logic
const handlePrintReceipt = () => {
        const printContent = document.getElementById("thermal-receipt");
        if (!printContent) return;

        const win = window.open("", "_blank", "width=350,height=600");
        win?.document.write(`
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: white;
            color: #111827;
            font-size: 14px;
          }

          .receipt {
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            padding: 10px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }

          .header {
            text-align: center;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 10px;
          }

          .store-name {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 4px;
            color: #000;
          }

          .store-address {
            font-size: 12px;
            color: #334155;
          }

          .transaction-info {
            margin: 16px 0;
            text-align: center;
          }

          .transaction-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 6px;
          }

          .divider {
            border-top: 1px dashed #cbd5e1;
            margin: 10px 0;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }

          .items-table th,
          .items-table td {
            text-align: left;
            padding: 4px 0;
            font-size: 13px;
          }

          .items-table th {
            color: #64748b;
            border-bottom: 1px solid #cbd5e1;
          }

          .items-table tr:last-child {
            border-bottom: none;
          }

          .total-section {  
            margin-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
          }

          .grand-total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 800;
          }

          .payment {
            margin-top: 18px;
            padding: 12px;
            border-radius: 12px;
            background: #f8fafc;
            font-size: 12px;
          }

          .payment-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }

          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
            border-top: 1px dashed #cbd5e1;
            padding-top: 14px;
          }

          .thank-you {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 6px;
          }

          @media print {
            body {
              padding: 0;
            }

            .receipt {
              border: none;
              border-radius: 0;
              width: 100%;
            }
          }
        </style>
      </head>

      <body>
        <div class="receipt">
          ${printContent.innerHTML}
        </div>

        <script>
          window.onload = function () {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);

  win?.document.close();
};

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-8 relative text-foreground pb-24">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              <TrendingUp size={11} /> POS System Active
            </div>
            <h1 className="text-4xl font-black tracking-tight">Sales & Orders</h1>
            <p className="text-muted-foreground font-medium mt-1">Manage multi-item transactions and track revenue. <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-2">F2</kbd> to search.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn("h-12 inline-flex items-center justify-center gap-2 rounded-2xl font-bold px-8 shadow-lg transition-all border-none cursor-pointer",
              showForm ? "bg-secondary text-foreground" : "btn-gradient text-white shadow-primary/20 hover:bg-primary/90")}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Cancel Order (Esc)" : "New Transaction"}
          </button>
        </div>

        {/* Multi-Item Order Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 mb-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
              
                {/* Left: Product & Client Selection */}
                <div className="lg:col-span-5 space-y-8">
                  {/* Client Assignment */}
                  <div className="space-y-3">
                    <h3 className="font-bold flex items-center gap-2"><User size={18} className="text-primary"/> Customer Details</h3>
                    <input
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="Walk-in Customer (Optional)"
                      className="h-11 w-full rounded-xl border border-border bg-card/50 px-4 text-sm outline-none focus:border-primary transition-all"
                    />
                  </div>
                  
                  {/* Product Search */}
                  <div className="space-y-3">
                    <h3 className="font-bold flex items-center gap-2"><Package2 size={18} className="text-primary"/> Add Products</h3>
                    <ProductSearchInput ref={searchInputRef} onSelect={addToBasket} disabled={createM.isPending} />
                    {error && <p className="text-rose-500 text-xs font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
                  </div>
                </div>

                {/* Right: Basket & Checkout */}
                <div className="lg:col-span-7 space-y-6 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={18} className="text-primary"/> Current Basket</h3>
                    <span className="text-xs font-black uppercase text-muted-foreground">{basket.length} Items</span>
                  </div>

                  <div className="flex-1 min-h-[200px] max-h-[300px] overflow-y-auto bg-muted/20 rounded-2xl border border-border p-3 space-y-2">
                    {basket.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <ShoppingBag size={40} className="mb-2" />
                        <p className="text-sm">Basket is empty.</p>
                      </div>
                    ) : basket.map(item => (
                      <motion.div layout key={item.product.id} className="flex items-center gap-4 bg-card p-3 rounded-xl border border-border shadow-sm group">
                        <div className="flex-1">
                          <p className="font-bold text-sm capitalize truncate max-w-[150px]">{item.product.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.product.sellPrice.toFixed(2)} DH</p>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/50">
                          <button onClick={() => updateBasketQuantity(item.product.id, item.quantity - 1)} className="p-1 hover:bg-card rounded"><ChevronLeft size={14}/></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateBasketQuantity(item.product.id, item.quantity + 1)} className="p-1 hover:bg-card rounded"><ChevronRight size={14}/></button>
                        </div>
                        <p className="text-sm font-black w-20 text-right">{(item.product.sellPrice * item.quantity).toFixed(2)} DH</p>
                        <button onClick={() => removeFromBasket(item.product.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Payment & Advanced Totals */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-4">
                      {/* Payment Methods */}
                      <div className="flex gap-2">
                        {[ {id: "CASH", icon: Wallet}, {id: "CARD", icon: CreditCard}, {id: "MOBILE", icon: Smartphone} ].map(m => (
                          <button key={m.id} onClick={() => setPaymentMethod(m.id as any)}
                            className={cn("flex-1 py-2 flex flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-bold transition-all", 
                            paymentMethod === m.id ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted/50 text-muted-foreground")}>
                            <m.icon size={16} /> {m.id}
                          </button>
                        ))}
                      </div>

                      {/* Cash Calc */}
                      {paymentMethod === "CASH" && (
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Tendered (DH)</label>
                            <input type="number" value={amountTendered} onChange={e => setAmountTendered(e.target.value ? Number(e.target.value) : "")}
                              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm font-mono outline-none focus:border-primary" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Change Due</label>
                            <div className="h-10 w-full rounded-lg bg-muted/40 flex items-center px-3 text-sm font-mono font-bold text-emerald-500">
                              {changeDue.toFixed(2)} DH
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between bg-muted/10 p-4 rounded-xl border border-border">
                      <div className="w-full space-y-1 mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span>{basketTotal.toFixed(2)} DH</span></div>
                        <div className="flex justify-between text-xs items-center">
                          <span className="flex items-center gap-1 text-primary"><Tag size={10}/> Discount</span>
                          <input type="number" value={discount || ""} onChange={e => setDiscount(Number(e.target.value))} placeholder="0.00"
                            className="w-16 h-6 text-right bg-card border border-border rounded text-[10px] outline-none" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Grand Total</p>
                        <p className="text-3xl font-black text-foreground">{finalTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-sm">DH</span></p>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleConfirmOrder} disabled={basket.length === 0 || createM.isPending}
                    className="h-14 w-full rounded-xl btn-gradient text-white font-black shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    {createM.isPending ? <Loader2 size={20} className="animate-spin" /> : <><Check size={20} /> Checkout Order (Ctrl+Enter)</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters & Export Bar */}
        <div className="bg-card border border-border p-4 sm:p-6 rounded-[2rem] shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search transactions..."
              className="h-11 w-full pl-11 pr-4 rounded-xl border border-border bg-muted/20 outline-none focus:border-primary text-sm" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} className="h-11 px-4 rounded-xl border border-border bg-muted/20 outline-none text-sm font-medium">
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </select>
          <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-xl px-3 h-11 hidden sm:flex">
            <Calendar size={16} className="text-muted-foreground" />
            <input type="date" value={dateStart} onChange={e => { setDateStart(e.target.value); setPage(0); }} className="bg-transparent border-none outline-none text-xs uppercase" />
            <span className="text-muted-foreground">→</span>
            <input type="date" value={dateEnd} onChange={e => { setDateEnd(e.target.value); setPage(0); }} className="bg-transparent border-none outline-none text-xs uppercase" />
          </div>
          <button onClick={handleExportCSV} className="h-11 px-4 flex items-center gap-2 btn-gradient text-white rounded-xl text-sm font-bold transition-all">
            <Download size={16}/> Export CSV
          </button>
        </div>

        {/* Sales Table with Expandable Rows */}
        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest w-10"></th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Transaction ID</th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Date</th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Items</th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Total</th>
                  <th className="p-6 text-[11px] font-black uppercase text-muted-foreground tracking-widest">Status</th>
                  <th className="p-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={7} className="p-6"><div className="h-10 bg-muted/40 rounded-xl" /></td></tr>)
                ) : sales.length === 0 ? (
                  <tr><td colSpan={7} className="py-24 text-center text-muted-foreground">No matching transactions found.</td></tr>
                ) : sales.map((sale: Sale) => (
                  <React.Fragment key={sale.id}>
                    {/* Main Row */}
                    <tr onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)} className={cn("group hover:bg-muted/10 transition-colors cursor-pointer", expandedId === sale.id && "bg-muted/10")}>
                      <td className="pl-6 text-muted-foreground">{expandedId === sale.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</td>
                      <td className="p-6 font-mono text-sm">{sale.transactionId}</td>
                      <td className="p-6 text-muted-foreground text-sm">{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "—"}</td>
                      <td className="p-6 text-sm font-medium">{sale.items?.length || 0} Products</td>
                      <td className="p-6 font-black">{Number(sale.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })} DH</td>
                      <td className="p-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                          {sale.status}
                        </span>
                      </td> 
                      <td className="p-6">
  <div className="flex items-center justify-end gap-2">

    {/* Print Invoice */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handlePrintInvoice(sale);
      }}
      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
    >
      <Printer size={16} />
    </button>

    {/* Delete */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setDeleteTarget(sale);
      }}
      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
    >
      <Trash2 size={16} />
    </button>

  </div>
</td>
                    </tr>

                    {/* Expandable Order Details Sub-Table */}
                    <AnimatePresence>
                      {expandedId === sale.id && (
                        <tr className="bg-muted/5 border-b border-border/50">
                          <td colSpan={7} className="p-0">
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="p-6 lg:px-24">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Order Breakdown</h4>
                                <div className="border border-border/50 rounded-2xl overflow-hidden bg-card">
                                  <table className="w-full text-sm">
                                    <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                                      <tr><th className="p-3 text-left">Product</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Unit Price</th><th className="p-3 text-right">Subtotal</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                      {sale.items?.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                          <td className="p-3 font-medium capitalize">{item.productName}</td>
                                          <td className="p-3 text-center font-mono">{item.quantity}</td>
                                          <td className="p-3 text-right text-muted-foreground font-mono">{Number(item.price || item.unitPrice || 0).toFixed(2)} DH</td>
                                          <td className="p-3 text-right font-bold font-mono">{(item.quantity * Number(item.price || item.unitPrice || 0)).toFixed(2)} DH</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 sm:p-6 bg-muted/10 border-t border-border flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(page - 1)} className="p-2 border border-border rounded-lg disabled:opacity-30"><ChevronLeft size={16}/></button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="p-2 border border-border rounded-lg disabled:opacity-30"><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) { await deleteM.mutateAsync(deleteTarget.id); setDeleteTarget(null); } }}
        title="Delete Transaction?" description={`Permanently remove transaction ${deleteTarget?.transactionId}?`} />

      {/* Thermal Receipt Print Modal (Shows automatically after successful checkout) */}
      <AnimatePresence>
        
        {receiptData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border p-6 rounded-3xl shadow-2xl max-w-sm w-full relative">
              <button onClick={() => setReceiptData(null)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full"><X size={16}/></button>
              
{/* Hidden/Printable Layout Container */}
<div
  id="thermal-receipt"
  className="bg-card rounded-2xl p-6 border border-slate-200"
>
  {/* Header */}
  <div className="text-center border-b border-dashed border-slate-300 pb-4">
    
    <img
      src="/icon.svg"
      alt="Logo"
      className="w-10 h-10 object-contain mx-auto mb-3"
    />

    <h1 className="text-xl font-black tracking-wide">
      IMANE TECH STORE
    </h1>

    <p className="text-xs text-slate-500 mt-0.5">
      Gaming • Hardware • Accessories
    </p>

    <p className="text-xs text-slate-500">
      Casablanca, Morocco
    </p>

    <p className="text-xs text-slate-500">
      +212 6 00 00 00 00
    </p>
  </div>

  {/* Receipt Info */}
  <div className="py-4 space-y-2 text-xs border-b border-dashed border-slate-300">
    
    <div className="flex justify-between">
      <span className="text-slate-500">Receipt ID</span>
      <span className="font-bold">
        {receiptData.transactionId || "NEW"}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-slate-500">Date</span>
      <span>
        {new Date().toLocaleDateString()}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-slate-500">Time</span>
      <span>
        {new Date().toLocaleTimeString()}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-slate-500">Customer</span>
      <span>
        {clientName || "Client non specifie"}
      </span>
    </div>
  </div>

  {/* Items */}
  <div className="py-4 space-y-4 border-b border-dashed border-slate-300">
    
    {receiptData.basket?.map((item: any, i: number) => (
      <div key={i}>
        
        <div className="flex justify-between gap-4 font-bold text-sm">
          <span className="flex-1">
            {item.product.name}
          </span>

          <span>
            {(item.product.sellPrice * item.quantity).toFixed(2)} DH
          </span>
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>
            {item.quantity} × {item.product.sellPrice.toFixed(2)} DH
          </span>

          <span>
            SKU #{item.product.id}
          </span>
        </div>

      </div>
    ))}

  </div>

  {/* Totals */}
  <div className="py-4 space-y-2 border-b border-dashed border-slate-300">
    
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">Subtotal</span>
      <span>{basketTotal.toFixed(2)} DH</span>
    </div>

    <div className="flex justify-between text-sm">
      <span className="text-slate-500">Discount</span>
      <span>{discount.toFixed(2)} DH</span>
    </div>

    <div className="flex justify-between text-lg font-black pt-2">
      <span>TOTAL</span>

      <span>
        {receiptData.finalTotal?.toFixed(2)} DH
      </span>
    </div>
  </div>

  {/* Payment */}
  <div className="py-4 space-y-2 text-sm">
    
    <div className="flex justify-between">
      <span className="text-slate-500">
        Payment Method
      </span>

      <span className="font-bold">
        {receiptData.paymentMethod}
      </span>
    </div>

    {receiptData.paymentMethod === "CASH" && (
      <>
        <div className="flex justify-between">
          <span className="text-slate-500">
            Tendered
          </span>

          <span>
            {receiptData.amountTendered?.toFixed(2)} DH
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">
            Change
          </span>

          <span className="font-bold text-emerald-600">
            {receiptData.changeDue?.toFixed(2)} DH
          </span>
        </div>
      </>
    )}
  </div>

  {/* Footer */}
  <div className="pt-4 text-center border-t border-dashed border-slate-300">
    
    <p className="font-bold text-sm">
      Thank You For Your Purchase 
    </p>

    <p className="text-[11px] text-slate-500 mt-1">
      Powered by Imane Inventory System
    </p>

  </div>
</div>
              {/* Print and Share Buttons */}
              <div className="mt-6 flex gap-6 mx-auto w-full">
                <button
                  onClick={() => window.print()}
                  className="flex-1 items-center justify-center gap-2 w-full btn-gradient text-white px-1 py-1 rounded-2xl font-medium hover:bg-primary/90 transition-all shadow-lg h-12 cursor-pointer"
                >
                  <Printer size={18} className="mx-auto" />
                  Print Receipt
                </button>

                <button
                  onClick={() => {
                    navigator.share({
                      title: "Your Receipt",
                      text: `Here is your receipt #${receiptData.transactionId}`,
                    }).catch(() => { /* Ignore if cancelled */ });
                  }}
                  className="flex-1 text-sm items-center justify-center gap-2 bg-foreground/30 text-foreground px-1 py-1 rounded-2xl font-medium hover:bg-foreground/60 transition-all h-12 mx-auto w-20 cursor-pointer"
                >
                  <Share2 size={18} className="mx-auto" />
                  Share 
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}