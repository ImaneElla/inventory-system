"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit3, Eye, MoreVertical, Trash2 } from "lucide-react";
const ProductActions = ({ onEdit, onDelete, onView, isDeleting }: { 
  onEdit: () => void, 
  onDelete: () => void, 
  onView: () => void,
  isDeleting?: boolean 
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-40 rounded-2xl border-border shadow-xl">
      <DropdownMenuItem onClick={onView} className="rounded-lg gap-2 cursor-pointer">
        <Eye className="h-4 w-4 text-blue-500" /> View Details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onEdit} className="rounded-lg gap-2 cursor-pointer">
        <Edit3 className="h-4 w-4 text-amber-500" /> Edit Product
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        onClick={onDelete} 
        disabled={isDeleting}
        className="rounded-lg gap-2 text-rose-500 focus:text-rose-500 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" /> {isDeleting ? "Deleting..." : "Delete"}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);