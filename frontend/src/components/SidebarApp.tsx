"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Box, ShoppingCart, User, Bot, File, LogOut, Settings, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Logo } from "./logo/logo";

const mainMenuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Products", icon: Box, path: "/dashboard/products" },
  { name: "Sales", icon: ShoppingCart, path: "/dashboard/sales" },
  { name: "Users", icon: User, path: "/dashboard/users" },
  { name: "Ai Assistant", icon: Bot, path: "/dashboard/ai-assistant" },
  { name: "Reports", icon: File, path: "/dashboard/reports" },
];

const generalMenuItems = [
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  { name: "Help", icon: HelpCircle, path: "/dashboard/help" },
];

export default function SidebarApp() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleSignOut = () => {
    localStorage.removeItem("auth");
    router.replace("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex flex-row items-center ">
        <Logo className="w-8 h-8 shrink-0" />
        {!isCollapsed && <span className="font-serif text-lg tracking-tight truncate">IMN System</span>}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.path} tooltip={item.name}>
                    <Link href={item.path} className="flex items-center gap-3">
                      <item.icon size={18} className="shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalMenuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.path} tooltip={item.name}>
                    <Link href={item.path} className="flex items-center gap-3">
                      <item.icon size={18} className="shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleSignOut} 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  tooltip="Logout"
                >
                  <LogOut size={18} className="shrink-0" />
                  {!isCollapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        {!isCollapsed && <div className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">v1.0.0</div>}
      </SidebarFooter>
    </Sidebar>
  );
}
