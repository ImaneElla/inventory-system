"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  InputGroup,
  Modal,
  Spinner,
} from "@heroui/react";
import {
  Plus, Search, Laptop, Smartphone, Headphones, Watch, Camera,
  MousePointer2, Info, Tag, Loader2, X, Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, createCategory } from "@/lib/api";

const iconMap: any = {
  Laptops: Laptop,
  Phones: Smartphone,
  Accessories: Headphones,
  Wearables: Watch,
  Cameras: Camera,
  Peripherals: MousePointer2,
};

// Refined pastel-to-vivid palette — indigo, violet, rose, amber, teal, sky
const colorTokens = [
  { bg: "bg-indigo-50",  icon: "bg-indigo-100 text-indigo-600",  ring: "ring-indigo-200",  dot: "bg-indigo-400"  },
  { bg: "bg-violet-50",  icon: "bg-violet-100 text-violet-600",  ring: "ring-violet-200",  dot: "bg-violet-400"  },
  { bg: "bg-rose-50",    icon: "bg-rose-100 text-rose-600",      ring: "ring-rose-200",    dot: "bg-rose-400"    },
  { bg: "bg-amber-50",   icon: "bg-amber-100 text-amber-600",    ring: "ring-amber-200",   dot: "bg-amber-400"   },
  { bg: "bg-teal-50",    icon: "bg-teal-100 text-teal-600",      ring: "ring-teal-200",    dot: "bg-teal-400"    },
  { bg: "bg-sky-50",     icon: "bg-sky-100 text-sky-600",        ring: "ring-sky-200",     dot: "bg-sky-400"     },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch]       = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData]   = useState({ name: "", description: "" });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredCategories = (categories as any[]).filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 p-6 md:p-10 font-[system-ui]">
      {/* ── Background orbs ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-violet-200/25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative space-y-8"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5
                        bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(99,102,241,0.08)]
                        rounded-3xl px-7 py-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">Catalog</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Categories</h1>
            <p className="text-sm text-slate-400 mt-0.5">Organize your entire inventory</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white
                       text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200
                       transition-colors"
          >
            <Plus size={17} strokeWidth={2.5} />
            New Category
          </motion.button>
        </div>

        {/* ── Search ──────────────────────────────────────────── */}
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400
                       bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-300/60 transition"
          />
        </div>

        {/* ── Grid ────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Spinner className="text-indigo-500" />
            <p className="text-slate-400 text-sm font-medium">Loading categories…</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Tag size={28} className="text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">No categories yet</p>
              <p className="text-sm text-slate-400 mt-0.5">Add one to start classifying products</p>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence>
              {filteredCategories.map((cat: any, i: number) => {
                const Icon  = iconMap[cat.name] || Tag;
                const token = colorTokens[i % colorTokens.length];
                return (
                  <motion.div
                    key={cat.id}
                    variants={cardVariants}
                    whileHover={{ y: -6, scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={`relative group cursor-pointer overflow-hidden
                                bg-white/70 backdrop-blur-xl border border-white/80
                                shadow-[0_4px_24px_rgba(0,0,0,0.06)]
                                hover:shadow-[0_12px_36px_rgba(99,102,241,0.14)]
                                rounded-3xl p-7 flex flex-col items-center text-center gap-4
                                transition-shadow duration-300`}
                  >
                    {/* top-right dot */}
                    <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${token.dot} opacity-0 group-hover:opacity-100 transition-opacity`} />

                    {/* icon bubble */}
                    <div className={`w-[68px] h-[68px] rounded-[22px] flex items-center justify-center
                                     ${token.icon} ring-[6px] ${token.ring} ring-offset-0
                                     group-hover:scale-110 transition-transform duration-500`}>
                      <Icon size={30} strokeWidth={1.6} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 max-w-[180px]">
                        {cat.description || "No description available"}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* ── Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md
                              bg-white/90 backdrop-blur-2xl border border-white/60
                              shadow-[0_24px_80px_rgba(99,102,241,0.18)]
                              rounded-[2rem] overflow-hidden">
                {/* Modal header */}
                <div className="flex items-start justify-between px-8 pt-7 pb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">New Category</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Add a classification group</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors mt-0.5"
                  >
                    <X size={15} className="text-slate-500" />
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 mx-8" />

                {/* Form body */}
                <form id="cat-form" onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Tag size={11} /> Name
                    </label>
                    <input
                      required
                      placeholder="e.g. Laptops"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-sm
                                 rounded-2xl px-4 py-3 placeholder:text-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-300/60 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Info size={11} /> Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What belongs in this category?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-800 text-sm
                                 rounded-2xl px-4 py-3 placeholder:text-slate-400 resize-none
                                 focus:outline-none focus:ring-2 focus:ring-indigo-300/60 transition"
                    />
                  </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-8 pb-7">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-slate-600
                               bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    form="cat-form"
                    type="submit"
                    disabled={createMutation.isPending}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-2.5 rounded-2xl text-sm font-bold text-white
                               bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200
                               disabled:opacity-60 transition-colors flex items-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Create"
                    )}
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