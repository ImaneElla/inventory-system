"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Sparkles, ShoppingBag, TrendingUp, 
  CreditCard, Calendar, User, DollarSign, MoreVertical,
  Trash2, X, Loader2, Check, ArrowUpRight, Receipt
} from "lucide-react";
import {
  Dropdown, DropdownItem, DropdownMenu, DropdownTrigger,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSales, createSale, deleteSale } from "@/lib/api";

export default function SalesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productName: "", customer: "", amount: "", status: "Completed" });

  const { data: sales = [], isLoading } = useQuery<any[]>({
    queryKey: ["sales"],
    queryFn: fetchSales,
  });

  const createM = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      closeForm();
    },
  });

  const deleteM = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sales"] }),
  });

  const filtered = useMemo(() =>
    sales.filter((s) => 
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase())
    ),
    [sales, search],
  );

  const stats = useMemo(() => {
    const total = sales.reduce((acc, s) => acc + Number(s.amount), 0);
    return {
      revenue: total.toLocaleString(),
      count: sales.length,
      average: sales.length ? (total / sales.length).toFixed(0) : 0
    };
  }, [sales]);

  const closeForm = () => {
    setShowForm(false);
    setForm({ productName: "", customer: "", amount: "", status: "Completed" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createM.mutate(form);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 space-y-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              <TrendingUp size={11} /> Revenue Tracking
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales Ledger</h1>
            <p className="text-slate-500 font-medium">Track your revenue and customer transactions.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="h-12 w-full sm:w-72 pl-12 pr-5 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(!showForm)}
              className={`h-12 inline-flex items-center justify-center gap-2 rounded-2xl font-bold px-6 shadow-lg transition-all border-none cursor-pointer ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700'}`}
            >
              {showForm ? <X size={18} /> : <Plus size={18} strokeWidth={2.5} />}
              {showForm ? "Cancel" : "New Sale"}
            </motion.button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Revenue", value: `$${stats.revenue}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Transactions", value: stats.count, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Avg. Sale Value", value: `$${stats.average}`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Inline Sale Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl p-8 mb-4 relative overflow-hidden"
            >
              <div className="relative flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Receipt size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Record New Transaction</h2>
                  <p className="text-sm text-slate-500">Enter sale details to update your ledger.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Product</label>
                  <input
                    required
                    value={form.productName}
                    onChange={e => setForm({ ...form, productName: e.target.value })}
                    className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    placeholder="e.g. MacBook Pro"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Customer</label>
                  <input
                    required
                    value={form.customer}
                    onChange={e => setForm({ ...form, customer: e.target.value })}
                    className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    placeholder="Customer Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Amount ($)</label>
                  <input
                    required
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    placeholder="0.00"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="h-12 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-100 border-none cursor-pointer flex items-center justify-center gap-2"
                  disabled={createM.isPending}
                >
                  {createM.isPending ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Confirm Sale</>}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sales Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Transaction</th>
                  <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Customer</th>
                  <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                  <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                  <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                   [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-6"><div className="h-12 bg-slate-50 rounded-xl" /></td>
                    </tr>
                  ))
                ) : filtered.map((sale) => (
                  <tr key={sale.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                          <ShoppingBag size={18} />
                        </div>
                        <span className="font-bold text-slate-900">{sale.productName}</span>
                      </div>
                    </td>
                    <td className="p-6 text-slate-600 font-medium">{sale.customer}</td>
                    <td className="p-6 text-slate-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date().toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-6 font-black text-slate-900">${Number(sale.amount).toLocaleString()}</td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Completed
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <Dropdown>
                        <DropdownTrigger>
                          <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 border-none bg-transparent cursor-pointer">
                            <MoreVertical size={18} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem key="view" startContent={<ArrowUpRight size={14} />}>View Details</DropdownItem>
                          <DropdownItem key="delete" onPress={() => deleteM.mutate(sale.id)} className="text-danger" color="danger" startContent={<Trash2 size={14} />}>
                            Delete Record
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}