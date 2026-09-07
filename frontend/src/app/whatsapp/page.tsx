"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { api } from "@/lib/api";
import { MessageSquare, Send, CheckCheck, Check, Reply, Bot, Plus, Search, Filter, MoreVertical, Eye, Play, Clock, Users, TrendingUp, Zap, ArrowUpRight, ArrowDownRight, X, Mail, Phone, RefreshCw } from "lucide-react";

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "campaigns" | "ai-replies" | "live-handover">("overview");
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWhatsAppConversations();
      const items = (data?.items || []) as any[];
      setConversations(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load WhatsApp data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const totalMessages = conversations.reduce((sum, c) => sum + (c.unreadCount || 0) + (c.messages?.length || 0), 0);
  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const openCount = conversations.filter((c) => c.status === "OPEN").length;
  const unassignedCount = conversations.filter((c) => c.isUnassigned).length;

  const stats = [
    { title: "Total Conversations", value: conversations.length.toString(), change: "+0%", icon: MessageSquare, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600" },
    { title: "Open", value: openCount.toString(), change: "+0%", icon: Play, color: "bg-green-50 dark:bg-green-900/20 text-green-600" },
    { title: "Unread", value: unreadCount.toString(), change: "+0%", icon: Clock, color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600" },
    { title: "Unassigned", value: unassignedCount.toString(), change: "+0%", icon: Users, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
  ];

  return (
    <DashboardLayout title="WhatsApp Automation" subtitle="Manage broadcasts, templates, and AI replies">
      <BackButton className="mb-3" />
      {loading && <div className="text-sm text-gray-500 mb-4">Loading conversations...</div>}
      {error && <div className="text-sm text-red-600 mb-4">{error} <button onClick={loadConversations} className="underline ml-2">Retry</button></div>}
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>{Icon && <Icon className="w-5 h-5" />}</div>
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["templates", "Templates"], ["campaigns", "Campaigns"], ["ai-replies", "AI Replies"], ["live-handover", "Live Handover"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-brand-600" />Recent Conversations</h3>
              {conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.slice(0, 5).map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{conv.remoteName || conv.remotePhone}</p>
                        <p className="text-xs text-gray-500">{conv.lastMessagePreview || "No messages"}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${conv.status === "OPEN" ? "bg-green-100 text-green-700" : conv.status === "UNASSIGNED" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{conv.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No conversations yet</div>
              )}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-brand-600" />Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1"><span className="font-medium text-gray-700 dark:text-gray-300">Open Conversations</span><span className="text-gray-900 dark:text-gray-100 font-semibold">{openCount}</span></div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-brand-600 h-2 rounded-full" style={{ width: `${conversations.length > 0 ? (openCount / conversations.length) * 100 : 0}%` }} /></div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1"><span className="font-medium text-gray-700 dark:text-gray-300">Unassigned Leads</span><span className="text-gray-900 dark:text-gray-100 font-semibold">{unassignedCount}</span></div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${conversations.length > 0 ? (unassignedCount / conversations.length) * 100 : 0}%` }} /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Message Templates</h3>
              <button onClick={() => setShowCreateTemplate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />Create Template</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { id: "1", name: "Welcome", status: "Active", usage: 0 },
                    { id: "2", name: "Offer", status: "Active", usage: 0 },
                    { id: "3", name: "Follow-up", status: "Active", usage: 0 },
                    { id: "4", name: "Feedback", status: "Active", usage: 0 },
                  ].map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{template.name}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${template.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{template.status}</span></td>
                      <td className="px-4 py-3 text-gray-600">{template.usage.toLocaleString()}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Eye className="w-4 h-4 text-gray-500" /></button><button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical className="w-4 h-4 text-gray-500" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Campaigns</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Campaign</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Read</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Replies</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {conversations.length > 0 ? (
                    conversations.slice(0, 10).map((conv, idx) => (
                      <tr key={conv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{conv.remoteName || conv.remotePhone}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${conv.status === "OPEN" ? "bg-green-100 text-green-700" : conv.status === "UNASSIGNED" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{conv.status}</span></td>
                        <td className="px-4 py-3 text-gray-600">{conv.messages?.length || 0}</td>
                        <td className="px-4 py-3 text-gray-600">{conv.unreadCount || 0}</td>
                        <td className="px-4 py-3 text-gray-600">0</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500 text-sm">No campaigns or conversations yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "ai-replies" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <p className="text-sm text-gray-500 mb-1">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{conversations.length}</p>
                <div className="mt-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-brand-600 h-2 rounded-full" style={{ width: `${conversations.length > 0 ? 50 : 0}%` }} /></div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <p className="text-sm text-gray-500 mb-1">Unassigned Leads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{unassignedCount}</p>
                <div className="mt-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${conversations.length > 0 ? (unassignedCount / conversations.length) * 100 : 0}%` }} /></div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <p className="text-sm text-gray-500 mb-1">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalMessages}</p>
                <div className="mt-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${conversations.length > 0 ? 75 : 0}%` }} /></div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Conversations</h3>
              {conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.slice(0, 5).map((conv) => (
                    <div key={conv.id} className="flex items-start justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{conv.remoteName || conv.remotePhone}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conv.isUnassigned ? "bg-yellow-100 text-yellow-700" : "bg-brand-100 text-brand-700"}`}>{conv.isUnassigned ? "Unassigned" : "Assigned"}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{conv.lastMessagePreview || "No messages"}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{new Date(conv.lastMessageAt || conv.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No conversations yet</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "live-handover" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Live Agent Status</h3>
              <span className="flex items-center gap-2 text-sm text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{openCount} Open</span>
            </div>
            {conversations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unread</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Message</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {conversations.slice(0, 20).map((conv) => (
                      <tr key={conv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{(conv.remoteName || conv.remotePhone || "?")[0]}</div><span className="font-medium text-gray-900 dark:text-gray-100">{conv.remoteName || conv.remotePhone}</span></div></td>
                        <td className="px-4 py-3"><span className={`flex items-center gap-1.5 text-xs font-medium ${conv.status === "OPEN" ? "text-green-600" : conv.status === "UNASSIGNED" ? "text-yellow-600" : "text-gray-500"}`}><span className={`w-2 h-2 rounded-full ${conv.status === "OPEN" ? "bg-green-500" : conv.status === "UNASSIGNED" ? "bg-yellow-500" : "bg-gray-400"}`} />{conv.status}</span></td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{conv.unreadCount || 0}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{conv.lastMessagePreview || "-"}</td>
                        <td className="px-4 py-3"><button className="text-brand-600 text-sm font-medium hover:text-brand-700">View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">No conversations yet</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
