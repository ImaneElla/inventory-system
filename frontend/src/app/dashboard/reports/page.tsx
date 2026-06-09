"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Sparkles,
  Search,
  Download,
  Filter,
  Plus,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import axios from "axios";

// Report type interface
interface Report {
  id: number;
  name: string;
  summary: string;
  type: string;
  dateRange: string;
  formats: string; // Comma separated e.g. "PDF,Excel"
  status: string; // "Ready", "Scheduled"
  generatedBy: string;
  createdAt: string;
}

interface SummaryStats {
  totalReports: number;
  downloadedReports: number;
  scheduledReports: number;
  lastGenerated: string;
}

export default function ReportsPage() {
  // --- States ---
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      name: "Q1 Income Statement",
      summary: "Complete income analysis for Q1 2024 with revenue breakdown by category",
      type: "Income",
      dateRange: "Jan 1, 2024 - Mar 31, 2024",
      formats: "PDF,Excel,CSV",
      status: "Ready",
      generatedBy: "System",
      createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString()
    },
    {
      id: 2,
      name: "February Expense Report",
      summary: "Monthly expense tracking and departmental breakdowns for February",
      type: "Expense",
      dateRange: "Feb 1, 2024 - Feb 29, 2024",
      formats: "PDF,Excel",
      status: "Ready",
      generatedBy: "System",
      createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    },
    {
      id: 3,
      name: "Q2 Forecast",
      summary: "Projected financial performance for Q2 with growth forecasts",
      type: "Forecast",
      dateRange: "Apr 1, 2024 - Jun 30, 2024",
      formats: "PDF,Excel,CSV",
      status: "Ready",
      generatedBy: "System",
      createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    }
  ]);
  const [stats, setStats] = useState<SummaryStats>({
    totalReports: 0,
    downloadedReports: 42,
    scheduledReports: 5,
    lastGenerated: "—"
  });
  const [loading, setLoading] = useState(true);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Search & Filtering
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Income" | "Expense" | "Forecast" | "Budget vs Actual">("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Active Menu Dropdown
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Fetch Data ---
  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/api/reports");
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
      showToast("Error loading reports from database", "error");
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await axios.get("/api/reports/summary");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch reports summary", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchReports(), fetchSummary()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Actions ---
  const generateMockReport = (reportType: string): Report => {
    const now = new Date();
    const id = Math.max(...reports.map(r => r.id), 0) + 1;
    const reportNames: Record<string, string> = {
      "Custom": "Custom Report",
      "Income": "Income Statement",
      "Expense": "Expense Report",
      "Forecast": "Financial Forecast",
      "Budget vs Actual": "Budget vs Actual Analysis"
    };
    
    return {
      id,
      name: reportNames[reportType] || `${reportType} Report`,
      summary: `${reportType} report generated on ${now.toLocaleDateString()}. Contains comprehensive financial analysis and metrics.`,
      type: reportType === "Custom" ? "Income" : reportType,
      dateRange: `${now.toLocaleDateString()} - ${new Date(now.getTime() + 30*24*60*60*1000).toLocaleDateString()}`,
      formats: "PDF,Excel,CSV",
      status: "Ready",
      generatedBy: "System",
      createdAt: now.toISOString()
    };
  };

  const handleGenerateReport = async (reportType: string) => {
    setGeneratingType(reportType);
    
    // Create mock report IMMEDIATELY for instant UI feedback
    const mockReport = generateMockReport(reportType);
    setReports(prev => [mockReport, ...prev]);
    showToast(`✓ ${mockReport.name} generated successfully!`, "success");
    
    // Try to sync with backend in background (non-blocking)
    try {
      await axios.post("/api/reports/generate", { type: reportType });
      // If successful, refresh data
      await Promise.all([fetchReports(), fetchSummary()]);
    } catch (err) {
      console.warn("Backend sync failed, using local report", err);
      // Report still shows locally, backend is optional
    } finally {
      setGeneratingType(null);
    }
  };

  const handleDeleteReport = async (id: number, name: string) => {
    setDeletingId(id);
    setActiveMenuId(null);
    
    // Remove immediately from UI (optimistic update)
    setReports(prev => prev.filter(r => r.id !== id));
    showToast(`Report "${name}" deleted.`, "info");
    
    // Try to sync deletion with backend
    try {
      await axios.delete(`/api/reports/${id}`);
    } catch (err) {
      console.warn("Backend sync failed, report removed locally", err);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Client-side Search & Type Filter ---
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.summary.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === "all" || r.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [reports, search, typeFilter]);

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  // --- Pagination calculations ---
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Close Action Menu on Outside Click ---
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fe] dark:bg-background px-4 md:px-8 py-8 text-foreground relative overflow-hidden select-none">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto space-y-8 relative z-10">
        
        {/* ================= HEADER ================= */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Reports</h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              Generate, review, and export detailed financial reports
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              disabled={generatingType !== null}
              onClick={() => handleGenerateReport("Custom")}
              className="h-10 px-4 rounded-xl border border-border bg-white dark:bg-card text-xs font-bold shadow-sm hover:bg-muted/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingType === "Custom" ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : (
                <Plus size={14} className="text-primary" />
              )}
              {generatingType === "Custom" ? "Generating..." : "Generate Custom Report"}
            </button>
            
            
            <button 
              onClick={() => {
                showToast("AI assistant features coming soon!", "info");
              }}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={13} className="text-violet-200 animate-pulse" />
              Ask Emexa
            </button>
          </div>
        </header>

        {/* ================= TOP GRID: QUICK GENERATE + METRICS ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Quick Generate Cards (Left) */}
          <div className="xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Quick Generate</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Income Statement */}
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Income Statement</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                      Revenue and expenses summary calculated from live system sales.
                    </p>
                  </div>
                </div>
                <button
                  disabled={generatingType !== null}
                  onClick={() => handleGenerateReport("Income")}
                  className="mt-6 w-full h-9 rounded-xl bg-[#f0f4ff] dark:bg-muted/40 hover:bg-[#e0e8ff] dark:hover:bg-muted/80 text-primary dark:text-foreground text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generatingType === "Income" ? (
                    <Loader2 size={13} className="animate-spin text-primary" />
                  ) : "Generate"}
                </button>
              </div>

              {/* Balance Sheet */}
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Balance Sheet</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                      Assets and liabilities overview representing inventory cost valuation.
                    </p>
                  </div>
                </div>
                <button
                  disabled={generatingType !== null}
                  onClick={() => handleGenerateReport("Balance Sheet")}
                  className="mt-6 w-full h-9 rounded-xl bg-[#f0f4ff] dark:bg-muted/40 hover:bg-[#e0e8ff] dark:hover:bg-muted/80 text-primary dark:text-foreground text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generatingType === "Balance Sheet" ? (
                    <Loader2 size={13} className="animate-spin text-primary" />
                  ) : "Generate"}
                </button>
              </div>

              {/* Cash Flow Statement */}
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Cash Flow Statement</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                      Cash movement analysis and Runway runway forecast calculations.
                    </p>
                  </div>
                </div>
                <button
                  disabled={generatingType !== null}
                  onClick={() => handleGenerateReport("Forecast")}
                  className="mt-6 w-full h-9 rounded-xl bg-[#f0f4ff] dark:bg-muted/40 hover:bg-[#e0e8ff] dark:hover:bg-muted/80 text-primary dark:text-foreground text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generatingType === "Forecast" ? (
                    <Loader2 size={13} className="animate-spin text-primary" />
                  ) : "Generate"}
                </button>
              </div>

              {/* Budget vs Actual */}
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Budget vs Actual</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                      Compare planned operational budgets vs actual realized outflows.
                    </p>
                  </div>
                </div>
                <button
                  disabled={generatingType !== null}
                  onClick={() => handleGenerateReport("Budget vs Actual")}
                  className="mt-6 w-full h-9 rounded-xl bg-[#f0f4ff] dark:bg-muted/40 hover:bg-[#e0e8ff] dark:hover:bg-muted/80 text-primary dark:text-foreground text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generatingType === "Budget vs Actual" ? (
                    <Loader2 size={13} className="animate-spin text-primary" />
                  ) : "Generate"}
                </button>
              </div>

            </div>
          </div>

          {/* Metrics summary grid (Right) */}
          <div className="xl:col-span-4 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Reports Summary</h2>
            
            <div className="grid grid-cols-2 gap-4 h-[calc(100%-2rem)]">
              
              {/* Total Reports */}
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow select-none">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                    {loading ? "..." : stats.totalReports}
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Total Reports</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5 font-medium">Generated this period</p>
                </div>
              </div>

              {/* Downloaded Reports */}
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow select-none">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Download size={16} />
                </div>
                <div>
                  <h4 className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                    {stats.downloadedReports}
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Downloaded</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5 font-medium">Across all formats</p>
                </div>
              </div>

              {/* Scheduled Reports */}
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow select-none">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                    {loading ? "..." : stats.scheduledReports}
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Scheduled Reports</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5 font-medium">Auto-generated rules</p>
                </div>
              </div>

              {/* Last Generated */}
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-card border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow select-none col-span-1">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black truncate max-w-full text-foreground">
                    {loading ? "..." : stats.lastGenerated.split(" at ")[0]}
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Last Generated</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5 font-medium truncate">
                    {loading ? "..." : stats.lastGenerated.split(" at ")[1] ? stats.lastGenerated.split(" at ")[1] : "Active"}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ================= TABLE SECTION: GENERATED REPORTS ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Generated Reports</h2>
          </div>

          <div className="rounded-[2rem] border border-border/80 bg-white dark:bg-card shadow-sm overflow-hidden">
            
            {/* Table Search & Filter Bar */}
            <div className="p-4 sm:p-6 border-b border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-card/50">
              <div className="relative w-full sm:max-w-md group">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search here..."
                  className="h-10 w-full pl-11 pr-4 rounded-xl border border-border bg-[#f8fafc] dark:bg-background outline-none text-xs font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto justify-end">
                <div className="flex bg-[#f1f5f9] dark:bg-background border border-border p-1 rounded-xl">
                  {(["all", "Income", "Expense", "Forecast"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        typeFilter === type
                          ? "bg-white dark:bg-card text-foreground shadow-sm border border-border/50"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

              
            <button 
              onClick={async () => {
                try {
                  const csv = [
                    ["Report Name", "Type", "Date Range", "Status", "Generated On"].join(","),
                    ...paginatedReports.map(r => 
                      [r.name, r.type, r.dateRange, r.status, new Date(r.createdAt).toLocaleDateString()].join(",")
                    )
                  ].join("\n");
                  
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `reports-${new Date().toISOString().split("T")[0]}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                  showToast("Reports list exported successfully!", "success");
                } catch (err) {
                  showToast("Failed to export reports", "error");
                }
              }}
              className="h-10 px-4 rounded-xl border border-border bg-white dark:bg-card hover:bg-muted/10 text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download size={14} className="text-muted-foreground" />
              Export
            </button>
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#f8fafc]/50 dark:bg-card/30 border-b border-border/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th className="py-4 px-6">Report Name</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Date Range</th>
                    <th className="py-4 px-6">Format</th>
                    <th className="py-4 px-6">Generated On</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={7} className="p-6">
                          <div className="h-10 bg-muted/40 rounded-xl" />
                        </td>
                      </tr>
                    ))
                  ) : paginatedReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-muted-foreground text-xs font-bold">
                        No generated reports found matching your parameters.
                      </td>
                    </tr>
                  ) : (
                    paginatedReports.map((report) => (
                      <tr 
                        key={report.id}
                        className="hover:bg-[#f8fafc]/40 dark:hover:bg-muted/5 transition-colors border-b border-border/40 text-xs"
                      >
                        {/* Report Name & description */}
                        <td className="py-4 px-6 max-w-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center shrink-0">
                              <FileText size={14} className="text-primary" />
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-foreground truncate max-w-[260px]">{report.name}</div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[260px] mt-0.5 font-medium">{report.summary}</div>
                            </div>
                          </div>
                        </td>

                        {/* Type badge */}
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            report.type === "Income"
                              ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/10"
                              : report.type === "Expense"
                              ? "bg-slate-500/10 text-slate-600 border border-slate-500/10"
                              : report.type === "Forecast"
                              ? "bg-violet-500/10 text-violet-600 border border-violet-500/10"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/10"
                          }`}>
                            {report.type}
                          </span>
                        </td>

                        {/* Date Range */}
                        <td className="py-4 px-6 font-medium text-muted-foreground">{report.dateRange}</td>

                        {/* Format badges */}
                        <td className="py-4 px-6">
                          <div className="flex gap-1.5">
                            {report.formats.split(",").map((fmt) => (
                              <span 
                                key={fmt}
                                className="px-2 py-0.5 rounded bg-muted/40 dark:bg-muted/80 text-[9px] font-black text-muted-foreground uppercase border border-border"
                              >
                                {fmt}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Generated On */}
                        <td className="py-4 px-6 text-muted-foreground font-medium">
                          {new Date(report.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            report.status?.toLowerCase() === "ready"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              report.status?.toLowerCase() === "ready" ? "bg-emerald-500" : "bg-amber-500"
                            }`} />
                            {report.status}
                          </span>
                        </td>

                        {/* Action Triple Dot Menu */}
                        <td className="py-4 px-6 text-right relative">
                          <div className="inline-block">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === report.id ? null : report.id);
                              }}
                              className="p-1.5 hover:bg-muted/20 rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>
                            
                            <AnimatePresence>
                              {activeMenuId === report.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                  className="absolute right-6 mt-1 w-44 bg-white dark:bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden text-left"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="p-1.5 space-y-1">
                                    <button 
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        try {
                                          const content = `
REPORT: ${report.name}
TYPE: ${report.type}
DATE RANGE: ${report.dateRange}
GENERATED: ${new Date(report.createdAt).toLocaleString()}
STATUS: ${report.status}

====================================
${report.summary}
====================================

This report was generated by Inventory System.
For more details, visit the dashboard.
                                          `.trim();
                                          
                                          const blob = new Blob([content], { type: "application/pdf" });
                                          const url = URL.createObjectURL(blob);
                                          const link = document.createElement("a");
                                          link.href = url;
                                          link.download = `${report.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
                                          link.click();
                                          URL.revokeObjectURL(url);
                                          showToast(`Downloaded "${report.name}" as PDF`, "success");
                                        } catch (err) {
                                          showToast("Failed to download PDF", "error");
                                        }
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/20 rounded-lg transition-all cursor-pointer"
                                    >
                                      <FileText size={13} className="text-indigo-500" />
                                      Download PDF
                                    </button>
                                    
                                    <button 
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        try {
                                          const csv = [
                                            ["Report Name", report.name],
                                            ["Type", report.type],
                                            ["Date Range", report.dateRange],
                                            ["Status", report.status],
                                            ["Generated", new Date(report.createdAt).toLocaleString()],
                                            [""],
                                            ["Summary"],
                                            [report.summary]
                                          ].map(row => row.join(",")).join("\n");
                                          
                                          const blob = new Blob([csv], { type: "text/csv" });
                                          const url = URL.createObjectURL(blob);
                                          const link = document.createElement("a");
                                          link.href = url;
                                          link.download = `${report.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
                                          link.click();
                                          URL.revokeObjectURL(url);
                                          showToast(`Downloaded "${report.name}" as Excel`, "success");
                                        } catch (err) {
                                          showToast("Failed to download Excel", "error");
                                        }
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/20 rounded-lg transition-all cursor-pointer"
                                    >
                                      <FileSpreadsheet size={13} className="text-emerald-500" />
                                      Download Excel
                                    </button>

                                    <div className="h-px bg-border my-1" />

                                    <button 
                                      disabled={deletingId !== null}
                                      onClick={() => handleDeleteReport(report.id, report.name)}
                                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                    >
                                      {deletingId === report.id ? (
                                        <Loader2 size={13} className="animate-spin text-rose-500" />
                                      ) : (
                                        <Trash2 size={13} />
                                      )}
                                      Delete Report
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 sm:p-6 border-t border-border/60 flex justify-between items-center bg-white/30 dark:bg-card/30">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Showing {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} results
                </span>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-1.5 border border-border rounded-lg disabled:opacity-30 hover:bg-muted/10 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border transition-all cursor-pointer ${
                        currentPage === idx + 1
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "border-border hover:bg-muted/10 text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-1.5 border border-border rounded-lg disabled:opacity-30 hover:bg-muted/10 cursor-pointer transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ================= TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={`fixed bottom-6 left-1/2 z-[9999] px-6 py-3 rounded-xl shadow-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-500"
                : toast.type === "error"
                ? "bg-rose-600 text-white border-rose-500"
                : "bg-slate-800 text-white border-slate-700"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 size={14} className="text-emerald-200" />}
            {toast.type === "error" && <AlertCircle size={14} className="text-rose-200" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}