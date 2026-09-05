"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { Package, AlertTriangle, XCircle, Clock, Zap, Plus, Search, Filter, MoreVertical, Eye, Trash2, RefreshCw, Brain, TrendingUp, TrendingDown } from "lucide-react";

const mockProducts = [
  { id: "1", name: "Premium Package", sku: "PRE-001", stock: 45, minStock: 10, price: 2500, expiry: "Dec 2026", category: "Services", status: "In Stock" },
  { id: "2", name: "Basic Package", sku: "BAS-001", stock: 8, minStock: 20, price: 800, expiry: "Nov 2026", category: "Services", status: "Low Stock" },
  { id: "3", name: "Enterprise Plan", sku: "ENT-001", stock: 0, minStock: 5, price: 5000, expiry: "Jan 2027", category: "Services", status: "Out of Stock" },
  { id: "4", name: "Add-on Pack", sku: "ADD-001", stock: 120, minStock: 30, price: 500, expiry: "Oct 2026", category: "Services", status: "In Stock" },
  { id: "5", name: "Consultation Hour", sku: "CON-001", stock: 3, minStock: 10, price: 1500, expiry: "Sep 2026", category: "Services", status: "Low Stock" },
  { id: "6", name: "Legacy Bundle", sku: "LEG-001", stock: 50, minStock: 10, price: 1200, expiry: "Mar 2025", category: "Services", status: "Dead Stock" },
];

const mockDeadStock = [
  { id: "1", name: "Legacy Bundle", sku: "LEG-001", stock: 50, expiry: "Mar 2025", daysOverdue: 180 },
  { id: "2", name: "Old Promo Pack", sku: "PRO-OLD", stock: 25, expiry: "Feb 2025", daysOverdue: 210 },
];

const mockFastMoving = [
  { name: "Premium Package", sold: 145, trend: "up" },
  { name: "Add-on Pack", sold: 189, trend: "up" },
  { name: "Basic Package", sold: 230, trend: "down" },
];

const mockAISuggestions = [
  { type: "reorder", message: "Basic Package stock is low (8 units). Reorder 50 units.", priority: "high" },
  { type: "discontinue", message: "Legacy Bundle has been dead stock for 180 days. Consider discontinuing.", priority: "medium" },
  { type: "promo", message: "Add-on Pack is selling fast. Consider running a bundle promotion.", priority: "low" },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "alerts">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = mockProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStockStatus = (product: typeof mockProducts[0]) => {
    if (product.stock === 0) return { color: "bg-red-100 text-red-700", label: "Out of Stock" };
    if (product.stock < product.minStock) return { color: "bg-yellow-100 text-yellow-700", label: "Low Stock" };
    if (product.expiry < "Dec 2026") return { color: "bg-orange-100 text-orange-700", label: "Expiring Soon" };
    return { color: "bg-green-100 text-green-700", label: "In Stock" };
  };

  const lowStockCount = mockProducts.filter(p => p.stock < p.minStock && p.stock > 0).length;
  const outOfStockCount = mockProducts.filter(p => p.stock === 0).length;
  const deadStockCount = mockDeadStock.length;

  return (
    <DashboardLayout title="Inventory Management" subtitle="Track stock levels, alerts, and AI suggestions">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* Alert Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-2"><AlertTriangle className="w-5 h-5 text-yellow-600" /><span className="text-sm text-gray-500">Low Stock</span></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lowStockCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-2"><XCircle className="w-5 h-5 text-red-600" /><span className="text-sm text-gray-500">Out of Stock</span></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{outOfStockCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-2"><Clock className="w-5 h-5 text-orange-600" /><span className="text-sm text-gray-500">Dead Stock</span></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{deadStockCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-2"><Zap className="w-5 h-5 text-brand-600" /><span className="text-sm text-gray-500">Fast Moving</span></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockFastMoving.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["products", "Products"], ["alerts", "Alerts & AI"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-brand-600" />Fast Moving Products</h3>
              <div className="space-y-3">
                {mockFastMoving.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div><p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p><p className="text-xs text-gray-500">{product.sold} units sold</p></div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${product.trend === "up" ? "text-green-600" : "text-red-600"}`}>{product.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{product.trend === "up" ? "Trending Up" : "Trending Down"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-600" />Dead Stock Alert</h3>
              <div className="space-y-3">
                {mockDeadStock.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div><p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p><p className="text-xs text-gray-500">SKU: {item.sku} · {item.stock} units</p></div>
                    <span className="text-xs text-red-600 font-medium">{item.daysOverdue} days overdue</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />Add Product</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">{product.sku}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{product.stock}</td>
                        <td className="px-4 py-3 text-gray-600">₹{product.price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-500">{product.expiry}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-brand-600" />AI Suggestions</h3>
              <div className="space-y-3">
                {mockAISuggestions.map((suggestion, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${suggestion.priority === "high" ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" : suggestion.priority === "medium" ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800" : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${suggestion.priority === "high" ? "bg-red-100 text-red-700" : suggestion.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{suggestion.priority}</span>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{suggestion.type}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Expiry Alerts</h3>
              <div className="space-y-3">
                {mockProducts.filter(p => p.expiry < "Dec 2026" || p.status === "Dead Stock").map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div><p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p><p className="text-xs text-gray-500">SKU: {product.sku}</p></div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.expiry < "Dec 2026" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>Expires: {product.expiry}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
