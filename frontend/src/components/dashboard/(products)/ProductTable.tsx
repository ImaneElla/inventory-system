"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Edit3, Trash2, Package, ChevronUp, ChevronDown,
  ArrowUpDown, Eye, ChevronLeft, ChevronRight
} from "lucide-react";

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
  createdAt?: string;
}

interface ProductsTableProps {
  products: Product[];
  isLoading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  deletingId?: number | null;
}

function StockBadge({ qty, min }: { qty: number; min: number }) {
  if (qty === 0)  return <Badge cls="bg-rose-50 text-rose-500 border-rose-100">Out of Stock</Badge>;
  if (qty <= min) return <Badge cls="bg-amber-50 text-amber-600 border-amber-100">Low Stock</Badge>;
  return               <Badge cls="bg-emerald-50 text-emerald-600 border-emerald-100">In Stock</Badge>;
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold
                      uppercase tracking-widest border ${cls}`}>
      {children}
    </span>
  );
}

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

import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function ProductsTable({
  products, isLoading = false, onEdit, onDelete, onViewDetails, deletingId,
}: ProductsTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);

  const { state } = useSidebar();
  const isSidebarOpen = state === "expanded";

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  type ColId = "brand" | "sku" | "sell" | "cost" | "qty" | "date" | "color" | "status" | "action";
  const [visibleCols, setVisibleCols] = React.useState<Record<ColId, boolean>>({
    brand: true, sku: true, sell: true, cost: true,
    qty: true, date: true, color: true, status: true, action: true
  });

  const isVisible = (col: ColId) => {
    if (isSidebarOpen && (col === "brand" || col === "cost")) return false;
    return visibleCols[col];
  };

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

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginatedProducts = sorted.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages));
  }, [totalPages, page]);

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-3xl bg-primary backdrop-blur-2xl border shadow-[0_8px_32px_rgba(99,102,241,0.07)]">
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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-card rounded-3xl">
        <div className="w-16 h-16 rounded-3xl bg-foreground/80 shadow-lg shadow-foreground/10 flex items-center justify-center">
          <Package size={28} className="text-background" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">No products</p>
          <p className="text-sm text-foreground/50 mt-0.5">Add a product to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[1000px] text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-100/80">
              <ColHeader label="Product"    sortKey="name"          active={sortKey === "name"}          dir={sortDir} onSort={handleSort} />
              {isVisible("brand")  && <ColHeader label="Brand"      sortKey="brand"         active={sortKey === "brand"}         dir={sortDir} onSort={handleSort} />}
              {isVisible("sku")    && <ColHeader label="SKU"        sortKey="sku"           active={sortKey === "sku"}           dir={sortDir} onSort={handleSort} />}
              {isVisible("sell")   && <ColHeader label="Sell"       sortKey="sellPrice"     active={sortKey === "sellPrice"}     dir={sortDir} onSort={handleSort} />}
              {isVisible("cost")   && <ColHeader label="Cost"       sortKey="purchasePrice" active={sortKey === "purchasePrice"} dir={sortDir} onSort={handleSort} />}
              {isVisible("qty")    && <ColHeader label="Qty"        sortKey="quantity"      active={sortKey === "quantity"}      dir={sortDir} onSort={handleSort} />}
              {isVisible("date")   && <ColHeader label="Date Added" sortKey="createdAt"     active={sortKey === "createdAt"}     dir={sortDir} onSort={handleSort} />}
              {isVisible("color")  && <ColHeader label="Color"      sortKey="color"         active={sortKey === "color"}         dir={sortDir} onSort={handleSort} />}
              {isVisible("status") && <th className="px-10 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>}
              {isVisible("action") && <th className="px-14 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {paginatedProducts.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.22 }}
                  className="group border-b border-secondary-500/60 last:border-none hover:bg-secondary-500/30 transition-colors duration-150"
                >
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-18 rounded-2xl bg-slate-100 border border-white/80 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                          : <Package size={18} className="text-foreground/30" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-foreground whitespace-nowrap">{p.name}</span>
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-foreground/60 truncate max-w-[160px] mt-0.5">{p.description}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {isVisible("brand") && <td className="px-2 py-4">
                    <span className="text-sm text-foreground/60">{p.brand || <span className="text-foreground/60">—</span>}</span>
                  </td>}

                  {isVisible("sku") && <td className="py-4">
                    <span className="text-[11px] font-mono text-black bg-slate-100 px-2 py-0.5 rounded-lg">{p.sku}</span>
                  </td>}

                  {isVisible("sell") && <td className="py-4 px-4 w-[200px]">
                    <span className="text-sm font-bold text-foreground">{p.sellPrice.toFixed(2)} DH</span>
                  </td>}

                  {isVisible("cost") && <td className="px-2 py-2 w-[200px]">
                    <span className="text-sm font-bold text-slate-500">{p.purchasePrice.toFixed(2)} DH</span>
                  </td>}

                  {isVisible("qty") && <td className="px-9 py-4">
                    <span className={`text-sm font-bold tracking-wider ${
                      p.quantity === 0 ? "text-rose-500"
                      : p.quantity <= p.minStockLevel ? "text-amber-500"
                      : "text-foreground"
                    }`}>{p.quantity}</span>
                  </td>}

                  {isVisible("date") && <td className="px-6 py-4">
                    <span className="text-sm text-foreground/60">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </td>}

                  {isVisible("color") && <td className="px-6 py-4">
                    {p.color ? (
                      <span className="inline-block w-8 h-8 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: p.color }} />
                    ) : <span className="text-slate-300">—</span>}
                  </td>}

                  {isVisible("status") && <td className="px-6 py-4 text-center text-[11px] max-w-[150px] truncate">
                    <StockBadge qty={p.quantity} min={p.minStockLevel} />
                  </td>}

                  {isVisible("action") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                        {onViewDetails && (
                          <button onClick={() => onViewDetails(p)} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(p)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" title="Edit">
                            <Edit3 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => setDeleteTarget(p)} disabled={deletingId === p.id} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-medium">
            Showing {products.length > 0 ? (page - 1) * pageSize + 1 : 0} – {Math.min(page * pageSize, products.length)} of {products.length} products
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            Rows per page:
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-slate-200 rounded-lg px-2 py-1 bg-white font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {sortKey && (
            <button onClick={() => { setSortKey(null); setSortDir("asc"); }} className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-600 transition-colors px-2 py-0.5 rounded-lg hover:bg-indigo-50">
              Clear sort
            </button>
          )}
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product?"
        description={(
          <>
            This action cannot be undone. This will permanently delete{" "}
            <strong className="text-foreground">{deleteTarget?.name}</strong>{" "}
            and remove it from your inventory records.
          </>
        )}
        onConfirm={() => {
          if (deleteTarget && onDelete) {
            onDelete(deleteTarget);
            setDeleteTarget(null);
          }
        }}
      />
    </>
  );
}