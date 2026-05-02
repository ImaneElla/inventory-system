"use client";

import React from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function DashboardHeader() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  
  const pathSegments = pathname.split("/").filter(Boolean);
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-black/5 bg-white/80 px-4 backdrop-blur-md lg:px-6 cursor-default">
      <SidebarTrigger className="h-9 w-9 text-[#1c1c1e]/60 hover:bg-black/5 cursor-pointer" />
      
      <div className="flex items-center gap-2 overflow-hidden">
        {pathSegments.map((segment, index) => (
          <React.Fragment key={segment}>
            {index > 0 && <ChevronRight size={14} className="text-[#1c1c1e]/20 shrink-0" />}
            <span 
              className={cn(
                "text-sm font-medium truncate capitalize",
                index === pathSegments.length - 1 ? "text-[#1c1c1e]" : "text-[#1c1c1e]/40"
              )}
            >
              {segment.replace(/-/g, " ")}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-4">

      </div>
    </header>
  );
}
