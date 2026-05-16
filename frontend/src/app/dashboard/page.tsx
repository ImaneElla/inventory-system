"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

// Components & Data
import { StatCard } from "@/components/dashboard/StatCard";
import { months, salesData, profitData, topSellers } from "./mockData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("auth") === "true") {
      setAuthorized(true);
      // Fetch real stats
      fetch("http://localhost:8080/api/v1/products/stats")
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Failed to fetch stats", err));
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!authorized || !mounted) {
    return null;
  }

  // Chart configs
  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Sales",
        data: salesData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Net Profit",
        data: profitData,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.06)",
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          boxHeight: 6,
          font: { family: "Inter, sans-serif", size: 12, weight: 'bold' as const },
          color: "var(--muted-foreground)",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
        titleColor: "#1c1c1e",
        bodyColor: "#48484a",
        padding: 12,
        cornerRadius: 16,
        titleFont: { family: "Inter, sans-serif", weight: "bold" as const, size: 14 },
        bodyFont: { family: "Inter, sans-serif", size: 13 },
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (ctx: any) =>
            `  ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} DH`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: "Inter, sans-serif", size: 12, weight: 'normal' as const }, color: "var(--muted-foreground)" },
      },
      y: {
        grid: { color: "var(--border)", lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: {
          font: { family: "Inter, sans-serif", size: 12, weight: 'normal' as const },
          color: "var(--muted-foreground)",
          callback: (v: string | number) => `${Number(v).toLocaleString()} DH`,
        },
      },
    },
  };

  const donutData = {
    labels: topSellers.map((s) => s.name),
    datasets: [
      {
        data: topSellers.map((s) => s.value),
        backgroundColor: topSellers.map((s) => s.color),
        borderWidth: 0,
        hoverOffset: 8,
        borderRadius: 10,
        spacing: 5,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "78%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
        titleColor: "#1c1c1e",
        bodyColor: "#48484a",
        padding: 12,
        cornerRadius: 16,
        usePointStyle: true,
        callbacks: {
          label: (ctx: { parsed: number }) => `  ${ctx.parsed}% of total revenue`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col min-h-full p-4 md:p-8 gap-8">
      {/* ── Page Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Overview</h1>
          <p className="text-[15px] text-muted-foreground mt-1 font-medium">Welcome back — your inventory is looking sharp today.</p>
        </div>
        <Link
          href="/dashboard/ai-assistant"
          className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm text-white shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-linear-to-br from-primary via-primary/90 to-indigo-600"
        >
          <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
          Ask Assistant
        </Link>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Products"
          value={stats?.totalProducts?.toLocaleString() || "..."}
          sub={`${stats?.totalStock?.toLocaleString() || 0} units in stock`}
          trend="up"
          icon={Box}
          color="bg-blue-500"
          shadow="shadow-blue-500/20"
        />
        <StatCard
          label="Inventory Value"
          value={`${stats?.inventoryValue?.toLocaleString() || "0"} DH`}
          sub="Total purchase value"
          trend="up"
          icon={ShoppingCart}
          color="bg-green-500"
          shadow="shadow-green-500/20"
        />
        <StatCard
          label="Expected Profit"
          value={`${stats?.expectedProfit?.toLocaleString() || "0"} DH`}
          sub="Based on current stock"
          trend="up"
          icon={DollarSign}
          color="bg-indigo-500"
          shadow="shadow-indigo-500/20"
        />
        <StatCard
          label="Critical Alerts"
          value={`${stats?.lowStockCount || 0} Items`}
          sub="Low stock levels"
          trend={stats?.lowStockCount > 0 ? "warn" : "up"}
          icon={AlertTriangle}
          color="bg-amber-500"
          shadow="shadow-amber-500/20"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="xl:col-span-2 bg-card/60 backdrop-blur-2xl rounded-[32px] border border-border/40 shadow-2xl shadow-black/5 p-8 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight">Performance Trends</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Growth overview (6 Months)</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
              <TrendingUp size={12} />
              Growth +14.2%
            </div>
          </div>
          <div className="h-[280px] w-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </motion.div>

        {/* Donut Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card/60 backdrop-blur-2xl rounded-[32px] border border-border/40 shadow-2xl shadow-black/5 p-8 flex flex-col gap-6"
        >
          <div>
            <h3 className="text-lg font-black text-foreground tracking-tight">Market Share</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">By revenue contribution</p>
          </div>
          <div className="relative flex items-center justify-center h-[180px]">
            <Doughnut data={donutData} options={donutOptions} />
            <div className="absolute flex flex-col items-center pointer-events-none translate-y-1">
              <p className="text-3xl font-black text-foreground leading-none tracking-tighter">5</p>
              <p className="text-[10px] font-black text-muted-foreground mt-1 uppercase tracking-widest">Sellers</p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {topSellers.map((s) => (
              <div key={s.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full ring-4 ring-background transition-transform group-hover:scale-125" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{s.name}</span>
                </div>
                <span className="text-sm font-black text-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── AI Insights CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-[38px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white overflow-hidden relative group shadow-2xl shadow-primary/20"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #2dd4bf 100%)" }}
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
          <div className="w-16 h-16 rounded-[30%] bg-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500">
            <Sparkles size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Unlock Smart Insights</h3>
            <p className="text-base text-white/80 font-medium max-w-xl">
              Our AI engine is ready to analyze your inventory patterns and provide restock recommendations.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/ai-assistant"
          className="relative z-10 shrink-0 flex items-center gap-2.5 px-8 py-4 bg-white text-primary text-sm font-black rounded-2xl hover:bg-white/90 transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
        >
          Get Started
          <ArrowUpRight size={18} />
        </Link>
      </motion.div>
    </div>
  );
}
