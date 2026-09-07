"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { api } from "@/lib/api";
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Users, ShoppingCart, Repeat, Award, ArrowUpRight, ArrowDownRight, Calendar, Filter } from "lucide-react";

export default function SalesDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "products">("overview");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sales, custs] = await Promise.all([
        api.getSalesStats().catch(() => null),
        api.getCustomers({ take: 100 }).catch(() => ({ items: [] })),
      ]);
      setStats(sales);
      setCustomers((custs?.items || []) as any[]);
    } catch (e: any) {
      setError(e?.message || "Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalSales = stats?.totalSales || 0;
  const todaySales = stats?.todaySales || 0;
  const totalPurchaseCount = stats?.totalPurchaseCount || 0;
  const todayPurchaseCount = stats?.todayPurchaseCount || 0;

  const avgOrderValue = totalPurchaseCount > 0 ? totalSales / totalPurchaseCount : 0;
  const repeatCustomers = customers.filter((c) => (c.purchaseCount || 0) > 1).length;
  const repeatRate = customers.length > 0 ? Math.round((repeatCustomers / customers.length) * 100) : 0;

  const topProducts = [...customers]
    .filter((c) => c.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map((c) => ({ name: c.name || "Unknown", sales: c.purchaseCount || 0, revenue: c.totalSpent || 0 }));

  return (
    <DashboardLayout title="Sales Dashboard" subtitle="Revenue, profit, growth, and conversion analytics">
      <BackButton className="mb-3" />
      {loading && <div className="text-sm text-gray-500 mb-4">Loading sales data...</div>}
      {error && <div className="text-sm text-red-600 mb-4">{error} <button onClick={load} className="underline ml-2">Retry</button></div>}
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Revenue" value={`₹${(totalSales / 100000).toFixed(1)}L`} change={todaySales > 0 ? "+" : ""} icon={DollarSign} color="bg-green-50 dark:bg-green-900/20 text-green-600" />
          <StatCard title="Today Sales" value={`₹${todaySales.toLocaleString("en-IN")}`} change={todaySales > 0 ? "up" : "neutral"} icon={TrendingUp} color="bg-blue-50 dark:bg-blue-900/20 text-blue-600" />
          <StatCard title="Total Orders" value={totalPurchaseCount.toString()} change={todayPurchaseCount > 0 ? `+${todayPurchaseCount}` : "0"} icon={ShoppingCart} color="bg-purple-50 dark:bg-purple-900/20 text-purple-600" />
          <StatCard title="Avg Order Value" value={`₹${avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change="-" icon={Target} color="bg-orange-50 dark:bg-orange-900/20 text-orange-600" />
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["metrics", "Key Metrics"], ["products", "Top Customers"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Revenue by Customer</h3>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, idx) => {
                    const maxRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);
                    return (
                      <div key={product.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300 w-40 truncate">{product.name}</span>
                          <span className="text-gray-500">₹{(product.revenue / 1000).toFixed(0)}K revenue</span>
                          <span className="text-gray-500 w-16 text-right">{product.sales} orders</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                            <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: `${(product.revenue / maxRevenue) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No sales data available yet</div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Average Order Value" value={`₹${avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change="-" icon={ShoppingCart} />
              <MetricCard title="Repeat Customer %" value={`${repeatRate}%`} change={repeatRate > 0 ? "+" : "0"} icon={Repeat} />
              <MetricCard title="Total Customers" value={customers.length.toString()} change="-" icon={Users} />
              <MetricCard title="Total Orders" value={totalPurchaseCount.toString()} change={todayPurchaseCount > 0 ? `+${todayPurchaseCount}` : "0"} icon={Award} />
            </div>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <MetricCard title="Total Revenue" value={`₹${totalSales.toLocaleString("en-IN")}`} change={todaySales > 0 ? "+" : "0"} icon={DollarSign} large />
            <MetricCard title="Total Orders" value={totalPurchaseCount.toString()} change={todayPurchaseCount > 0 ? `+${todayPurchaseCount}` : "0"} icon={ShoppingCart} large />
            <MetricCard title="Avg Order Value" value={`₹${avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change="-" icon={Target} large />
            <MetricCard title="Repeat Customer %" value={`${repeatRate}%`} change={repeatRate > 0 ? "+" : "0"} icon={Repeat} large />
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-semibold text-gray-900 dark:text-gray-100">Top Customers by Revenue</h3></div>
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th></tr></thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {topProducts.map((product, index) => (
                      <tr key={product.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                        <td className="px-4 py-3 text-gray-600">{product.sales}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">₹{product.revenue.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-brand-600 h-2 rounded-full" style={{ width: `${(product.revenue / Math.max(...topProducts.map((p) => p.revenue), 1)) * 100}%` }} /></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">No customer revenue data available yet</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, change, icon, color }: { title: string; value: string; change: string; icon: any; color: string }) {
  const trendUp = change === "up" || change.startsWith("+");
  const Icon = icon;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${color}`}>{Icon && <Icon className="w-5 h-5" />}</div>
        <span className={`text-xs font-medium flex items-center gap-1 ${trendUp ? "text-green-600" : change === "neutral" ? "text-gray-500" : "text-red-600"}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : change === "neutral" ? null : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}

function MetricCard({ title, value, change, icon, large }: { title: string; value: string; change: string; icon: any; large?: boolean }) {
  const Icon = icon;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600">{Icon && <Icon className="w-5 h-5" />}</div>
        <span className="text-xs text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{change}</span>
      </div>
      <p className={`font-bold text-gray-900 dark:text-gray-100 ${large ? "text-3xl" : "text-2xl"}`}>{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}
