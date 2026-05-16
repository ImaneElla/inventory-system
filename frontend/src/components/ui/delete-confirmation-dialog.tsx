"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
}: DeleteConfirmationDialogProps) {
  const isDanger = variant === "danger";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl border-border/40 bg-background/80 backdrop-blur-3xl p-8 text-center max-w-sm sm:max-w-md overflow-hidden">
        <div className={`absolute top-0 inset-x-0 h-40 bg-linear-to-b ${isDanger ? 'from-rose-500/10' : 'from-amber-500/10'} to-transparent pointer-events-none`} />
        
        <AlertDialogHeader className="relative z-10 text-center space-y-3">
          <div className={`w-16 h-16 rounded-3xl bg-linear-to-b ${isDanger ? 'from-rose-500/10' : 'from-amber-500/10'} to-transparent border border-border/10 flex items-center text-center justify-center mx-auto mb-4`}>
            <Trash2 size={28} className={isDanger ? "text-rose-500" : "text-amber-500"} />
          </div>
          
          <AlertDialogTitle className="text-2xl font-bold tracking-tight text-foreground w-full text-center sm:text-center">
            {title}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="font-medium leading-relaxed w-full text-center sm:text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="relative z-10 sm:justify-center gap-3 pt-6">
          <AlertDialogCancel className="rounded-2xl h-12 px-6 font-semibold cursor-pointer border-none transition-all flex-1 hover:bg-muted/10">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className={`rounded-2xl h-12 px-6 font-semibold text-white cursor-pointer border-none shadow-lg transition-all flex-1 ${
              isDanger 
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/25" 
                : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
