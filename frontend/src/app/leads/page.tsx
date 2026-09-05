"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { Flame, Snowflake, Crown, TrendingUp, UserX, RefreshCw, Ban, AlertTriangle, Star, ArrowUp, ArrowDown, Plus, Search, Filter, MoreVertical, Eye, Mail, Phone, MapPin, Users, Target } from "lucide-react";

const leadCategories = [
  { id: "hot", name: "Hot", icon: Flame, color: "bg-red-100 text-red-700", count: 24, description: "Ready to buy now" },
  { id: "warm", name: "Warm", icon: TrendingUp, color: "bg-orange-100 text-orange-700", count: 56, description: "Interested, evaluating" },
  { id: "cold", name: "Cold", icon: Snowflake, color: "bg-blue-100 text-blue-700", count: 89, description: "Not ready yet" },
  { id: "vip", name: "VIP", icon: Crown, color: "bg-purple-100 text-purple-700", count: 12, description: "High value, priority" },
  { id: "high-value", name: "High Value", icon: Star, color: "bg-yellow-100 text-yellow-700", count: 34, description: "Big potential deal" },
  { id: "lost", name: "Lost", icon: UserX, color: "bg-gray-100 text-gray-700", count: 18, description: "Deal lost" },
  { id: "returning", name: "Returning", icon: RefreshCw, color: "bg-green-100 text-green-700", count: 45, description: "Previous customer" },
  { id: "not-interested", name: "Not Interested", icon: Ban, color: "bg-red-50 text-red-600", count: 23, description: "Declined offer" },
  { id: "churn-risk", name: "Churn Risk", icon: AlertTriangle, color: "bg-yellow-100 text-yellow-700", count: 15, description: "May leave soon" },
];

const mockLeads = [
  { id: "1", name: "Rahul Verma", email: "rahul@company.com", phone: "+91 98765 43210", city: "Mumbai", category: "hot", score: 92, source: "Website", status: "New", date: "25 Aug 2026" },
  { id: "2", name: "Priya Sharma", email: "priya@business.in", phone: "+91 87654 32109", city: "Delhi", category: "warm", score: 78, source: "Referral", status: "Contacted", date: "24 Aug 2026" },
  { id: "3", name: "Amit Kumar", email: "amit@startup.io", phone: "+91 76543 21098", city: "Bangalore", category: "vip", score: 95, source: "LinkedIn", status: "Qualified", date: "23 Aug 2026" },
  { id: "4", name: "Neha Patel", email: "neha@enterprise.com", phone: "+91 65432 10987", city: "Ahmedabad", category: "cold", score: 45, source: "Cold Call", status: "New", date: "22 Aug 2026" },
  { id: "5", name: "Vikram Singh", email: "vikram@corp.in", phone: "+91 54321 09876", city: "Jaipur", category: "high-value", score: 88, source: "Website", status: "Proposal", date: "21 Aug 2026" },
  { id: "6", name: "Anita Desai", email: "anita@tech.co", phone: "+91 43210 98765", city: "Pune", category: "returning", score: 72, source: "Repeat", status: "Negotiation", date: "20 Aug 2026" },
  { id: "7", name: "Suresh Reddy", email: "suresh@digital.in", phone: "+91 32109 87654", city: "Hyderabad", category: "churn-risk", score: 35, source: "Existing", status: "At Risk", date: "19 Aug 2026" },
  { id: "8", name: "Meera Joshi", email: "meera@innovate.com", phone: "+91 21098 76543", city: "Chennai", category: "lost", score: 20, source: "Cold Call", status: "Lost", date: "18 Aug 2026" },
];

const kanbanColumns = [
  { id: "new", name: "New", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "contacted", name: "Contacted", color: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "qualified", name: "Qualified", color: "bg-purple-50 dark:bg-purple-900/20" },
  { id: "proposal", name: "Proposal", color: "bg-orange-50 dark:bg-orange-900/20" },
  { id: "negotiation", name: "Negotiation", color: "bg-yellow-50 dark:bg-yellow-900/20" },
  { id: "won", name: "Won", color: "bg-green-50 dark:bg-green-900/20" },
  { id: "lost", name: "Lost", color: "bg-red-50 dark:bg-red-900/20" },
];

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "cards" | "kanban">("overview");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getCategoryColor = (category: string) => {
    const cat = leadCategories.find(c => c.id === category);
    return cat ? cat.color : "bg-gray-100 text-gray-700";
  };

  const getCategoryName = (category: string) => {
    const cat = leadCategories.find(c => c.id === category);
    return cat ? cat.name : category;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const filteredLeads = selectedCategory ? mockLeads.filter(l => l.category === selectedCategory) : mockLeads;

  return (
    <DashboardLayout title="Lead Management" subtitle="AI-powered lead scoring and categorization">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* AI Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {leadCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} className={`bg-white dark:bg-gray-900 rounded-2xl border p-4 text-left transition-all hover:shadow-lg ${selectedCategory === cat.id ? "border-brand-600 ring-2 ring-brand-600/20" : "border-gray-200 dark:border-gray-700"}`}>
                <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{cat.name}</p>
                <p className="text-xs text-gray-500 mt-1">{cat.count} leads</p>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["cards", "Lead Cards"], ["kanban", "Kanban Board"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Leads by Score</h3>
              <div className="space-y-3">
                {mockLeads.sort((a, b) => b.score - a.score).slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{lead.name.split(" ").map(n => n[0]).join("")}</div>
                      <div><p className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</p><p className="text-xs text-gray-500">{lead.source}</p></div>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Category Distribution</h3>
              <div className="space-y-4">
                {leadCategories.filter(c => c.count > 0).map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}><Icon className="w-4 h-4" /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1"><span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span><span className="text-gray-500">{cat.count}</span></div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-brand-600 h-2 rounded-full" style={{ width: `${Math.min((cat.count / 100) * 100, 100)}%` }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Lead Cards Tab */}
        {activeTab === "cards" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />Add Lead</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLeads.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.email.toLowerCase().includes(searchQuery.toLowerCase())).map((lead) => (
                <div key={lead.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{lead.name.split(" ").map(n => n[0]).join("")}</div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(lead.category)}`}>{getCategoryName(lead.category)}</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{lead.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{lead.city}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className={`text-lg font-bold ${getScoreColor(lead.score)}`}>{lead.score}</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.status}</p>
                      <p className="text-xs text-gray-500">Status</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1.5 rounded-lg bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100">Contact</button>
                    <button className="flex-1 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanban Board Tab */}
        {activeTab === "kanban" && (
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-[1200px]">
              {kanbanColumns.map((column) => {
                const columnLeads = mockLeads.filter(l => l.status.toLowerCase() === column.id);
                return (
                  <div key={column.id} className={`flex-1 rounded-2xl p-4 ${column.color}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{column.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">{columnLeads.length}</span>
                    </div>
                    <div className="space-y-3">
                      {columnLeads.map((lead) => (
                        <div key={lead.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(lead.category)}`}>{getCategoryName(lead.category)}</span>
                            <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{lead.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{lead.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
