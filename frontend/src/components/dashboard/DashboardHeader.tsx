"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@/lib/react-query-custom";
import { fetchProducts, resolveImageUrl } from "@/lib/api";
import {
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  LogOut,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

// Deterministic avatar palette — picks a gradient based on initials
const AVATAR_PALETTES = [
  { from: "#6366f1", to: "#8b5cf6" }, // indigo → violet
  { from: "#3b82f6", to: "#06b6d4" }, // blue → cyan
  { from: "#10b981", to: "#14b8a6" }, // emerald → teal
  { from: "#f59e0b", to: "#ef4444" }, // amber → red
  { from: "#ec4899", to: "#8b5cf6" }, // pink → violet
  { from: "#f97316", to: "#eab308" }, // orange → yellow
  { from: "#6366f1", to: "#3b82f6" }, // indigo → blue
  { from: "#14b8a6", to: "#10b981" }, // teal → emerald
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Real notifications will be fetched from API

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  // Fetch real products to generate low/out of stock alerts
  const { data: productsData } = useQuery({
    queryKey: ["products-notifications"],
    queryFn: () => fetchProducts("", 0, 100),
  });

  const notifications = useMemo(() => {
    if (!productsData?.content) return [];
    let settings = { push: true, lowStock: true, emailReports: false };
    try {
      const stored = localStorage.getItem("notificationSettings");
      if (stored) settings = { ...settings, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    if (!settings.push || !settings.lowStock) return [];

    const notifs: any[] = [];
    productsData.content.forEach((p: any) => {
      if (!p.isActive) return;
      if (p.quantity === 0) {
        notifs.push({
          id: `oos-${p.id}`,
          title: "Out of Stock",
          desc: `${p.name} has run out of stock!`,
          time: "System",
          unread: !readNotifIds.has(`oos-${p.id}`)
        });
      } else if (p.minStockLevel > 0 && p.quantity <= p.minStockLevel) {
        notifs.push({
          id: `low-${p.id}`,
          title: "Low Stock Alert",
          desc: `${p.name} is running low (${p.quantity} left)`,
          time: "System",
          unread: !readNotifIds.has(`low-${p.id}`)
        });
      }
    });
    return notifs;
  }, [productsData, readNotifIds]);

  // User info from localStorage (set at login/register)
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Member");
  const [userImage, setUserImage] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);

        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      }

      // Escape to close search
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchValue("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const loadUserFromStorage = () => {
    const storedName = sessionStorage.getItem("userName") || sessionStorage.getItem("username") || "User";
    const storedRole = sessionStorage.getItem("role") || sessionStorage.getItem("userRole") || "Member";
    const storedImage = sessionStorage.getItem("userImage");
    setUserName(storedName);
    setUserRole(storedRole.charAt(0).toUpperCase() + storedRole.slice(1).toLowerCase());
    // Only resolve non-empty image paths
    setUserImage(storedImage ? resolveImageUrl(storedImage) : null);
  };

  useEffect(() => {
    loadUserFromStorage();
    window.addEventListener("storage", loadUserFromStorage);
    return () => window.removeEventListener("storage", loadUserFromStorage);
  }, []);

  const initials = useMemo(() => getInitials(userName), [userName]);
  const palette  = useMemo(() => getPalette(userName),  [userName]);

  const pathSegments = pathname.split("/").filter(Boolean);
  const unreadCount  = notifications.filter((n) => n.unread).length;

  const handleSignOut = () => {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userImage");
    sessionStorage.removeItem("rememberMe");

    localStorage.removeItem("auth");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("userImage");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("notificationSettings");
    router.replace("/login");
  };

  const markAllRead = () => {
    const newRead = new Set(readNotifIds);
    notifications.forEach(n => newRead.add(n.id));
    setReadNotifIds(newRead);
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4 lg:px-5 backdrop-blur-xl bg-sidebar/80 border-b border-border/60 text-foreground cursor-default shadow-sm"
    >
      {/* Sidebar trigger */}
      <SidebarTrigger
        className="h-8 w-8 rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
      />

      {/* Breadcrumb */}
      {!searchOpen && (
        <div className="flex items-center gap-1.5 overflow-hidden flex-1">
          {pathSegments.map((segment, index) => (
            <React.Fragment key={segment}>
              {index > 0 && (
                <ChevronRight size={13} className="shrink-0 text-muted-foreground opacity-50" />
              )}
              <span
                className={cn(
                  "text-sm font-medium truncate capitalize",
                  index === pathSegments.length - 1
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {segment.replaceAll("-", " ")}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Search — expands inline */}
      <div
        className={cn(
          "flex items-center transition-all duration-300 overflow-hidden",
          searchOpen ? "flex-1" : "w-auto"
        )}
      >
        {searchOpen ? (
          <div
            className="flex items-center w-full rounded-xl px-3 gap-2 h-8 border border-border/50 bg-muted/40"
          >
            <Search size={14} className="text-muted-foreground" />
            <input
              ref={searchInputRef}
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search anything..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Escape") { setSearchOpen(false); setSearchValue(""); }
              }}
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchValue(""); }}
              className="hover:opacity-70 transition-opacity cursor-pointer text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl px-3 h-8 text-sm border border-border/50 bg-muted/40 text-muted-foreground transition-colors cursor-pointer hover:bg-muted/60"
          >
            <Search size={14} />
            <span className="hidden sm:inline text-sm">Search...</span>
            <kbd
              className="hidden md:inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border border-border/60 text-muted-foreground bg-background"
            >
              {typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘F" : "Ctrl+F"}
            </kbd>
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1.5 shrink-0">


        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-border/50"
            >
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex flex-col gap-0.5 px-4 py-3 border-b border-border/50 last:border-0 transition-colors",
                    n.unread ? "bg-muted/30" : ""
                  )}
                >
                  <div className="flex items-center gap-2">
                    {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                    <span className="text-sm font-medium leading-tight">{n.title}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug pl-3.5">{n.desc}</p>
                </div>
              ))}
            </div>
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">All caught up!</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-xl px-2 h-8 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {/* Avatar: photo if available, else serif initial */}
              <div
                className="relative h-10 w-10 rounded-full flex items-center justify-center text-[13px] text-white shrink-0 transition-transform hover:scale-105 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                  
                }}
              >
                {/* Initial — shown when no image, hidden behind photo when image loads */}
                {!userImage && (
                  <span
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 13 }}
                  >
                    {initials.charAt(0)}
                  </span>
                )}
                {userImage && (
                  <img
                    src={userImage}
                    alt={userName}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      // On broken image URL: remove img so the gradient background shows
                      (e.currentTarget as HTMLImageElement).remove();
                    }}
                  />
                )}
              </div>
              {/* Name + role — hidden on small screens */}
              <div className="hidden md:flex flex-col items-start leading-tight hover:scale-105">
                <span className="text-[13px] font-semibold text-foreground truncate max-w-[120px]">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground">{userRole}</span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {/* Header section with avatar + name */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 py-1">
                <div
                  className="relative h-9 w-9 rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                    boxShadow: `0 2px 8px ${palette.from}44`,
                  }}
                >
                  {!userImage && (
                    <span
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 15 }}
                    >
                      {initials.charAt(0)}
                    </span>
                  )}
                  {userImage && (
                    <img
                      src={userImage}
                      alt={userName}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).remove();
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold truncate">{userName}</span>
                  <span
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded-full w-fit"
                    style={{
                      background: `${palette.from}22`,
                      color: palette.from,
                    }}
                  >
                    {userRole}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Theme sub-menu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer hover:bg-accent/10 focus:bg-accent/10">
                <Sun size={15} className="mr-2" />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer gap-2 hover:bg-accent/10 focus:bg-accent/10">
                  <Sun size={14} /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer gap-2 hover:bg-accent/10 focus:bg-accent/10">
                  <Moon size={14} /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer gap-2 hover:bg-accent/10 focus:bg-accent/10">
                  <Monitor size={14} /> System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer gap-2"
            >
              <LogOut size={15} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
