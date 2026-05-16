"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MoreVertical, Pencil, Trash2, Tag,
  Laptop, Smartphone, Headphones, Monitor, Gamepad2, 
  Coffee, Car, Watch, Tv, Camera, Speaker, HardDrive, Package2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const iconMap: Record<string, React.ElementType> = {
  Laptop, Smartphone, Headphones, Gamepad2, Monitor,
  Tag, Coffee, Car, Watch, Tv, Camera, Speaker, HardDrive, Package2
};

const tokens = [
  { iconBg: "rgba(99,102,241,0.12)",  iconColor: "#6366f1" },
  { iconBg: "rgba(139,92,246,0.12)",  iconColor: "#8b5cf6" },
  { iconBg: "rgba(236,72,153,0.12)",  iconColor: "#ec4899" },
  { iconBg: "rgba(245,158,11,0.12)",  iconColor: "#f59e0b" },
  { iconBg: "rgba(16,185,129,0.12)",  iconColor: "#10b981" },
  { iconBg: "rgba(59,130,246,0.12)",  iconColor: "#3b82f6" },
];

interface CategoryCardProps {
  category: any;
  index: number;
  viewMode: "grid" | "list";
  productCount: number;
  stockCount: number;
  onEdit: (cat: any) => void;
  onDelete: (cat: any) => void;
}

export function CategoryCard({
  category,
  index,
  viewMode,
  productCount,
  stockCount,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Tag;
  const tok = tokens[index % tokens.length];
  const isGrid = viewMode === "grid";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
      className={`group relative bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-200 ${
        isGrid ? "rounded-[2rem] p-6" : "rounded-2xl p-4 flex items-center gap-4"
      }`}
    >
      <div 
        className={`flex items-center justify-center shrink-0 shadow-inner ${isGrid ? "w-14 h-14 rounded-2xl mb-4" : "w-11 h-11 rounded-xl"}`} 
        style={{ background: tok.iconBg, color: tok.iconColor }}
      >
        <Icon size={isGrid ? 28 : 20} strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`font-bold truncate ${isGrid ? "text-lg" : "text-sm"}`}>{category.name}</h3>
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${productCount > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
            {productCount > 0 ? "Active" : "Empty"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
          {productCount} {productCount === 1 ? "Product" : "Products"} • {stockCount} In Stock
        </p>
      </div>

      <div className={isGrid ? "mt-6 pt-4 border-t border-border/50 flex items-center justify-between" : "flex items-center gap-2"}>
        <span className="text-[10px] font-bold text-muted-foreground/40"># {category.id}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary cursor-pointer">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 backdrop-blur-xl border-border">
            <DropdownMenuItem onClick={() => onEdit(category)} className="rounded-lg text-xs font-semibold gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
              <Pencil size={12} /> Edit Category
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(category)} className="rounded-lg text-xs font-semibold gap-2 text-destructive focus:bg-destructive/10 cursor-pointer">
              <Trash2 size={12} /> Delete Permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
