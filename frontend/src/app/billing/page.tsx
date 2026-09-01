"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, Filter, MoreVertical, Eye, Download, Send, FileText, Receipt, IndianRupee, Smartphone, Link, CreditCard, Repeat, X } from "lucide-react";

const mockInvoices = [
  { id: "INV-001", customer: "Rahul Verma", date: "25 Aug 2026", amount: 25000, status: "Paid", type: "Invoice" },
  { id: "INV-002", customer: "Priya Sharma", date: "24 Aug 2026", amount: 18500, status: "Pending", type: "Invoice" },
  { id: "INV-003", customer: "Amit Kumar", date: "23 Aug 2026", amount: 3200, status: "Paid", type: "Quotation" },
  { id: "INV-004", customer: "Neha Patel", date: "22 Aug 2026", amount: 4800, status: "Overdue", type: "Invoice" },
  { id: "INV-005", customer: "Vikram Singh", date: "21 Aug 2026", amount: 15000, status: "Paid", type: "Invoice" },
  { id: "INV-006", customer: "Anita Desai", date: "20 Aug 2026", amount: 9500, status: "Pending", type: "Subscription" },
  { id: "INV-007", customer: "Suresh Reddy", date: "19 Aug 2026", amount: 22000, status: "Paid", type: "EMI" },
  { id: "INV-008", customer: "Meera Joshi", date: "18 Aug 2026", amount: 1200, status: "Paid", type: "Invoice" },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "create">("invoices");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filteredInvoices = mockInvoices.filter((inv) => {
    const matchesSearch = inv.customer.toLowerCase().includes(searchQuery.toLowerCase()) || inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || inv.type === filterType;
    const matchesStatus = filterStatus === "All" || inv.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalRevenue = mockInvoices.filter(i => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0);
  const pendingAmount = mockInvoices.filter(i => i.status === "Pending").reduce((acc, i) => acc + i.amount, 0);
  const overdueAmount = mockInvoices.filter(i => i.status === "Overdue").reduce((acc, i) => acc + i.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Overdue": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Invoice": return FileText;
      case "Quotation": return Receipt;
      case "Subscription": return Repeat;
      case "EMI": return CreditCard;
      default: return FileText;
    }
  };

  return (
    <DashboardLayout title="Billing & Invoices" subtitle="Manage invoices, payments, and billing options">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalRevenue.toLocaleString("en-IN")}</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{pendingAmount.toLocaleString("en-IN")}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{overdueAmount.toLocaleString("en-IN")}</p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockInvoices.length}</p>
            <p className="text-sm text-gray-500">Total Invoices</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["invoices", "Invoices"], ["create", "Create Invoice"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                  <option value="All">All Types</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Subscription">Subscription</option>
                  <option value="EMI">EMI</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <button onClick={() => setActiveTab("create")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 whitespace-nowrap"><Plus className="w-4 h-4" />Create Invoice</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInvoices.map((invoice) => {
                    const TypeIcon = getTypeIcon(invoice.type);
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">{invoice.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{invoice.customer}</td>
                        <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-gray-600"><TypeIcon className="w-3.5 h-3.5" />{invoice.type}</span></td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">₹{invoice.amount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>{invoice.status}</span></td>
                        <td className="px-4 py-3 text-gray-500">{invoice.date}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1"><button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Eye className="w-4 h-4 text-gray-500" /></button><button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Download className="w-4 h-4 text-gray-500" /></button><button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical className="w-4 h-4 text-gray-500" /></button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Invoice Tab */}
        {activeTab === "create" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Create New Invoice</h3>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setActiveTab("invoices"); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer</label><select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"><option>Select customer</option>{mockInvoices.slice(0, 4).map(inv => <option key={inv.id} value={inv.customer}>{inv.customer}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label><select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"><option>Invoice</option><option>Quotation</option><option>Subscription</option><option>EMI</option></select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label><input type="number" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" placeholder="0.00" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input type="date" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Options</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="checkbox" className="rounded text-brand-600" /><IndianRupee className="w-4 h-4 text-gray-500" /><span className="text-sm">Cash</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="checkbox" className="rounded text-brand-600" /><Smartphone className="w-4 h-4 text-gray-500" /><span className="text-sm">UPI</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="checkbox" className="rounded text-brand-600" /><Link className="w-4 h-4 text-gray-500" /><span className="text-sm">Payment Link</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="checkbox" className="rounded text-brand-600" /><CreditCard className="w-4 h-4 text-gray-500" /><span className="text-sm">Card</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="checkbox" className="rounded text-brand-600" /><Receipt className="w-4 h-4 text-gray-500" /><span className="text-sm">GST Invoice</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setActiveTab("invoices")} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Create Invoice</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
