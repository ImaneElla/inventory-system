"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@/lib/react-query-custom";
import {
  Box,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Maximize2,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  InventoryProfitTrendChart,
  MostActiveDayChart,
  RepeatCustomerGauge,
} from "@/components/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboardStats, fetchSalesDashboardAnalytics, resolveImageUrl } from "@/lib/api";

//  Toggle this to always show impressive demo chart data instead of real API data , Temp for presentation purposes HAHA
const DEMO_MODE = true;

//  Demo fallback data 
const DEMO_REVENUE_TREND = [
  { label: "Jan", inventoryValue: 85000, expectedProfit: 15200 },
  { label: "Feb", inventoryValue: 92000, expectedProfit: 18600 },
  { label: "Mar", inventoryValue: 78000, expectedProfit: 16400 },
  { label: "Apr", inventoryValue: 105000, expectedProfit: 22800 },
  { label: "May", inventoryValue: 98000, expectedProfit: 21200 },
  { label: "Jun", inventoryValue: 125000, expectedProfit: 28600 },
  { label: "Jul", inventoryValue: 112000, expectedProfit: 25400 },
  { label: "Aug", inventoryValue: 138000, expectedProfit: 31800 },
  { label: "Sep", inventoryValue: 145000, expectedProfit: 35200 },
  { label: "Oct", inventoryValue: 132000, expectedProfit: 30600 },
  { label: "Nov", inventoryValue: 158000, expectedProfit: 38400 },
  { label: "Dec", inventoryValue: 175000, expectedProfit: 42800 },
];

const DEMO_ACTIVITY_BY_DAY = [
  { day: "Mon", count: 245 },
  { day: "Tue", count: 198 },
  { day: "Wed", count: 312 },
  { day: "Thu", count: 278 },
  { day: "Fri", count: 425 },
  { day: "Sat", count: 512 },
  { day: "Sun", count: 389 },
];

const DEMO_TOP_PRODUCTS = [
  { productId: 1, name: "Premium Headphones", sold: 1240, revenue: 124000 },
  { productId: 2, name: "Wireless Mouse", sold: 892, revenue: 44600 },
  { productId: 3, name: "USB-C Hub", sold: 756, revenue: 37800 },
  { productId: 4, name: "Mechanical Keyboard", sold: 634, revenue: 95100 },
];

const DEMO_PRODUCT_STATS = {
  totalProducts: 50,
  totalStock: 1240,
  inventoryValue: 175000,
  expectedProfit: 95600,
  lowStockCount: 3,
};

const DEMO_SALES_ANALYTICS = {
  totalRevenue: 524000,
  totalOrders: 1250,
  repeatCustomerRate: 68,
};

//  Skeleton helpers 
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-muted/50 rounded-2xl ${className ?? ""}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col min-h-full p-4 md:p-8 gap-6 bg-[#f4f7fe] dark:bg-background">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Shimmer className="h-9 w-44" />
          <Shimmer className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-9 w-28 rounded-2xl" />
          <Shimmer className="h-10 w-36 rounded-2xl" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-card/60 backdrop-blur-2xl rounded-[28px] border border-border/40 shadow-xl shadow-black/5 p-6 flex flex-col gap-6"
          >
            <div className="flex items-start justify-between">
              <Shimmer className="w-12 h-12 rounded-2xl" />
              <Shimmer className="w-16 h-6 rounded-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <Shimmer className="h-8 w-28" />
              <Shimmer className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white/90 dark:bg-card/90 rounded-3xl p-6 shadow-sm">
          <Shimmer className="h-6 w-52 mb-2" />
          <Shimmer className="h-3 w-72 mb-6" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Shimmer className="h-20 rounded-3xl" />
            <Shimmer className="h-20 rounded-3xl" />
          </div>
          <Shimmer className="h-72 rounded-2xl" />
        </div>
        <div className="bg-white/90 dark:bg-card/90 rounded-3xl p-6 shadow-sm">
          <Shimmer className="h-6 w-40 mb-2" />
          <Shimmer className="h-3 w-28 mb-6" />
          <Shimmer className="h-60 rounded-2xl" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white/90 dark:bg-card/90 rounded-3xl p-6 shadow-sm">
          <Shimmer className="h-6 w-32 mb-2" />
          <Shimmer className="h-3 w-48 mb-5" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
              <div className="flex items-center gap-3">
                <Shimmer className="w-9 h-9 rounded-xl" />
                <Shimmer className="h-4 w-28" />
              </div>
              <Shimmer className="h-4 w-12" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-3 bg-white/90 dark:bg-card/90 rounded-3xl p-6 shadow-sm">
          <Shimmer className="h-6 w-44 mb-2" />
          <Shimmer className="h-3 w-28 mb-4" />
          <Shimmer className="h-48 rounded-2xl" />
        </div>
        <Shimmer className="lg:col-span-4 rounded-3xl h-64" />
      </div>
    </div>
  );
}

