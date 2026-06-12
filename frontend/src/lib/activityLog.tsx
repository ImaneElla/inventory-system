"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

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
  refreshLogs: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | null>(null);

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  const fetchLogs = useCallback(async () => {
    try {
      const userId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;
      const headers: Record<string, string> = {};
      if (userId) headers["X-Current-User-Id"] = userId;

      const res = await fetch("/api/v1/activity-logs", { headers });
      if (res.ok) {
        const data = await res.json();
        const parsed = data.map((entry: any) => ({
          ...entry,
          when: new Date(entry.when),
        }));
        setLogs(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(async (what: string, icon: LogIcon = "system") => {
    try {
      const userId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (userId) headers["X-Current-User-Id"] = userId;

      const res = await fetch("/api/v1/activity-logs", {
        method: "POST",
        headers,
        body: JSON.stringify({ what, icon }),
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error("Failed to add activity log:", err);
    }
  }, [fetchLogs]);

  const clearLogs = useCallback(async () => {
    try {
      const userId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;
      const headers: Record<string, string> = {};
      if (userId) headers["X-Current-User-Id"] = userId;

      const res = await fetch("/api/v1/activity-logs", {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      console.error("Failed to clear activity logs:", err);
    }
  }, []);

  return (
    <ActivityLogContext.Provider value={{ logs, addLog, clearLogs, refreshLogs: fetchLogs }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog(): ActivityLogContextType {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error("useActivityLog must be used within ActivityLogProvider");
  return ctx;
}
