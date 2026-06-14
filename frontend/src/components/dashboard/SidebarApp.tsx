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
  Activity,
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
import { Logo } from "../logo/logo";
import { cn } from "@/lib/utils";

// Each item gets a distinctive iOS-style icon color
const mainMenuItems = [
  { name: "Dashboard",       icon: LayoutDashboard, path: "/dashboard",                color: "bg-blue-500",   shadow: "shadow-blue-500/30" },
  { name: "Products",        icon: Box,             path: "/dashboard/products",       color: "bg-blue-500",   shadow: "shadow-blue-500/30" },
  { name: "Categories",      icon: Tags,            path: "/dashboard/categories",     color: "bg-blue-500",   shadow: "shadow-blue-500/30" },
  { name: "Sales",           icon: ShoppingCart,    path: "/dashboard/sales",          color: "bg-blue-500",   shadow: "shadow-blue-500/30" },
  { name: "Users",           icon: Users,           path: "/dashboard/users",          color: "bg-blue-500",   shadow: "shadow-blue-500/30" },
  { name: "AI Assistant",    icon: Sparkles,        path: "/dashboard/EmexaAssistant", color: "bg-blue-500",   shadow: "shadow-blue-500/30" },
  { name: "Reports",         icon: BarChart2,       path: "/dashboard/reports",        color: "bg-blue-500",   shadow: "shadow-blue-500/30" },
];

const generalMenuItems = [
  { name: "Activity Logs", icon: Activity, path: "/dashboard/activity-logs", color: "bg-blue-500",   shadow: "shadow-blue-500/30" },
  { name: "Settings", icon: Settings,   path: "/dashboard/settings", color: "bg-blue-500", shadow: "shadow-blue-500/30" },
  { name: "Help",     icon: HelpCircle, path: "/dashboard/help",     color: "bg-blue-500",  shadow: "shadow-blue-500/30" },

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
        "flex items-center rounded-[15px] transition-all duration-200 select-none text-[15px] font-medium ",
        isCollapsed
          ? "w-10 h-10 justify-center mx-auto"
          : "gap-4 px-3 py-2.5 w-full",
        isActive
          ? "bg-linear-to-l from-blue-500 via-blue-800 to-indigo-900 text-white shadow-lg shadow-blue-500/25"
          : "text-foreground hover:bg-foreground/10 hover:text-foreground active:scale-[0.98]"
      )}
    >
    
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

  const [userRole, setUserRole] = useState("Manager");

  useEffect(() => { 
    setMounted(true); 
    const storedRole = sessionStorage.getItem("role") || sessionStorage.getItem("userRole");
    if (storedRole) {
      setUserRole(storedRole.toUpperCase());
    }
  }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("role");
    localStorage.removeItem("auth");
    localStorage.removeItem("role");
    router.replace("/login");
  };

  if (!mounted) return null;

  const filteredMainMenuItems = mainMenuItems.filter(item => {
    if (item.name === "Users" && userRole !== "ADMIN") return false;
    if (item.name === "Reports" && userRole !== "ADMIN") return false;
    if (item.name === "Activity Logs" && userRole !== "ADMIN") return false;
    return true;
  });

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
        {/* Logo + Brand Container */}
        <div className={cn(
          "flex items-center transition-all duration-300 ease-in-out", 
          isCollapsed ? "gap-0 justify-center w-full" : "gap-3 px-1"
        )}>
          <div className={cn(
            "relative flex items-center justify-center shrink-0 rounded-xl transition-all duration-500",
            isCollapsed ? "w-10 h-10 bg-primary/10" : "w-9 h-9 bg-linear-to-br from-primary/20 to-primary/5 shadow-sm"
          )}>
            <Logo className="w-6 h-6 drop-shadow-md" />
            <div className="absolute inset-0 rounded-xl border border-primary/10 pointer-events-none" />
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[16px] font-black tracking-tighter text-foreground leading-none">
                IMN <span className="text-primary text-[16px] align-top ml-0.5">SYSTEM</span>
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">
                Inventory Hub
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {!isCollapsed && <SidebarSeparator className="mx-4 opacity-[0.08]" />}

      {/* Main Navigation */}
      <SidebarContent
        className="flex flex-col h-full py-2 group-data-[collapsible=icon]:px-1.5"
        style={{ fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        {/* Top Section: Main Menu */}
        <div className="flex flex-col gap-2 px-3">
          {!isCollapsed && (
            <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/60 select-none">
              Menu
            </p>
          )}
          <SidebarMenu className={cn("gap-0.5", isCollapsed && "items-center")}>
            {filteredMainMenuItems.map((item) => (
              <SidebarMenuItem key={item.name} className={isCollapsed ? "w-full flex justify-center" : ""}>
                <NavItem
                  {...item}
                  isActive={pathname === item.path}
                  isCollapsed={isCollapsed}
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Bottom Section: General */}
        <div className="mt-auto flex flex-col gap-2 px-3 pb-4">
          {!isCollapsed && (
            <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/60 select-none">
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
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-4 py-3 border-t border-foreground/10">
        {!isCollapsed && (
          <p
            className="text-center text-[10px] font-medium tracking-widest uppercase text-foreground/20"
            style={{ fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            v2.0.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
