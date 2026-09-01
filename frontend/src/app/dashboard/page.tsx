"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store";
import { api } from "@/lib/api";
import type { AdminStats } from "@/lib/types";
import { Users, CreditCard, IndianRupee, TrendingUp, UserPlus, Calendar, ArrowUpRight, ArrowDownRight, Crown, Zap, MessageCircle, Clock, Star, MoreVertical, Search, Filter, Plus, Eye, Mail, Phone, MapPin, Activity, X, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const initialClients = [
  { id: "1", name: "Rahul Verma", email: "rahul@company.com", phone: "+91 98765 43210", city: "Mumbai", plan: "Pro", status: "Active", joined: "15 Aug 2026", chats: 45, satisfaction: 98, avatar: "RV" },
  { id: "2", name: "Priya Sharma", email: "priya@business.in", phone: "+91 87654 32109", city: "Delhi", plan: "Business", status: "Active", joined: "12 Aug 2026", chats: 89, satisfaction: 96, avatar: "PS" },
  { id: "3", name: "Amit Kumar", email: "amit@startup.io", phone: "+91 76543 21098", city: "Bangalore", plan: "Pro", status: "Active", joined: "10 Aug 2026", chats: 23, satisfaction: 94, avatar: "AK" },
  { id: "4", name: "Neha Patel", email: "neha@enterprise.com", phone: "+91 65432 10987", city: "Ahmedabad", plan: "Starter", status: "Trial", joined: "08 Aug 2026", chats: 8, satisfaction: 92, avatar: "NP" },
  { id: "5", name: "Vikram Singh", email: "vikram@corp.in", phone: "+91 54321 09876", city: "Jaipur", plan: "Business", status: "Active", joined: "05 Aug 2026", chats: 156, satisfaction: 97, avatar: "VS" },
  { id: "6", name: "Anita Desai", email: "anita@tech.co", phone: "+91 43210 98765", city: "Pune", plan: "Pro", status: "Active", joined: "03 Aug 2026", chats: 67, satisfaction: 95, avatar: "AD" },
  { id: "7", name: "Suresh Reddy", email: "suresh@digital.in", phone: "+91 32109 87654", city: "Hyderabad", plan: "Business", status: "Active", joined: "01 Aug 2026", chats: 234, satisfaction: 99, avatar: "SR" },
  { id: "8", name: "Meera Joshi", email: "meera@innovate.com", phone: "+91 21098 76543", city: "Chennai", plan: "Starter", status: "Trial", joined: "28 Jul 2026", chats: 12, satisfaction: 88, avatar: "MJ" },
];

const mockSubscriptions = [
  { id: "SUB001", client: "Rahul Verma", plan: "Pro", amount: 2999, cycle: "Monthly", status: "Active", start: "15 Aug 2026", nextBilling: "15 Sep 2026" },
  { id: "SUB002", client: "Priya Sharma", plan: "Business", amount: 5999, cycle: "Monthly", status: "Active", start: "12 Aug 2026", nextBilling: "12 Sep 2026" },
  { id: "SUB003", client: "Amit Kumar", plan: "Pro", amount: 2999, cycle: "Monthly", status: "Active", start: "10 Aug 2026", nextBilling: "10 Sep 2026" },
  { id: "SUB004", client: "Neha Patel", plan: "Starter", amount: 999, cycle: "Monthly", status: "Trial", start: "08 Aug 2026", nextBilling: "08 Sep 2026" },
  { id: "SUB005", client: "Vikram Singh", plan: "Business", amount: 5999, cycle: "Monthly", status: "Active", start: "05 Aug 2026", nextBilling: "05 Sep 2026" },
  { id: "SUB006", client: "Anita Desai", plan: "Pro", amount: 2999, cycle: "Monthly", status: "Active", start: "03 Aug 2026", nextBilling: "03 Sep 2026" },
  { id: "SUB007", client: "Suresh Reddy", plan: "Business", amount: 5999, cycle: "Monthly", status: "Active", start: "01 Aug 2026", nextBilling: "01 Sep 2026" },
  { id: "SUB008", client: "Meera Joshi", plan: "Starter", amount: 999, cycle: "Monthly", status: "Trial", start: "28 Jul 2026", nextBilling: "28 Aug 2026" },
];

export default function DashboardPage() {
  const { agent } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({ totalVisitors: 0, activeChats: 0, closedChatsToday: 0, onlineAgents: 0, totalMessages: 0, storageUsedMB: 0, avgResponseTimeSec: 0, satisfactionRate: 0 });
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "subscriptions" | "agents">("overview");
  const [clients, setClients] = useState(initialClients);
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<typeof initialClients[0] | null>(null);
  const [viewingClient, setViewingClient] = useState<typeof initialClients[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", city: "", plan: "Starter", status: "Active" });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (agent && agent.role !== "admin") {
      router.push("/client-dashboard");
    }
  }, [agent, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try { const data = await api.getAdminStats(); setStats(data); } catch { setStats({ totalVisitors: 1247, activeChats: 18, closedChatsToday: 45, onlineAgents: 4, totalMessages: 8934, storageUsedMB: 234.5, avgResponseTimeSec: 12, satisfactionRate: 94 }); }
    };
    fetchStats();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const client = {
      id: Date.now().toString(),
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      city: newClient.city,
      plan: newClient.plan,
      status: newClient.status,
      joined: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      chats: 0,
      satisfaction: 0,
      avatar: newClient.name.split(" ").map(n => n[0]).join("").toUpperCase(),
    };
    setClients([client, ...clients]);
    setShowAddClient(false);
    setNewClient({ name: "", email: "", phone: "", city: "", plan: "Starter", status: "Active" });
    showSuccess("Client added successfully!");
  };

  const handleEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setClients(clients.map(c => c.id === editingClient.id ? editingClient : c));
    setEditingClient(null);
    showSuccess("Client updated successfully!");
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    showSuccess("Client deleted successfully!");
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = mockSubscriptions.filter(s => s.status === "Active").reduce((acc, s) => acc + s.amount, 0);
  const activeSubscriptions = mockSubscriptions.filter(s => s.status === "Active").length;

  return (
    <DashboardLayout title="Admin Dashboard" subtitle={`Welcome back, ${agent?.name || "Admin"}`}>
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-white shadow-lg">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20"><Users className="w-5 h-5 text-blue-600" /></div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />12%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{clients.length}</p>
            <p className="text-sm text-gray-500">Total Clients</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20"><CreditCard className="w-5 h-5 text-green-600" /></div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />8%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeSubscriptions}</p>
            <p className="text-sm text-gray-500">Active Subscriptions</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20"><IndianRupee className="w-5 h-5 text-purple-600" /></div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />24%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalRevenue.toLocaleString("en-IN")}</p>
            <p className="text-sm text-gray-500">Monthly Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20"><TrendingUp className="w-5 h-5 text-orange-600" /></div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />18%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">94%</p>
            <p className="text-sm text-gray-500">Avg Satisfaction</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["clients", "Clients"], ["subscriptions", "Subscriptions"], ["agents", "Agents"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Clients</h3>
                <div className="space-y-3">
                  {clients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => setViewingClient(client)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-sm">{client.avatar}</div>
                        <div><p className="font-medium text-gray-900 dark:text-gray-100">{client.name}</p><p className="text-xs text-gray-500">{client.email}</p></div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{client.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Plan Distribution</h3>
                <div className="space-y-4">
                  {[{ name: "Business", count: clients.filter(c => c.plan === "Business").length, amount: clients.filter(c => c.plan === "Business").length * 5999, color: "bg-purple-500" }, { name: "Pro", count: clients.filter(c => c.plan === "Pro").length, amount: clients.filter(c => c.plan === "Pro").length * 2999, color: "bg-blue-500" }, { name: "Starter", count: clients.filter(c => c.plan === "Starter").length, amount: clients.filter(c => c.plan === "Starter").length * 999, color: "bg-green-500" }].map((plan) => (
                    <div key={plan.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">{plan.name}</span><span className="text-gray-500">{plan.count} clients | ₹{plan.amount.toLocaleString("en-IN")}</span></div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5"><div className={`${plan.color} h-2.5 rounded-full`} style={{ width: `${clients.length > 0 ? (plan.count / clients.length) * 100 : 0}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <div className="relative flex-1 max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" /></div>
                <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"><Filter className="w-4 h-4 text-gray-500" /></button>
              </div>
              <button onClick={() => setShowAddClient(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />Add Client</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chats</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{client.avatar}</div><div><p className="font-medium text-gray-900 dark:text-gray-100">{client.name}</p><p className="text-xs text-gray-500">{client.city}</p></div></div></td>
                      <td className="px-4 py-3"><div className="flex flex-col gap-1"><span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Mail className="w-3 h-3" />{client.email}</span><span className="flex items-center gap-1 text-gray-500 text-xs"><Phone className="w-3 h-3" />{client.phone}</span></div></td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.plan === "Business" ? "bg-purple-100 text-purple-700" : client.plan === "Pro" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{client.plan}</span></td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{client.status}</span></td>
                      <td className="px-4 py-3 text-gray-600">{client.chats}</td>
                      <td className="px-4 py-3 text-gray-500">{client.joined}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><button onClick={() => setViewingClient(client)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Eye className="w-4 h-4 text-gray-500" /></button><button onClick={() => setEditingClient({...client})} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Edit className="w-4 h-4 text-blue-500" /></button><button onClick={() => handleDeleteClient(client.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClients.length === 0 && (
                <div className="p-8 text-center text-gray-500">No clients found matching your search.</div>
              )}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Subscriptions</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"><Filter className="w-4 h-4" />Filter</button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Plan</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Billing</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-gray-500">{sub.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{sub.client}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub.plan === "Business" ? "bg-purple-100 text-purple-700" : sub.plan === "Pro" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{sub.plan}</span></td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">₹{sub.amount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{sub.status}</span></td>
                      <td className="px-4 py-3 text-gray-500">{sub.start}</td>
                      <td className="px-4 py-3 text-gray-500">{sub.nextBilling}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Eye className="w-4 h-4 text-gray-500" /></button><button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical className="w-4 h-4 text-gray-500" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === "agents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockAgents.map((agent) => (
              <div key={agent.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium">{agent.name.split(" ").map(n => n[0]).join("")}</div>
                  <div><p className="font-medium text-gray-900 dark:text-gray-100">{agent.name}</p><span className={`text-xs font-medium ${agent.status === "online" ? "text-green-600" : agent.status === "away" ? "text-yellow-600" : "text-gray-500"}`}>● {agent.status}</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800"><p className="text-lg font-bold text-gray-900 dark:text-gray-100">{agent.activeChats}</p><p className="text-xs text-gray-500">Active</p></div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800"><p className="text-lg font-bold text-gray-900 dark:text-gray-100">{agent.totalChats}</p><p className="text-xs text-gray-500">Total</p></div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800"><p className="text-lg font-bold text-gray-900 dark:text-gray-100">{agent.satisfaction}%</p><p className="text-xs text-gray-500">Rating</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewingClient(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Client Details</h3>
              <button onClick={() => setViewingClient(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl">{viewingClient.avatar}</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{viewingClient.name}</h4>
                  <p className="text-gray-500">{viewingClient.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-gray-900 dark:text-gray-100">{viewingClient.phone}</p></div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"><p className="text-xs text-gray-500">City</p><p className="font-medium text-gray-900 dark:text-gray-100">{viewingClient.city}</p></div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"><p className="text-xs text-gray-500">Plan</p><p className="font-medium text-gray-900 dark:text-gray-100">{viewingClient.plan}</p></div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"><p className="text-xs text-gray-500">Status</p><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${viewingClient.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{viewingClient.status}</span></div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"><p className="text-xs text-gray-500">Total Chats</p><p className="font-medium text-gray-900 dark:text-gray-100">{viewingClient.chats}</p></div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"><p className="text-xs text-gray-500">Satisfaction</p><p className="font-medium text-gray-900 dark:text-gray-100">{viewingClient.satisfaction}%</p></div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800"><p className="text-xs text-gray-500 mb-1">Member Since</p><p className="font-medium text-gray-900 dark:text-gray-100">{viewingClient.joined}</p></div>
            </div>
          </div>
        </div>
      )}

      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddClient(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add New Client</h3>
              <button onClick={() => setShowAddClient(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="Enter full name" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="email@example.com" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="+91 98765 43210" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={newClient.city} onChange={(e) => setNewClient({ ...newClient, city: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="Enter city" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Plan</label><select value={newClient.plan} onChange={(e) => setNewClient({ ...newClient, plan: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"><option value="Starter">Starter - ₹999/mo</option><option value="Pro">Pro - ₹2,999/mo</option><option value="Business">Business - ₹5,999/mo</option></select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddClient(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Add Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditingClient(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Client</h3>
              <button onClick={() => setEditingClient(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleEditClient} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={editingClient.name} onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={editingClient.email} onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={editingClient.phone} onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={editingClient.city} onChange={(e) => setEditingClient({ ...editingClient, city: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Plan</label><select value={editingClient.plan} onChange={(e) => setEditingClient({ ...editingClient, plan: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"><option value="Starter">Starter</option><option value="Pro">Pro</option><option value="Business">Business</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={editingClient.status} onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"><option value="Active">Active</option><option value="Trial">Trial</option><option value="Inactive">Inactive</option></select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingClient(null)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const mockAgents = [
  { id: "1", name: "Sarah Johnson", status: "online" as const, activeChats: 3, totalChats: 47, avgTime: "2m 15s", satisfaction: 98 },
  { id: "2", name: "Mike Chen", status: "online" as const, activeChats: 2, totalChats: 38, avgTime: "3m 02s", satisfaction: 95 },
  { id: "3", name: "Emily Davis", status: "away" as const, activeChats: 0, totalChats: 29, avgTime: "1m 48s", satisfaction: 97 },
  { id: "4", name: "James Wilson", status: "offline" as const, activeChats: 0, totalChats: 52, avgTime: "2m 31s", satisfaction: 93 },
  { id: "5", name: "AI Receptionist", status: "online" as const, activeChats: 12, totalChats: 340, avgTime: "0m 45s", satisfaction: 91 },
  { id: "6", name: "AI Sales Agent", status: "online" as const, activeChats: 8, totalChats: 215, avgTime: "1m 20s", satisfaction: 88 },
];
