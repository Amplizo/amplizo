"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { FileDown, Download, Filter, CheckCircle2, AlertCircle, Loader2, Search } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store";

interface ExportCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  source?: string | null;
  status?: string | null;
  currentLeadStatus?: string | null;
  plan?: string | null;
  createdAt?: string;
  totalSpent?: number;
  purchaseCount?: number;
  purchases?: { purchaseAmount: number; productDetails?: string | null; purchaseDate?: string }[];
  assignedEmployee?: { name?: string; email?: string } | null;
}

export default function DataExportPage() {
  const router = useRouter();
  const { agent } = useAuthStore();
  const [customers, setCustomers] = useState<ExportCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (agent?.role && agent.role !== "agent") {
      router.replace("/dashboard");
    }
  }, [agent, router]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCustomers({ take: 500 });
      const items = Array.isArray(data?.items) ? data.items : [];
      setCustomers(items);
    } catch (e: any) {
      const msg = e?.response?.data?.message?.message || e?.response?.data?.message || e?.message || "Failed to load customers";
      setError(msg);
      setCustomers([]);
    }
    setLoading(false);
  };

  const cities = useMemo(
    () => Array.from(new Set(customers.map((c) => c.city).filter(Boolean) as string[])).sort(),
    [customers]
  );
  const statuses = useMemo(
    () => Array.from(new Set(customers.map((c) => c.status).filter(Boolean) as string[])).sort(),
    [customers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterCity !== "all" && c.city !== filterCity) return false;
      if (q) {
        const hay = [c.name, c.phone, c.email, c.city].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [customers, filterStatus, filterCity, search]);

  const lastPurchase = (c: ExportCustomer) => {
    const ps = c.purchases || [];
    if (ps.length === 0) return null;
    return ps.slice().sort((a, b) => (a.purchaseDate || "").localeCompare(b.purchaseDate || ""))[ps.length - 1];
  };
  const formatDate = (d?: string) => (d ? new Date(d).toISOString().split("T")[0] : "");

  const handleExport = async () => {
    if (filtered.length === 0) return;
    setExporting(true);
    try {
      const blob = await api.exportCustomers(exportFormat);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout title="Data Export" subtitle="Export your customer data to CSV or Excel">
      <BackButton className="mb-3" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-brand-600" />
            Filter & Search
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, email, or city"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              >
                <option value="all">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">City</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              >
                <option value="all">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Format:</span>
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setExportFormat("csv")}
                  className={`px-3 py-1.5 text-xs font-semibold ${exportFormat === "csv" ? "bg-brand-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setExportFormat("xlsx")}
                  className={`px-3 py-1.5 text-xs font-semibold ${exportFormat === "xlsx" ? "bg-brand-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                >
                  XLSX
                </button>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting || loading || filtered.length === 0}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? "Exporting..." : `Export ${filtered.length} Customer${filtered.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Failed to load customers</p>
              <p className="text-xs mt-1 opacity-80">{error}</p>
              <button
                onClick={fetchCustomers}
                className="mt-2 text-xs font-semibold underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">Export complete! Check your downloads folder.</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customer Data</h2>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? "Loading..." : `Showing ${filtered.length} of ${customers.length} customers`}
              </p>
            </div>
            <button
              onClick={fetchCustomers}
              disabled={loading}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Loading customers...</span>
            </div>
          ) : !error && filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {customers.length === 0
                  ? "No customers yet. Add customers from the Dashboard, Customers page, or import a CSV/Excel file."
                  : "No customers match the current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">City</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Source</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Total Spent</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Purchases</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map((c) => {
                    const lp = lastPurchase(c);
                    const totalSpent = typeof c.totalSpent === "number" ? c.totalSpent : 0;
                    const purchaseCount = typeof c.purchaseCount === "number" ? c.purchaseCount : (c.purchases || []).length;
                    return (
                      <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{c.phone}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{c.email || "—"}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{c.city || "—"}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{c.source || "—"}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{c.status || "—"}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100 font-medium">
                          {totalSpent > 0 ? `₹${totalSpent.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                          {purchaseCount > 0 ? purchaseCount : "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-xs truncate" title={lp?.productDetails || ""}>
                          {lp?.productDetails || "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{formatDate(c.createdAt) || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length > 100 && (
                <p className="text-xs text-gray-500 mt-2 text-center">Showing first 100 of {filtered.length} rows</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}