//  Main page 
export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("auth") === "true") {
      setAuthorized(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  const { data: productStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-product-stats"],
    queryFn: fetchDashboardStats,
    enabled: authorized,
  });

  const { data: salesAnalytics, isLoading: salesLoading } = useQuery({
    queryKey: ["dashboard-sales-analytics"],
    queryFn: fetchSalesDashboardAnalytics,
    enabled: authorized,
  });

  // Show skeleton while mounting or auth is not yet confirmed
  if (!mounted || !authorized) {
    return <DashboardSkeleton />;
  }

  // Use mock data if DEMO_MODE is enabled, otherwise fall back to API data
  const revenueTrend = DEMO_MODE 
    ? DEMO_REVENUE_TREND
    : salesAnalytics?.revenueTrend?.length
      ? salesAnalytics.revenueTrend.map(
          (p: { label: string; revenue: number }) => ({
            label: p.label,
            revenue: Number(p.revenue ?? 0),
          })
        )
      : DEMO_REVENUE_TREND;

  const activityByDay = DEMO_MODE
    ? DEMO_ACTIVITY_BY_DAY
    : salesAnalytics?.activityByDay?.map((d: { day: string; count: number }) => ({
      day: d.day,
      count: Number(d.count ?? 0),
    })) ?? [];

  const topProducts = salesAnalytics?.topProducts ?? [];

  const inventoryValue = DEMO_MODE 
    ? DEMO_PRODUCT_STATS.inventoryValue
    : Number(productStats?.inventoryValue ?? 0);

  const expectedProfit = DEMO_MODE
    ? DEMO_PRODUCT_STATS.expectedProfit
    : Number(productStats?.expectedProfit ?? 0);

  const totalRevenue = DEMO_MODE
    ? DEMO_SALES_ANALYTICS.totalRevenue
    : Number(salesAnalytics?.totalRevenue ?? 0);

  const totalOrders = DEMO_MODE
    ? DEMO_SALES_ANALYTICS.totalOrders
    : Number(salesAnalytics?.totalOrders ?? 0);

  const repeatRate = DEMO_MODE
    ? DEMO_SALES_ANALYTICS.repeatCustomerRate
    : Number(salesAnalytics?.repeatCustomerRate ?? 0);

  return (
    <div className="flex flex-col min-h-full p-4 md:p-8 gap-6 bg-[#f4f7fe] dark:bg-background">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Real-time inventory &amp; sales overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-muted-foreground px-4 py-2 cursor-default">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <Link
            href="/dashboard/ai-assistant"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm text-white btn-gradient shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform"
          >
            <Sparkles size={16} />
            AI Assistant
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={(DEMO_MODE ? DEMO_PRODUCT_STATS.totalProducts : productStats?.totalProducts)?.toLocaleString() ?? "—"}
          sub={`${(DEMO_MODE ? DEMO_PRODUCT_STATS.totalStock : productStats?.totalStock)?.toLocaleString() ?? 0} units in stock`}
          trend="up"
          icon={Box}
          color="bg-blue-500"
          shadow="shadow-blue-500/20"
        />
        <StatCard
          label="Total Revenue"
          value={`${totalRevenue.toLocaleString()} DH`}
          sub={`${totalOrders} completed orders`}
          trend="up"
          icon={DollarSign}
          color="bg-green-500"
          shadow="shadow-green-500/20"
        />
        <StatCard
          label="Inventory Value"
          value={`${(DEMO_MODE ? DEMO_PRODUCT_STATS.inventoryValue : productStats?.inventoryValue)?.toLocaleString() ?? "0"} DH`}
          sub="Purchase value in stock"
          trend="up"
          icon={ShoppingCart}
          color="bg-indigo-500"
          shadow="shadow-indigo-500/20"
        />
        <StatCard
          label="Critical Alerts"
          value={`${DEMO_MODE ? DEMO_PRODUCT_STATS.lowStockCount : productStats?.lowStockCount ?? 0}`}
          sub="Low stock items"
          trend={(DEMO_MODE ? DEMO_PRODUCT_STATS.lowStockCount : productStats?.lowStockCount ?? 0) > 0 ? "warn" : "up"}
          icon={AlertTriangle}
          color="bg-red-500"
          shadow="shadow-red-500/20"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 rounded-3xl border-0 shadow-sm bg-white/90 dark:bg-card/90 backdrop-blur-xl">
            <CardHeader className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg font-black">Inventory &amp; Profit Trend</CardTitle>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Monthly inventory value and profit overview</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Inventory value
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Profit
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 pt-7 hover:shadow-lg hover:shadow-blue-200/40 transition-all"
                >
                  <p className="text-xs uppercase tracking-[0.15em] text-blue-600 font-black mb-1.5">Inventory value</p>
                  <p className="text-3xl font-black text-blue-700">{(revenueTrend[revenueTrend.length - 1]?.inventoryValue || inventoryValue).toLocaleString()} DH</p>
        
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 pt-7 hover:shadow-lg hover:shadow-emerald-200/40 transition-all relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-emerald-600 font-black mb-1.5">Expected profit</p>
                      <p className="text-3xl font-black text-emerald-700">{(revenueTrend[revenueTrend.length - 1]?.expectedProfit || expectedProfit).toLocaleString()} DH</p>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full text-[10px] font-black border border-emerald-500/20">
                      <TrendingUp size={12} />
                      +12% vs last month
                    </div>
                  </div>
                </motion.div>
              </div>
              <InventoryProfitTrendChart
                data={revenueTrend}
              />
            </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm bg-white/90 dark:bg-card/90 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-black">Most Sellers</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Top products</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                            <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th className="text-center py-3 px-3 w-10">#</th>
                    <th className="text-left py-3 px-3">Product</th>
                    <th className="text-right py-3 px-3">Sold</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 5).map(
                    (
                      p: {
                        productId: number;
                        name: string;
                        sold: number;
                        revenue: number;
                        imageUrl?: string;
                      },
                      i: number
                    ) => {
                      const imgSrc = resolveImageUrl(p.imageUrl);
                            const rankColors = [
                        "text-yellow-500", 
                        "text-amber-500",   
                        "text-orange-500",  
                        "text-muted-foreground",
                        "text-muted-foreground",
                        "text-muted-foreground",
                      ];
                      return (
                        <tr
                          key={p.productId ?? i}
                          className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                        >
                    {/* Rank number */}
                          <td className="py-4 px-3 text-center">
                            <span className={`text-base font-black ${rankColors[i]}`}>
                              {i + 1}
                            </span>
                          </td>
                          {/* Product */}
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-muted overflow-hidden shrink-0">
                                {imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                           <div className="w-full h-full flex items-center justify-center text-sm font-black text-primary">             
                                {p.name?.charAt(0)}
                                  </div>
                                )}
                              </div>
       <span className="font-bold truncate max-w-[90px] text-sm">{p.name}</span>                            </div>
                          </td>
        <td className="text-right py-4 px-3 font-bold text-sm">{p.sold}</td>
                          <td className="text-right py-4 px-4 font-black text-emerald-600 text-sm">
                            {Number(p.revenue).toLocaleString()} DH
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 rounded-3xl border-0 shadow-sm bg-white/90 dark:bg-card/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-black">Most Day Active</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Sales by weekday</p>
          </CardHeader>
          <CardContent>
            {activityByDay.length > 0 ? (
              <MostActiveDayChart data={activityByDay} />
            ) : (
              <div className="h-55 flex items-center justify-center text-sm text-muted-foreground">
                No activity data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-3xl border-0 shadow-sm bg-white/90 dark:bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg font-black">Repeat Customer Rate</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Returning clients</p>
          </CardHeader>
          <CardContent>
            <RepeatCustomerGauge rate={repeatRate} />
            <p className="text-center text-[11px] text-muted-foreground font-medium mt-2">
              {repeatRate >= 50 ? "On track for strong retention" : "Encourage repeat purchases"}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 rounded-3xl border-0 shadow-sm overflow-hidden relative min-h-70 bg-linear-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] text-white">
          <CardHeader className="relative z-10 flex flex-row items-start justify-between">
            <CardTitle className="text-lg font-black text-white">AI Assistant</CardTitle>
            <Link
              href="/dashboard/ai-assistant"
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Maximize2 size={16} />
            </Link>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col justify-end pb-8">
            <p className="text-sm text-white/80 font-medium mb-6 max-w-55">
             Get smart restock tips and sales insights powered by your live inventory data.
            </p>
            <Link
              href="/dashboard/ai-assistant"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-2xl text-sm font-black w-fit hover:bg-white/90 transition-colors"
            >
              Open Emexa
              <ArrowUpRight size={16} />
            </Link>
          </CardContent>
          <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none " />
          <div>
            <div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-linear-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/30 shadow-2xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="flex flex-col gap-2 mb-2"
            >
              <a href="/dashboard/products" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-card border border-border shadow-lg rounded-2xl text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer whitespace-nowrap">
                <Box size={16} className="text-primary" />
                Quick Add Product
              </a>
              <a href="/dashboard/sales" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-card border border-border shadow-lg rounded-2xl text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer whitespace-nowrap">
                <DollarSign size={16} className="text-emerald-500" />
                New Sale
              </a>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-14 h-14 rounded-full btn-gradient shadow-xl shadow-primary/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <motion.div
            animate={{ rotate: isFabOpen ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Plus size={24} />
          </motion.div>
        </button>
      </div>
    </div>
  );
}
