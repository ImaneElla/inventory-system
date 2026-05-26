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
} from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  InventoryProfitTrendChart,
  MostActiveDayChart,
  RepeatCustomerGauge,
} from "@/components/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboardStats, fetchSalesDashboardAnalytics } from "@/lib/api";
const BACKEND = "http://127.0.0.1:8080";

export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("auth") === "true") {
      setAuthorized(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  const { data: productStats } = useQuery({
    queryKey: ["dashboard-product-stats"],
    queryFn: fetchDashboardStats,
    enabled: authorized,
  });

  const { data: salesAnalytics } = useQuery({
    queryKey: ["dashboard-sales-analytics"],
    queryFn: fetchSalesDashboardAnalytics,
    enabled: authorized,
  });

  if (!authorized || !mounted) return null;

  const revenueTrend =
    salesAnalytics?.revenueTrend?.map((p: { label: string; revenue: number }) => ({
      label: p.label,
      revenue: Number(p.revenue ?? 0),
    })) ?? [];

  const activityByDay =
    salesAnalytics?.activityByDay?.map((d: { day: string; count: number }) => ({
      day: d.day,
      count: Number(d.count ?? 0),
    })) ?? [];

  const inventoryValue = Number(productStats?.inventoryValue ?? 0);
  const expectedProfit = Number(productStats?.expectedProfit ?? 0);

  const topProducts = salesAnalytics?.topProducts ?? [];
  const totalRevenue = Number(salesAnalytics?.totalRevenue ?? 0);
  const totalOrders = Number(salesAnalytics?.totalOrders ?? 0);
  const repeatRate = Number(salesAnalytics?.repeatCustomerRate ?? 0);

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
            Real-time inventory & sales overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground bg-white dark:bg-card px-4 py-2 rounded-2xl border border-border/50 shadow-sm">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <Link
            href="/dashboard/ai-assistant"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm text-white bg-primary shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform"
          >
            <Sparkles size={16} />
            AI Assistant
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={productStats?.totalProducts?.toLocaleString() ?? "—"}
          sub={`${productStats?.totalStock?.toLocaleString() ?? 0} units in stock`}
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
          color="bg-indigo-500"
          shadow="shadow-indigo-500/20"
        />
        <StatCard
          label="Inventory Value"
          value={`${productStats?.inventoryValue?.toLocaleString() ?? "0"} DH`}
          sub="Purchase value in stock"
          trend="up"
          icon={ShoppingCart}
          color="bg-emerald-500"
          shadow="shadow-emerald-500/20"
        />
        <StatCard
          label="Critical Alerts"
          value={`${productStats?.lowStockCount ?? 0}`}
          sub="Low stock items"
          trend={(productStats?.lowStockCount ?? 0) > 0 ? "warn" : "up"}
          icon={AlertTriangle}
          color="bg-amber-500"
          shadow="shadow-amber-500/20"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 rounded-3xl border-0 shadow-sm bg-white/90 dark:bg-card/90 backdrop-blur-xl">
            <CardHeader className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg font-black">Inventory & Profit Trend</CardTitle>
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
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-3xl border border-blue-100 bg-blue-50/80 p-4">
                  <p className="text-2xl font-black text-blue-700">{inventoryValue.toLocaleString()} DH</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600 font-black mt-2">Inventory value</p>
                </div>
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <p className="text-2xl font-black text-emerald-700">{expectedProfit.toLocaleString()} DH</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-black mt-2">Expected profit</p>
                </div>
              </div>
              {revenueTrend.length > 0 ? (
                <InventoryProfitTrendChart
                  data={revenueTrend}
                  inventoryValue={inventoryValue}
                  expectedProfit={expectedProfit}
                />
              ) : (
                <div className="h-75 flex items-center justify-center text-sm text-muted-foreground">
                  No trend data available yet.
                </div>
              )}
            </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm bg-white/90 dark:bg-card/90 backdrop-blur-xl">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 rounded-3xl border-0 shadow-sm bg-white/90 dark:bg-card/90 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-black">Most Sellers</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Top products by units sold</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th className="text-left py-3 px-6">Product</th>
                    <th className="text-right py-3 px-3">Sold</th>
                    <th className="text-right py-3 px-6">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-muted-foreground text-sm px-6">
                        No sales yet
                      </td>
                    </tr>
                  ) : (
                    topProducts.map(
                      (
                        p: {
                          productId: number;
                          name: string;
                          sold: number;
                          revenue: number;
                          imageUrl?: string;
                        },
                        i: number
                      ) => (
                        <tr
                          key={p.productId ?? i}
                          className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="w-9 h-9 rounded-xl bg-muted overflow-hidden shrink-0">
                                  {p.imageUrl ? (
                                    <img
                                      src={
                                        p.imageUrl.startsWith("http")
                                          ? p.imageUrl
                                          : `${BACKEND}/uploads/${p.imageUrl}`
                                      }
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-primary">
                                      {p.name?.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold truncate max-w-35">{p.name}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-3 font-bold">{p.sold}</td>
                          <td className="text-right py-3 px-6 font-black text-emerald-600">
                            {Number(p.revenue).toLocaleString()} DH
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
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
              Open Assistant
              <ArrowUpRight size={16} />
            </Link>
          </CardContent>
          <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div>
            <div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-linear-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/30 shadow-2xl" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
