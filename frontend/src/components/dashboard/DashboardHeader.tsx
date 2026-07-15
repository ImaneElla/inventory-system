"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@/lib/react-query-custom";
import { fetchProducts, fetchSales, resolveImageUrl } from "@/lib/api";
import {
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  LogOut,
  X,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Database,
  Sparkles,
  Trash2,
  Check,
  Eye,
  ExternalLink,
  BellOff,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAppPrefs } from "@/lib/appPrefs";
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

/** Format a date into a relative "time ago" string */
function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

// --- Navigation & Notification Helpers ---
const navigationItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Products List", path: "/dashboard/products" },
  { name: "Categories", path: "/dashboard/categories" },
  { name: "Sales & POS", path: "/dashboard/sales" },
  { name: "Users & Team", path: "/dashboard/users" },
  { name: "AI Assistant (Emexa)", path: "/dashboard/EmexaAssistant" },
  { name: "Financial Reports", path: "/dashboard/reports" },
  { name: "Activity Logs", path: "/dashboard/activity-logs" },
  { name: "Settings", path: "/dashboard/settings" },
  { name: "Help & FAQ", path: "/dashboard/help" },
];

type NotifType = "sale" | "backup" | "ai" | "oos" | "low" | "activity" | "default";

function getNotifIcon(type: NotifType) {
  switch (type) {
    case "sale":
      return (
        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
          <ShoppingCart size={16} />
        </div>
      );
    case "backup":
      return (
        <div className="w-9 h-9 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
          <Database size={16} />
        </div>
      );
    case "ai":
      return (
        <div className="w-9 h-9 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
          <Sparkles size={16} />
        </div>
      );
    case "oos":
      return (
        <div className="w-9 h-9 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
          <AlertTriangle size={16} />
        </div>
      );
    case "low":
      return (
        <div className="w-9 h-9 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
          <Boxes size={16} />
        </div>
      );
    case "activity":
      return (
        <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
          <Activity size={16} />
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-500 shrink-0">
          <Bell size={16} />
        </div>
      );
  }
}

const TYPE_LABELS: Record<NotifType, string> = {
  sale: "Sale",
  backup: "System",
  ai: "AI Insight",
  oos: "Out of Stock",
  low: "Low Stock",
  activity: "Activity",
  default: "Notification",
};

const TYPE_COLORS: Record<NotifType, string> = {
  sale: "bg-emerald-500/10 text-emerald-600",
  backup: "bg-blue-500/10 text-blue-600",
  ai: "bg-purple-500/10 text-purple-600",
  oos: "bg-rose-500/10 text-rose-600",
  low: "bg-amber-500/10 text-amber-600",
  activity: "bg-indigo-500/10 text-indigo-600",
  default: "bg-slate-500/10 text-slate-600",
};

const TYPE_GRADIENT: Record<NotifType, string> = {
  sale: "from-emerald-400 to-teal-500",
  backup: "from-blue-400 to-cyan-500",
  ai: "from-purple-400 to-violet-500",
  oos: "from-rose-400 to-pink-500",
  low: "from-amber-400 to-orange-500",
  activity: "from-indigo-400 to-violet-500",
  default: "from-slate-400 to-slate-500",
};

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  rawTime: Date;
  type: NotifType;
  unread: boolean;
  path: string;
}

// ----------- Notification Detail Modal (portal) -----------
interface NotifModalProps {
  notif: Notification;
  isRead: boolean;
  onClose: () => void;
  onMarkRead: () => void;
  onRemove: () => void;
  onGoTo: () => void;
}

