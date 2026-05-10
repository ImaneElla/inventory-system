"use client";
/**
 * ProductsTable — standalone, composable table component
 * Drop-in replacement: <ProductsTable products={...} onDelete={...} onEdit={...} />
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import {
  MoreVertical, Edit3, Trash2, Package, ChevronUp, ChevronDown,
  ArrowUpDown,
} from "lucide-react";

/* ─── types ───────────────────────────────────────────────────── */
export interface Product {
  id: number;
  name: string;
  sku: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  sellPrice: number;
  purchasePrice: number;
  quantity: number;
  minStockLevel: number;
  categoryId: number;
}

interface ProductsTableProps {
  products: Product[];
  isLoading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
  deletingId?: number | null;
}

/* ─── stock badge ─────────────────────────────────────────────── */
function StockBadge({ qty, min }: { qty: number; min: number }) {
  if (qty === 0)   return <Badge cls="bg-rose-50 text-rose-500 border-rose-100">Empty</Badge>;
  if (qty <= min)  return <Badge cls="bg-amber-50 text-amber-600 border-amber-100">Low</Badge>;
  return               <Badge cls="bg-emerald-50 text-emerald-600 border-emerald-100">In stock</Badge>;
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold
                      uppercase tracking-widest border ${cls}`}>
      {children}
    </span>
  );
}

/* ─── sortable column header ─────────────────────────────────── */
type SortKey = keyof Product | null;
function ColHeader({
  label, sortKey, active, dir, onSort,
}: {
  label: string; sortKey?: SortKey;
  active: boolean; dir: "asc" | "desc";
  onSort?: (k: SortKey) => void;
}) {
  return (
    <th
      className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap select-none
                  ${sortKey ? "cursor-pointer hover:text-indigo-500" : ""}
                  ${active ? "text-indigo-500" : "text-slate-400"}`}
      onClick={() => sortKey && onSort?.(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey && (
          active
            ? dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
            : <ArrowUpDown size={11} className="opacity-40" />
        )}
      </span>
    </th>
  );
}

/* ─── main component ─────────────────────────────────────────── */
export default function ProductsTable({
  products, isLoading = false, onEdit, onDelete, deletingId,
}: ProductsTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = React.useMemo(() => {
    if (!sortKey) return products;
    return [...products].sort((a, b) => {
      const av = a[sortKey as keyof Product] ?? "";
      const bv = b[sortKey as keyof Product] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [products, sortKey, sortDir]);

  /* ── skeleton ───────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-3xl
                      bg-white/60 backdrop-blur-2xl border border-white/70
                      shadow-[0_8px_32px_rgba(99,102,241,0.07)]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100/60 last:border-none">
            <div className="w-10 h-10 rounded-2xl bg-slate-200/60 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-slate-200/60 rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-slate-100/60 rounded animate-pulse" />
            </div>
            <div className="h-3 w-16 bg-slate-200/60 rounded animate-pulse" />
            <div className="h-3 w-14 bg-slate-200/60 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  /* ── empty ──────────────────────────────────────────────────── */
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center
                      bg-white/60 backdrop-blur-2xl border border-white/70
                      shadow-[0_8px_32px_rgba(99,102,241,0.07)] rounded-3xl">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
          <Package size={28} className="text-slate-400" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-700">No products</p>
          <p className="text-sm text-slate-400 mt-0.5">Add a product to get started</p>
        </div>
      </div>
    );
  }

  /* ── table ──────────────────────────────────────────────────── */
  return (
    <div className="w-full overflow-hidden rounded-3xl
                    bg-white/60 backdrop-blur-2xl border border-white/70
                    shadow-[0_8px_32px_rgba(99,102,241,0.07)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100/80">
              <ColHeader label="Product"   sortKey="name"         active={sortKey === "name"}          dir={sortDir} onSort={handleSort} />
              <ColHeader label="Brand"     sortKey="brand"        active={sortKey === "brand"}         dir={sortDir} onSort={handleSort} />
              <ColHeader label="SKU"       sortKey="sku"          active={sortKey === "sku"}           dir={sortDir} onSort={handleSort} />
              <ColHeader label="Sell $"    sortKey="sellPrice"    active={sortKey === "sellPrice"}     dir={sortDir} onSort={handleSort} />
              <ColHeader label="Cost $"    sortKey="purchasePrice"active={sortKey === "purchasePrice"} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Qty"       sortKey="quantity"     active={sortKey === "quantity"}      dir={sortDir} onSort={handleSort} />
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {sorted.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.22 }}
                  className="group border-b border-slate-100/60 last:border-none
                             hover:bg-indigo-50/30 transition-colors duration-150"
                >
                  {/* product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-white/80
                                      shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          : <Package size={18} className="text-slate-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{p.name}</span>
                          {p.color && (
                            <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm shrink-0"
                                  style={{ backgroundColor: p.color }} />
                          )}
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[160px] mt-0.5">{p.description}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* brand */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{p.brand || <span className="text-slate-300">—</span>}</span>
                  </td>

                  {/* sku */}
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{p.sku}</span>
                  </td>

                  {/* sell price */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">${p.sellPrice.toFixed(2)}</span>
                  </td>

                  {/* cost */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">${p.purchasePrice.toFixed(2)}</span>
                  </td>

                  {/* qty */}
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${
                      p.quantity === 0 ? "text-rose-500"
                      : p.quantity <= p.minStockLevel ? "text-amber-500"
                      : "text-slate-900"
                    }`}>{p.quantity}</span>
                  </td>

                  {/* badge */}
                  <td className="px-6 py-4">
                    <StockBadge qty={p.quantity} min={p.minStockLevel} />
                  </td>

                  {/* actions */}
                  <td className="px-6 py-4 text-right">
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <button
                          className="w-8 h-8 rounded-xl flex items-center justify-center
                                     text-slate-400 hover:text-slate-700 hover:bg-slate-100
                                     opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </DropdownTrigger>
                      <DropdownMenu
                        className="bg-white/95 backdrop-blur-xl border border-slate-100
                                    rounded-2xl shadow-xl p-1.5 min-w-[130px]"
                      >
                        {onEdit && (
                          <DropdownItem key="edit" onPress={() => onEdit(p)} className="rounded-xl text-sm">
                            <span className="flex items-center gap-2 text-slate-700">
                              <Edit3 size={14} /> Edit
                            </span>
                          </DropdownItem>
                        )}
                        {onDelete && (
                          <DropdownItem
                            key="delete"
                            onPress={() => onDelete(p.id)}
                            isDisabled={deletingId === p.id}
                            className="text-rose-500 rounded-xl text-sm"
                          >
                            <span className="flex items-center gap-2">
                              <Trash2 size={14} />
                              {deletingId === p.id ? "Deleting…" : "Delete"}
                            </span>
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* footer count */}
      <div className="border-t border-slate-100/80 px-6 py-3 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1">
          {sortKey && (
            <button
              onClick={() => { setSortKey(null); setSortDir("asc"); }}
              className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-600 transition-colors px-2 py-0.5 rounded-lg hover:bg-indigo-50"
            >
              Clear sort
            </button>
          )}
        </div>
      </div>
    </div>
  );
}