"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ShoppingCart,
  Package,
  FileText,
  Users,
  Tags,
  Settings,
  Shield,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { useActivityLog, ActivityLogEntry, LogIcon } from "@/lib/activityLog";
import { formatRelativeTime } from "@/lib/timeUtils";
import { resolveProfileImageUrl } from "@/lib/api";

function getIconConfig(icon: LogIcon) {
  switch (icon) {
    case "sale":     return { Icon: ShoppingCart, bg: "bg-emerald-500/10", text: "text-emerald-500", ring: "ring-emerald-500/20" };
    case "product":  return { Icon: Package,      bg: "bg-blue-500/10",    text: "text-blue-500",    ring: "ring-blue-500/20" };
    case "report":   return { Icon: FileText,     bg: "bg-indigo-500/10",  text: "text-indigo-500",  ring: "ring-indigo-500/20" };
    case "user":     return { Icon: Users,         bg: "bg-purple-500/10",  text: "text-purple-500",  ring: "ring-purple-500/20" };
    case "category": return { Icon: Tags,          bg: "bg-amber-500/10",   text: "text-amber-500",   ring: "ring-amber-500/20" };
    default:         return { Icon: Settings,      bg: "bg-slate-500/10",   text: "text-slate-500",   ring: "ring-slate-500/20" };
  }
}

function LogItem({ entry, index }: { entry: ActivityLogEntry; index: number }) {
  const { Icon, bg, text, ring } = getIconConfig(entry.icon);
  const initials = entry.who.name.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className="flex gap-4 group"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-xl ${bg} ${text} flex items-center justify-center shrink-0 ring-1 ${ring} shadow-sm`}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <div className="w-px flex-1 bg-border/40 mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl p-4 shadow-sm group-hover:shadow-md group-hover:border-border transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* User avatar */}
              <div className="relative w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black overflow-hidden">
                {entry.who.avatar ? (
                  <img
                    src={resolveProfileImageUrl(entry.who.avatar) ?? ""}
                    alt={entry.who.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm text-foreground truncate">{entry.who.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    entry.who.role === "ADMIN"
                      ? "bg-purple-500/10 text-purple-600"
                      : "bg-blue-500/10 text-blue-600"
                  }`}>
                    {entry.who.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">{entry.what}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider shrink-0">
              <div className="flex items-center gap-1">
                <Calendar size={9} />
                <span>{entry.when.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={9} />
                <span>{entry.when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ActivityLogsPage() {
  const router = useRouter();
  const { logs } = useActivityLog();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem("role") || "";
    setAuthorized(role.toUpperCase() === "ADMIN");
  }, []);

  // Loading state while checking auth
  if (authorized === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 403 — Access Denied
  if (!authorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-3xl bg-rose-500/10 flex items-center justify-center"
        >
          <AlertTriangle size={40} className="text-rose-500" />
        </motion.div>
        <div>
          <p className="text-2xl font-bold text-foreground mt-1">Access Denied</p>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
            This page is restricted to <span className="font-black text-primary">Admin</span> accounts only.
            Your current role does not have permission to view system audit logs.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 h-11 px-6 rounded-2xl btn-gradient text-background text-sm font-bold hover:opacity-80 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-8 relative text-foreground">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="max-w-[900px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-500 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              <Shield size={11} /> Admin Only
            </div>
            <h1 className="text-4xl font-black tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground font-medium mt-1 text-sm">
              Real-time audit trail of all system operations &mdash; {logs.length} event{logs.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="h-10 px-5 flex items-center gap-2 rounded-2xl border border-border text-muted-foreground hover:bg-muted/10 transition-all text-sm font-bold"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Events",    value: logs.length,                                          color: "text-foreground" },
            { label: "Sales",           value: logs.filter(l => l.icon === "sale").length,            color: "text-emerald-500" },
            { label: "Reports",         value: logs.filter(l => l.icon === "report").length,          color: "text-indigo-500" },
            { label: "Products",        value: logs.filter(l => l.icon === "product").length,         color: "text-blue-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-4 text-center shadow-sm">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Live Event Timeline
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
            </div>
          </div>

          <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {logs.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
                    <Activity size={28} className="text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-bold text-muted-foreground">No activity recorded yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Logs will appear here in real-time as users perform actions
                    </p>
                  </div>
                </motion.div>
              ) : (
                logs.map((entry, i) => (
                  <LogItem key={entry.id} entry={entry} index={i} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