function NotifModal({ notif, isRead, onClose, onMarkRead, onRemove, onGoTo }: NotifModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const gradient = TYPE_GRADIENT[notif.type] ?? TYPE_GRADIENT.default;
  const colorClass = TYPE_COLORS[notif.type] ?? TYPE_COLORS.default;
  const label = TYPE_LABELS[notif.type] ?? TYPE_LABELS.default;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-border/60 bg-card shadow-2xl overflow-hidden"
        style={{ animation: "notifModalIn 0.18s cubic-bezier(.22,1,.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color accent top bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

        {/* Header */}
        <div className="flex items-start gap-4 px-6 pt-5 pb-4">
          <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-[15px] font-bold text-foreground leading-tight">{notif.title}</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">{notif.time}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <X size={15} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 mx-6" />

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-foreground/80 leading-relaxed">{notif.desc}</p>

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-4">
            <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full", colorClass)}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {label}
            </span>
            <span className="text-muted-foreground/50 text-xs">·</span>
            <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", isRead ? "text-muted-foreground" : "text-primary")}>
              {isRead ? <><Check size={11} /> Read</> : <><Eye size={11} /> Unread</>}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-6 pb-6">
          <button
            onClick={onGoTo}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-[.98] transition-all cursor-pointer"
          >
            <ExternalLink size={13} /> Go to page
          </button>

          {!isRead && (
            <button
              onClick={onMarkRead}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted active:scale-[.98] transition-all cursor-pointer"
            >
              <Eye size={13} /> Mark read
            </button>
          )}

          <button
            onClick={onRemove}
            className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-rose-500/30 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 active:scale-[.98] transition-all cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes notifModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(modal, document.body);
}

// ----------- Main Component -----------
export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { t } = useAppPrefs();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());
  const [removedNotifIds, setRemovedNotifIds] = useState<Set<string>>(new Set());
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedRead = localStorage.getItem("readNotifIds");
      if (savedRead) {
        setReadNotifIds(new Set(JSON.parse(savedRead)));
      }
      const savedRemoved = localStorage.getItem("removedNotifIds");
      if (savedRemoved) {
        setRemovedNotifIds(new Set(JSON.parse(savedRemoved)));
      }
    } catch (e) {
      console.error("Failed to load notifications state:", e);
    }
  }, []);

  // --- Real data queries ---
  const { data: productsData } = useQuery({
    queryKey: ["products-notifications"],
    queryFn: () => fetchProducts("", 0, 100),
  });

  // Activity logs from backend
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const fetchLogs = useCallback(async () => {
    try {
      const userId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;
      const headers: Record<string, string> = {};
      if (userId) headers["X-Current-User-Id"] = userId;
      const res = await fetch("/api/v1/activity-logs", { headers });
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data); // get all to filter properly
      }
    } catch {/* ignore */}
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Build unified notification list from real data
  const notifications: Notification[] = useMemo(() => {
    const notifs: Notification[] = [];

    // 1. Stock alerts (real products)
    if (productsData?.content) {
      let settings = { push: true, lowStock: true };
      try {
        const stored = localStorage.getItem("notificationSettings");
        if (stored) settings = { ...settings, ...JSON.parse(stored) };
      } catch { /* ignore */ }

      if (settings.push && settings.lowStock) {
        productsData.content.forEach((p: any) => {
          if (!p.isActive) return;
          if (p.quantity === 0) {
            const id = `oos-${p.id}`;
            notifs.push({
              id,
              title: "Out of Stock",
              desc: `"${p.name}" has run out of stock and needs restocking.`,
              time: "Just now",
              rawTime: new Date(),
              type: "oos",
              unread: !readNotifIds.has(id),
              path: `/dashboard/products?search=${encodeURIComponent(p.name)}`,
            });
          } else if (p.minStockLevel > 0 && p.quantity <= p.minStockLevel) {
            const id = `low-${p.id}`;
            notifs.push({
              id,
              title: "Low Stock Warning",
              desc: `"${p.name}" is running low — only ${p.quantity} unit${p.quantity !== 1 ? "s" : ""} left (min: ${p.minStockLevel}).`,
              time: "Just now",
              rawTime: new Date(),
              type: "low",
              unread: !readNotifIds.has(id),
              path: `/dashboard/products?search=${encodeURIComponent(p.name)}`,
            });
          }
        });
      }
    }

    // 2. Activity logs: filter only for adding/creating actions
    const addKeywords = ["created", "added", "processed", "generated"];
    activityLogs.forEach((log: any) => {
      const desc = (log.what || "").toLowerCase();
      const isAddAction = addKeywords.some(keyword => desc.includes(keyword));

      if (isAddAction) {
        const id = `log-${log.id}`;
        
        // Extract type mapping for icon/styling
        let type: NotifType = "activity";
        if (desc.includes("sale")) type = "sale";
        else if (desc.includes("product")) type = "oos"; // styling matching product warning colors
        else if (desc.includes("category")) type = "ai"; // category creation
        else if (desc.includes("report")) type = "backup"; // reports

        const userNameText = log.who?.name ? `${log.who.name} (${log.who.role || "User"})` : "System";

        notifs.push({
          id,
          title: desc.includes("sale") ? "New Sale Processed" 
               : desc.includes("product") ? "New Product Added"
               : desc.includes("category") ? "New Category Added"
               : desc.includes("report") ? "New Report Generated"
               : "New Activity",
          desc: `${userNameText}: ${log.what}`,
          time: timeAgo(log.when ? new Date(log.when) : new Date()),
          rawTime: log.when ? new Date(log.when) : new Date(),
          type,
          unread: !readNotifIds.has(id),
          path: desc.includes("sale") ? "/dashboard/sales"
              : desc.includes("product") ? "/dashboard/products"
              : desc.includes("category") ? "/dashboard/categories"
              : desc.includes("report") ? "/dashboard/reports"
              : "/dashboard/activity-logs",
        });
      }
    });

    // Sort by rawTime descending, filter removed
    return notifs
      .filter((n) => !removedNotifIds.has(n.id))
      .sort((a, b) => b.rawTime.getTime() - a.rawTime.getTime());
  }, [productsData, activityLogs, readNotifIds, removedNotifIds]);

  const groupedSuggestions = useMemo(() => {
    if (!searchValue.trim()) return { pages: [], products: [] };
    const query = searchValue.toLowerCase();

    const pages = navigationItems.filter(item =>
      item.name.toLowerCase().includes(query)
    );

    const products = (productsData?.content ?? [])
      .filter((p: any) => p.name.toLowerCase().includes(query))
      .slice(0, 5);

    return { pages, products };
  }, [searchValue, productsData]);

  // User info from localStorage (set at login/register)
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Member");
  const [userImage, setUserImage] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

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

    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchValue("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  const loadUserFromStorage = () => {
    const storedName = sessionStorage.getItem("userName") || sessionStorage.getItem("username") || "User";
    const storedRole = sessionStorage.getItem("role") || sessionStorage.getItem("userRole") || "Member";
    const storedImage = sessionStorage.getItem("userImage");
    setUserName(storedName);
    setUserRole(storedRole.charAt(0).toUpperCase() + storedRole.slice(1).toLowerCase());
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
    localStorage.setItem("readNotifIds", JSON.stringify(Array.from(newRead)));
  };

  const markOneRead = (id: string) => {
    const newRead = new Set(readNotifIds);
    newRead.add(id);
    setReadNotifIds(newRead);
    localStorage.setItem("readNotifIds", JSON.stringify(Array.from(newRead)));
  };

  const removeNotif = (id: string) => {
    const newRemoved = new Set(removedNotifIds);
    newRemoved.add(id);
    setRemovedNotifIds(newRemoved);
    localStorage.setItem("removedNotifIds", JSON.stringify(Array.from(newRemoved)));
    if (selectedNotif?.id === id) setSelectedNotif(null);
  };

  const removeAllNotifs = () => {
    const newRemoved = new Set(removedNotifIds);
    notifications.forEach(n => newRemoved.add(n.id));
    setRemovedNotifIds(newRemoved);
    localStorage.setItem("removedNotifIds", JSON.stringify(Array.from(newRemoved)));
    setSelectedNotif(null);
  };

  const getBreadcrumbLabel = (segment: string) => {
    const camelCased = segment.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const key = `nav.${camelCased}`;
    const translated = t(key);
    return translated !== key ? translated : segment.replaceAll("-", " ");
  };

  return (
    <>
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
                  {getBreadcrumbLabel(segment)}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Search — expands inline */}
        <div
          ref={searchWrapRef}
          className={cn(
            "relative flex items-center transition-all duration-300",
            searchOpen ? "flex-1 overflow-visible" : "w-auto overflow-hidden"
          )}
        >
          {searchOpen ? (
            <div className="relative flex-1">
              <div
                className="flex items-center w-full rounded-xl px-3 gap-2 h-8 border border-border/50 bg-muted/40"
              >
                <Search size={14} className="text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t("header.searchPlaceholder")}
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

              {/* Grouped Suggestions Dropdown */}
              {searchValue.trim() && (
                <div className="absolute top-10 left-0 right-0 z-50 bg-card border border-border rounded-2xl shadow-2xl p-2 max-h-80 overflow-y-auto w-full sm:w-96">
                  {groupedSuggestions.pages.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-3 py-1">Pages</p>
                      {groupedSuggestions.pages.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            router.push(item.path);
                            setSearchOpen(false);
                            setSearchValue("");
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-left hover:bg-primary/5 transition-all text-foreground w-full text-xs font-semibold cursor-pointer"
                        >
                          <ChevronRight size={12} className="text-muted-foreground" />
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {groupedSuggestions.products.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-3 py-1">Products</p>
                      {groupedSuggestions.products.map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            router.push(`/dashboard/products?search=${encodeURIComponent(p.name)}`);
                            setSearchOpen(false);
                            setSearchValue("");
                          }}
                          className="flex items-center justify-between px-3 py-1.5 rounded-xl text-left hover:bg-primary/5 transition-all text-foreground w-full text-xs font-semibold cursor-pointer"
                        >
                          <span>{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md">
                            {p.quantity} left · {p.sellPrice} DH
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {groupedSuggestions.pages.length === 0 && groupedSuggestions.products.length === 0 && (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      No suggestions found for &quot;{searchValue}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl px-3 h-8 text-sm border border-border/50 bg-muted/40 text-muted-foreground transition-colors cursor-pointer hover:bg-muted/60"
            >
              <Search size={14} />
              <span className="hidden sm:inline text-sm">{t("header.search")}</span>
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
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] p-0 overflow-hidden rounded-2xl border-border shadow-2xl">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-primary" />
                  <span className="text-sm font-bold text-foreground">{t("header.notifications")}</span>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Check size={11} /> Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={removeAllNotifs}
                      className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "group flex gap-3 px-4 py-3 hover:bg-muted/30 transition-all items-start relative",
                      n.unread ? "bg-primary/[0.03]" : ""
                    )}
                  >
                    {/* Unread dot */}
                    {n.unread && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}

                    {/* Clickable area → open modal */}
                    <button
                      onClick={() => { setSelectedNotif(n); markOneRead(n.id); setNotifOpen(false); }}
                      className="flex gap-3 flex-1 min-w-0 items-start cursor-pointer text-left"
                    >
                      {getNotifIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className={cn(
                            "text-xs truncate",
                            n.unread ? "font-bold text-foreground" : "font-semibold text-foreground/80"
                          )}>{n.title}</span>
                          <span className="ml-auto text-[9px] text-muted-foreground shrink-0 whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{n.desc}</p>
                      </div>
                    </button>

                    {/* Hover action icons */}
                    <div className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {n.unread && (
                        <button
                          title="Mark as read"
                          onClick={(e) => { e.stopPropagation(); markOneRead(n.id); }}
                          className="h-6 w-6 rounded-md flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                      )}
                      <button
                        title="Remove"
                        onClick={(e) => { e.stopPropagation(); removeNotif(n.id); }}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {notifications.length === 0 && (
                <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                    <BellOff size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">No notifications</p>
                    <p className="text-xs text-muted-foreground mt-0.5">You&apos;re all caught up!</p>
                  </div>
                </div>
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
                  {t("header.theme")}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer gap-2 hover:bg-accent/10 focus:bg-accent/10">
                    <Sun size={14} /> {t("header.theme.light")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer gap-2 hover:bg-accent/10 focus:bg-accent/10">
                    <Moon size={14} /> {t("header.theme.dark")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer gap-2 hover:bg-accent/10 focus:bg-accent/10">
                    <Monitor size={14} /> {t("header.theme.system")}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer gap-2"
              >
                <LogOut size={15} />
                {t("header.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* Notification Detail Modal — rendered via portal so it's always centered */}
      {selectedNotif && (
        <NotifModal
          notif={selectedNotif}
          isRead={readNotifIds.has(selectedNotif.id)}
          onClose={() => setSelectedNotif(null)}
          onMarkRead={() => markOneRead(selectedNotif.id)}
          onRemove={() => removeNotif(selectedNotif.id)}
          onGoTo={() => {
            router.push(selectedNotif.path);
            setSelectedNotif(null);
            setNotifOpen(false);
          }}
        />
      )}
    </>
  );
}
