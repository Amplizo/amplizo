"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { Building2, MapPin, Users, TrendingUp, IndianRupee, ArrowUpRight, ArrowDownRight, Eye, Plus, Search, Filter, MoreVertical, Star, ChevronRight } from "lucide-react";

const mockBranches = [
  { id: "1", name: "Mumbai - Andheri", location: "Mumbai, Maharashtra", manager: "Rahul Verma", staff: 12, customers: 450, revenue: 1250000, growth: 15, rating: 4.8, status: "Active" },
  { id: "2", name: "Delhi - Connaught Place", location: "Delhi, India", manager: "Priya Sharma", staff: 10, customers: 380, revenue: 980000, growth: 12, rating: 4.6, status: "Active" },
  { id: "3", name: "Bangalore - Koramangala", location: "Bangalore, Karnataka", manager: "Amit Kumar", staff: 8, customers: 290, revenue: 720000, growth: 18, rating: 4.5, status: "Active" },
  { id: "4", name: "Pune - FC Road", location: "Pune, Maharashtra", manager: "Neha Patel", staff: 6, customers: 180, revenue: 450000, growth: 8, rating: 4.3, status: "Active" },
  { id: "5", name: "Hyderabad - Banjara Hills", location: "Hyderabad, Telangana", manager: "Suresh Reddy", staff: 9, customers: 320, revenue: 850000, growth: 22, rating: 4.7, status: "Active" },
  { id: "6", name: "Chennai - T Nagar", location: "Chennai, Tamil Nadu", manager: "Meera Joshi", staff: 7, customers: 210, revenue: 520000, growth: -3, rating: 4.2, status: "Under Review" },
];

export default function BranchesPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "branches" | "analytics">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<typeof mockBranches[0] | null>(null);

  const filteredBranches = mockBranches.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.location.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalRevenue = mockBranches.reduce((acc, b) => acc + b.revenue, 0);
  const totalCustomers = mockBranches.reduce((acc, b) => acc + b.customers, 0);
  const totalStaff = mockBranches.reduce((acc, b) => acc + b.staff, 0);
  const avgGrowth = Math.round(mockBranches.reduce((acc, b) => acc + b.growth, 0) / mockBranches.length);

  return (
    <DashboardLayout title="Multi Branch" subtitle="Manage 100+ stores from one dashboard">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockBranches.length}</p>
            <p className="text-sm text-gray-500">Total Branches</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCustomers.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Customers</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(totalRevenue / 100000).toFixed(1)}L</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgGrowth}%</p>
            <p className="text-sm text-gray-500">Avg Growth</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["branches", "All Branches"], ["analytics", "Analytics"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Performing Branches</h3>
              <div className="space-y-3">
                {mockBranches.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((branch) => (
                  <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600"><Building2 className="w-5 h-5" /></div>
                      <div><p className="font-medium text-gray-900 dark:text-gray-100">{branch.name}</p><p className="text-xs text-gray-500">{branch.location}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">₹{(branch.revenue / 100000).toFixed(1)}L</p>
                      <span className={`text-xs ${branch.growth >= 0 ? "text-green-600" : "text-red-600"}`}>{branch.growth >= 0 ? "+" : ""}{branch.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Branch Distribution</h3>
              <div className="space-y-4">
                {mockBranches.map((branch) => (
                  <div key={branch.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">{branch.name}</span><span className="text-gray-500">{branch.customers} customers</span></div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5"><div className="bg-brand-600 h-2.5 rounded-full" style={{ width: `${(branch.customers / 500) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === "branches" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search branches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />Add Branch</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBranches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600"><Building2 className="w-4 h-4" /></div><div><p className="font-medium text-gray-900 dark:text-gray-100">{branch.name}</p><p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{branch.location}</p></div></div></td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{branch.manager}</td>
                      <td className="px-4 py-3 text-gray-600">{branch.staff}</td>
                      <td className="px-4 py-3 text-gray-600">{branch.customers}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">₹{(branch.revenue / 100000).toFixed(1)}L</td>
                      <td className="px-4 py-3"><span className={`flex items-center gap-1 text-sm font-medium ${branch.growth >= 0 ? "text-green-600" : "text-red-600"}`}>{branch.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{branch.growth}%</span></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="text-gray-900 dark:text-gray-100">{branch.rating}</span></div></td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${branch.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{branch.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue by Branch</h3>
              <div className="space-y-4">
                {mockBranches.sort((a, b) => b.revenue - a.revenue).map((branch) => (
                  <div key={branch.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">{branch.name}</span><span className="text-gray-500">₹{(branch.revenue / 100000).toFixed(1)}L</span></div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5"><div className="bg-brand-600 h-2.5 rounded-full" style={{ width: `${(branch.revenue / totalRevenue) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Customer Distribution</h3>
              <div className="space-y-4">
                {mockBranches.sort((a, b) => b.customers - a.customers).map((branch) => (
                  <div key={branch.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">{branch.name}</span><span className="text-gray-500">{branch.customers} customers</span></div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5"><div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(branch.customers / totalCustomers) * 100}%` }} /></div>
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
