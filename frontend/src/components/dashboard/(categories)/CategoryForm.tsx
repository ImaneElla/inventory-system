"use client";

import React from "react";
import { 
  X, Loader2, Shapes, FileText, Tag,
  Laptop, Smartphone, Headphones, Monitor, Gamepad2, 
  Coffee, Car, Watch, Tv, Camera, Speaker, HardDrive, Package2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const availableIcons = [
  "Laptop", "Smartphone", "Headphones", "Gamepad2", "Monitor",
  "Tag", "Coffee", "Car", "Watch", "Tv", "Camera", "Speaker", "HardDrive", "Package2"
];

const icons: Record<string, React.ElementType> = {
  Laptop, Smartphone, Headphones, Gamepad2, Monitor,
  Tag, Coffee, Car, Watch, Tv, Camera, Speaker, HardDrive, Package2
};

interface CategoryFormProps {
  form: { name: string; icon: string; description: string };
  setForm: (form: any) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onClose: () => void;
  editId: number | null;
  busy: boolean;
  error: string;
}

export function CategoryForm({
  form,
  setForm,
  onSubmit,
  onClose,
  editId,
  busy,
  error,
}: CategoryFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
        <Shapes size={150} />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black">
            {editId ? "Update Category" : "Create New Category"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Refine your catalog organization.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-secondary/50">
          <X size={16} />
        </Button>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1">
              Display Name
            </label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Electronics"
              className="h-14 rounded-2xl bg-background text-base font-semibold border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1 flex items-center gap-2">
              <FileText size={12} /> Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add details about this collection..."
              className="w-full min-h-[100px] p-4 rounded-2xl bg-background text-sm font-medium border border-border focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={busy || !form.name.trim()}
              className="flex-1 h-14 rounded-2xl font-bold btn-gradient text-white shadow-lg shadow-primary/20"
            >
              {busy ? <Loader2 className="animate-spin" /> : editId ? "Save Changes" : "Confirm Creation"}
            </Button>
          </div>
          {error && (
            <p className="text-rose-500 text-sm font-semibold mt-2 px-1">{error}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1">
            Icon Selection
          </label>
          <div className="grid grid-cols-5 gap-2 p-4 bg-background rounded-[1.5rem] border border-border max-h-[300px] overflow-y-auto">
            {availableIcons.map((iconName) => {
              const IconComp = icons[iconName] || Tag;
              const isSelected = form.icon === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setForm({ ...form, icon: iconName })}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                    isSelected ? "btn-gradient text-white scale-110 shadow-lg" : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <IconComp size={18} />
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </motion.div>
  );
}
