"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  Sparkles,
  BarChart2,
  LogOut,
  Settings,
  Tags,

  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Logo } from "./logo/logo";
import { cn } from "@/lib/utils";

// Each item gets a distinctive iOS-style icon color
const mainMenuItems = [
  { name: "Dashboard",    icon: LayoutDashboard, path: "/dashboard",           color: "bg-blue-500",    shadow: "shadow-blue-500/30" },
  { name: "Products",     icon: Box,             path: "/dashboard/products",  color: "bg-orange-500",  shadow: "shadow-orange-500/30" },
  { name: "Categories",   icon: Tags,            path: "/dashboard/categories", color: "bg-yellow-500", shadow: "shadow-yellow-500/30" },
  { name: "Sales",        icon: ShoppingCart,    path: "/dashboard/sales",     color: "bg-green-500",   shadow: "shadow-green-500/30" },
  { name: "Users",        icon: Users,           path: "/dashboard/users",     color: "bg-purple-500",  shadow: "shadow-purple-500/30" },
  { name: "AI Assistant", icon: Sparkles,        path: "/dashboard/ai-assistant", color: "bg-pink-500", shadow: "shadow-pink-500/30" },
  { name: "Reports",      icon: BarChart2,       path: "/dashboard/reports",   color: "bg-teal-500",    shadow: "shadow-teal-500/30" },
];

const generalMenuItems = [
  { name: "Settings", icon: Settings,   path: "/dashboard/settings", color: "bg-slate-500", shadow: "shadow-slate-500/30" },
  { name: "Help",     icon: HelpCircle, path: "/dashboard/help",     color: "bg-cyan-500",  shadow: "shadow-cyan-500/30" },
];

interface NavItemProps {
  icon: React.ElementType;
  name: string;
  path: string;
  color: string;
  shadow: string;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavItem({ icon: Icon, name, path, color, shadow, isActive, isCollapsed }: NavItemProps) {
  return (
    <Link
      href={path}
      title={isCollapsed ? name : undefined}
      className={cn(
        "flex items-center rounded-[15px] transition-all duration-200 select-none text-[15px] font-medium",
        isCollapsed
          ? "w-10 h-10 justify-center mx-auto"
          : "gap-3 px-3 py-2.5 w-full",
        isActive
          ? "bg-linear-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25"
          : "text-[#1c1c1e]/70 hover:bg-black/5 hover:text-[#1c1c1e] active:scale-[0.98]"
      )}
    >
      {/* iOS-style icon badge */}
      <span
        className={cn(
          "flex items-center justify-center rounded-[9px] shrink-0",
          isCollapsed ? "w-10 h-10 rounded-xl" : "w-8 h-8 shadow-sm",
          isActive
            ? isCollapsed
              ? "bg-linear-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-lg shadow-blue-500/30"
              : "bg-white/20"
            : `${color} ${shadow} shadow-md`
        )}
      >
        <Icon size={isCollapsed ? 20 : 17} className="text-white" strokeWidth={2} />
      </span>
      {!isCollapsed && <span className="truncate leading-none">{name}</span>}
    </Link>
  );
}

export default function SidebarApp() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => { setMounted(true); }, []);

  const handleSignOut = () => {
    localStorage.removeItem("auth");
    router.replace("/login");
  };

  if (!mounted) return null;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]"
    >
      {/* Header */}
      <SidebarHeader
        className={cn(
          "flex flex-row items-center min-h-[60px]",
          isCollapsed
            ? "px-1.5 justify-center flex-col gap-2 py-3"
            : "px-4 py-4"
        )}
      >
        {/* Logo + Brand */}
        <div className={cn("flex items-center overflow-hidden", isCollapsed ? "gap-0 justify-center" : "gap-2.5")}>
          <Logo className="w-8 h-8 shrink-0 rounded-lg" />
          {!isCollapsed && (
            <span
              className="text-[17px] font-semibold font font-serif tracking-tight truncate text-[#1c1c1e]"
            >
              IMN
            </span>
          )}
        </div>
      </SidebarHeader>

      {!isCollapsed && <SidebarSeparator className="mx-4 opacity-[0.08]" />}

      {/* Main Navigation */}
      <SidebarContent
        className="px-3 py-2 group-data-[collapsible=icon]:px-1.5"
        style={{ fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        {/* Menu section */}
        {!isCollapsed && (
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1c1c1e]/35 select-none">
            Menu
          </p>
        )}
        <SidebarMenu className={cn("gap-0.5", isCollapsed && "items-center")}>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.name} className={isCollapsed ? "w-full flex justify-center" : ""}>
              <NavItem
                {...item}
                isActive={pathname === item.path}
                isCollapsed={isCollapsed}
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* General section */}
        {!isCollapsed && (
          <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1c1c1e]/35 select-none">
            General
          </p>
        )}
        {isCollapsed && <div className="h-3" />}
        <SidebarMenu className={cn("gap-0.5", isCollapsed && "items-center")}>
          {generalMenuItems.map((item) => (
            <SidebarMenuItem key={item.name} className={isCollapsed ? "w-full flex justify-center" : ""}>
              <NavItem
                {...item}
                isActive={pathname === item.path}
                isCollapsed={isCollapsed}
              />
            </SidebarMenuItem>
          ))}
          {/* Logout */}
          <SidebarMenuItem className={isCollapsed ? "w-full flex justify-center" : ""}>
            <button
              onClick={handleSignOut}
              title={isCollapsed ? "Sign Out" : undefined}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 select-none",
                isCollapsed
                  ? "w-10 h-10 justify-center"
                  : "w-full gap-3 px-3 py-2.5 text-[15px] font-medium text-red-500 hover:bg-red-50 active:scale-[0.98]"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-[9px] shrink-0 bg-red-500 shadow-md shadow-red-500/30",
                  isCollapsed ? "w-10 h-10 rounded-xl" : "w-8 h-8"
                )}
              >
                <LogOut size={isCollapsed ? 20 : 17} className="text-white" strokeWidth={2} />
              </span>
              {!isCollapsed && <span className="truncate leading-none">Sign Out</span>}
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-4 py-3 border-t border-black/5">
        {!isCollapsed && (
          <p
            className="text-center text-[10px] font-medium tracking-widest uppercase text-[#1c1c1e]/20"
            style={{ fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            v1.0.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
