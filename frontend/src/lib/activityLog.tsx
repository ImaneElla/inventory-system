"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type LogIcon = "sale" | "product" | "report" | "user" | "category" | "system";

export interface ActivityLogEntry {
  id: string;
  who: {
    name: string;
    role: string;
    avatar: string | null;
  };
  what: string;
  when: Date;
  icon: LogIcon;
}

interface ActivityLogContextType {
  logs: ActivityLogEntry[];
  addLog: (what: string, icon?: LogIcon) => void;
  clearLogs: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | null>(null);

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const counterRef = useRef(0);

  const addLog = useCallback((what: string, icon: LogIcon = "system") => {
    const name = typeof window !== "undefined" ? (localStorage.getItem("userName") || "System") : "System";
    const role = typeof window !== "undefined" ? (localStorage.getItem("role") || "USER") : "USER";
    const avatar = typeof window !== "undefined" ? localStorage.getItem("userImage") : null;

    counterRef.current += 1;
    const entry: ActivityLogEntry = {
      id: `log-${Date.now()}-${counterRef.current}`,
      who: { name, role, avatar },
      what,
      when: new Date(),
      icon,
    };

    setLogs((prev) => [entry, ...prev].slice(0, 200)); // keep last 200 logs
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return (
    <ActivityLogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog(): ActivityLogContextType {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error("useActivityLog must be used within ActivityLogProvider");
  return ctx;
}
