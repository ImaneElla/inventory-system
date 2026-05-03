//DASHBOARD
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
  ArrowDownRight,
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


const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const salesData = [12400, 18900, 14200, 22100, 19600, 25800];
const profitData = [3100, 5200, 3900, 7400, 5800, 8900];

const topSellers = [
  { name: "Laptop", value: 34, color: "#3b82f6" },
  { name: "Mouse", value: 26, color: "#8b5cf6" },
  { name: "Keyboard", value: 18, color: "#10b981" },
  { name: "Monitor", value: 14, color: "#f59e0b" },
  { name: "Others", value: 8, color: "#e5e7eb" },
];

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "warn";
  icon: React.ElementType;
  color: string;
  shadow: string;
}

function StatCard({ label, value, sub, trend, icon: Icon, color, shadow }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-md ${shadow}`}>
          <Icon size={22} className="text-white" strokeWidth={1.75} />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
            trend === "up"
              ? "bg-green-50 text-green-600"
              : trend === "down"
              ? "bg-red-50 text-red-500"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {trend === "up" ? <ArrowUpRight size={13} /> : trend === "down" ? <ArrowDownRight size={13} /> : <AlertTriangle size={13} />}
          {sub}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1c1c1e] tracking-tight">{value}</p>
        <p className="text-xs text-[#1c1c1e]/50 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("auth") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  // Chart configs
  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Sales",
        data: salesData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        borderWidth: 2.5,
        pointRadius: 4,
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
        borderWidth: 2.5,
        pointRadius: 4,
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
          font: { family: "Inter, sans-serif", size: 12 },
          color: "rgba(28,28,30,0.6)",
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "rgba(0,0,0,0.08)",
        borderWidth: 1,
        titleColor: "#1c1c1e",
        bodyColor: "rgba(28,28,30,0.6)",
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: "Inter, sans-serif", weight: "600" as const, size: 13 },
        bodyFont: { family: "Inter, sans-serif", size: 12 },
        callbacks: {
          label: (ctx: { dataset: { label: string }; parsed: { y: number } }) =>
            `  ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} DH`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: "Inter, sans-serif", size: 12 }, color: "rgba(28,28,30,0.4)" },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.04)", lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: {
          font: { family: "Inter, sans-serif", size: 12 },
          color: "rgba(28,28,30,0.4)",
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
        hoverOffset: 6,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "rgba(0,0,0,0.08)",
        borderWidth: 1,
        titleColor: "#1c1c1e",
        bodyColor: "rgba(28,28,30,0.6)",
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: "Inter, sans-serif", weight: "600" as const, size: 13 },
        bodyFont: { family: "Inter, sans-serif", size: 12 },
        callbacks: {
          label: (ctx: { parsed: number }) => `  ${ctx.parsed}% of sales`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col min-h-full p-6 gap-6 bg-[#f5f5f7]">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1c1c1e] tracking-tight">Overview</h1>
          <p className="text-sm text-[#1c1c1e]/50 mt-0.5">Welcome back — here's what's happening</p>
        </div>
        {/* AI Button */}
        <Link
          href="/dashboard/ai-assistant"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-sm text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)" }}
        >
          <Sparkles size={16} strokeWidth={2} />
          Ask AI
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value="248"
          sub="+12 this week"
          trend="up"
          icon={Box}
          color="bg-blue-500"
          shadow="shadow-blue-500/25"
        />
        <StatCard
          label="Total Sales"
          value="25,800 DH"
          sub="+31.6%"
          trend="up"
          icon={ShoppingCart}
          color="bg-green-500"
          shadow="shadow-green-500/25"
        />
        <StatCard
          label="Net Profit"
          value="8,900 DH"
          sub="+53.4%"
          trend="up"
          icon={DollarSign}
          color="bg-purple-500"
          shadow="shadow-purple-500/25"
        />
        <StatCard
          label="Low Stock Alerts"
          value="7 items"
          sub="Needs attention"
          trend="warn"
          icon={AlertTriangle}
          color="bg-amber-500"
          shadow="shadow-amber-500/25"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Line Chart — spans 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[#1c1c1e]">Sales & Profit</p>
              <p className="text-xs text-[#1c1c1e]/45 mt-0.5">Last 6 months</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
              <TrendingUp size={12} />
              All time high
            </span>
          </div>
          <div className="h-[220px]">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Donut Chart — top sellers */}
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 flex flex-col gap-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1c1c1e]">Top Sellers</p>
            <p className="text-xs text-[#1c1c1e]/45 mt-0.5">By revenue share</p>
          </div>
          <div className="relative flex items-center justify-center h-[160px]">
            <Doughnut data={donutData} options={donutOptions} />
            {/* Center label */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <p className="text-xl font-bold text-[#1c1c1e] leading-none">5</p>
              <p className="text-[10px] text-[#1c1c1e]/40 mt-0.5 font-medium">Products</p>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-2">
            {topSellers.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-[#1c1c1e]/70 font-medium">{s.name}</span>
                </div>
                <span className="text-xs font-semibold text-[#1c1c1e]">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Flow CTA ── */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between gap-4 text-white overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 60%, #10b981 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 right-32 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Sparkles size={24} className="text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[17px] font-semibold tracking-tight">AI-Powered Insights</p>
            <p className="text-sm text-white/70 mt-0.5">
              Ask your assistant to analyse sales trends, forecast demand, or flag anomalies.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/ai-assistant"
          className="relative z-10 shrink-0 flex items-center gap-2 px-5 py-3 bg-white text-[#1c1c1e] text-sm font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-black/10 active:scale-[0.98]"
        >
          <Sparkles size={15} className="text-purple-500" strokeWidth={2.5} />
          Open AI Assistant
        </Link>
      </div>
    </div>
  );
}
