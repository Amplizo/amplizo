"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Users, ShoppingCart, Repeat, Award, ArrowUpRight, ArrowDownRight, Calendar, Filter } from "lucide-react";

const monthlyData = [
  { month: "Jan", revenue: 420000, profit: 125000, orders: 340, conversion: 12 },
  { month: "Feb", revenue: 380000, profit: 110000, orders: 310, conversion: 11 },
  { month: "Mar", revenue: 450000, profit: 140000, orders: 380, conversion: 13 },
  { month: "Apr", revenue: 410000, profit: 120000, orders: 350, conversion: 12 },
  { month: "May", revenue: 480000, profit: 155000, orders: 420, conversion: 14 },
  { month: "Jun", revenue: 520000, profit: 170000, orders: 450, conversion: 15 },
  { month: "Jul", revenue: 490000, profit: 160000, orders: 430, conversion: 14 },
  { month: "Aug", revenue: 550000, profit: 185000, orders: 480, conversion: 16 },
];

const mockSalesStats = [
  { title: "Revenue", value: "₹8.5L", change: "+12%", trend: "up", icon: DollarSign, color: "bg-green-50 dark:bg-green-900/20 text-green-600" },
  { title: "Profit", value: "₹2.1L", change: "+18%", trend: "up", icon: TrendingUp, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600" },
  { title: "Growth", value: "23%", change: "+5%", trend: "up", icon: BarChart3, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
  { title: "Conversion", value: "14.2%", change: "-2%", trend: "down", icon: Target, color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600" },
];

const mockMetrics = [
  { title: "Average Order Value", value: "₹1,850", change: "+8%", icon: ShoppingCart },
  { title: "Repeat Customer %", value: "34%", change: "+5%", icon: Repeat },
  { title: "Employee Performance", value: "87%", change: "+3%", icon: Users },
  { title: "Campaign Result", value: "92%", change: "+7%", icon: Award },
];

const mockTopProducts = [
  { name: "Premium Package", sales: 145, revenue: 362500 },
  { name: "Basic Package", sales: 230, revenue: 184000 },
  { name: "Enterprise Plan", sales: 67, revenue: 335000 },
  { name: "Add-on Services", sales: 189, revenue: 94500 },
];

export default function SalesDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "products">("overview");

  return (
    <DashboardLayout title="Sales Dashboard" subtitle="Revenue, profit, growth, and conversion analytics">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockSalesStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}><Icon className="w-5 h-5" /></div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["metrics", "Key Metrics"], ["products", "Top Products"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Monthly Comparison Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Monthly Comparison</h3>
              <div className="space-y-4">
                {monthlyData.map((month) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-12">{month.month}</span>
                      <span className="text-gray-500">₹{(month.revenue / 1000).toFixed(0)}K revenue</span>
                      <span className="text-gray-500">{month.conversion}% conv</span>
                      <span className="text-gray-500 w-16 text-right">{month.orders} orders</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                        <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: `${(month.revenue / 600000) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600"><Icon className="w-5 h-5" /></div>
                      <span className="text-xs text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{metric.change}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p>
                    <p className="text-sm text-gray-500">{metric.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === "metrics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {mockMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600"><Icon className="w-6 h-6" /></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{metric.title}</p>
                        <p className="text-sm text-gray-500">Current period</p>
                      </div>
                    </div>
                    <span className="text-green-600 text-sm font-medium flex items-center gap-1"><ArrowUpRight className="w-4 h-4" />{metric.change}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p>
                  <div className="mt-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-brand-600 h-2 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-semibold text-gray-900 dark:text-gray-100">Top Performing Products</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockTopProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                      <td className="px-4 py-3 text-gray-600">{product.sales}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">₹{product.revenue.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-brand-600 h-2 rounded-full" style={{ width: `${(product.revenue / 400000) * 100}%` }} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
