"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { MessageSquare, Send, CheckCheck, Check, Reply, Bot, Plus, Search, Filter, MoreVertical, Eye, Play, Clock, Users, TrendingUp, Zap, ArrowUpRight, ArrowDownRight, X, Mail, Phone, RefreshCw } from "lucide-react";

const mockWhatsAppStats = [
  { title: "Messages Sent", value: "12,847", change: "+18%", icon: Send, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600" },
  { title: "Delivered", value: "12,632", change: "+15%", icon: CheckCheck, color: "bg-green-50 dark:bg-green-900/20 text-green-600" },
  { title: "Read", value: "11,945", change: "+22%", icon: Check, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
  { title: "Replied", value: "4,218", change: "+12%", icon: Reply, color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600" },
];

const mockTemplates = [
  { id: "1", name: "Welcome", status: "Active", usage: 3420 },
  { id: "2", name: "Offer", status: "Active", usage: 2890 },
  { id: "3", name: "Festival", status: "Active", usage: 1567 },
  { id: "4", name: "Birthday", status: "Active", usage: 890 },
  { id: "5", name: "Anniversary", status: "Active", usage: 654 },
  { id: "6", name: "Invoice", status: "Active", usage: 1234 },
  { id: "7", name: "Payment Reminder", status: "Active", usage: 2100 },
  { id: "8", name: "Order Tracking", status: "Active", usage: 1890 },
  { id: "9", name: "Coupon", status: "Draft", usage: 0 },
  { id: "10", name: "Feedback", status: "Active", usage: 760 },
  { id: "11", name: "Review", status: "Active", usage: 540 },
];

const mockCampaigns = [
  { id: "C001", name: "Diwali Sale 2026", status: "Active", sent: 5430, read: 4890, reply: 1240, date: "25 Aug 2026" },
  { id: "C002", name: "New Year Offer", status: "Scheduled", sent: 0, read: 0, reply: 0, date: "01 Jan 2027" },
  { id: "C003", name: "Winback - Inactive", status: "Completed", sent: 3200, read: 2100, reply: 450, date: "15 Aug 2026" },
  { id: "C004", name: "Birthday Month", status: "Active", sent: 890, read: 760, reply: 340, date: "20 Aug 2026" },
  { id: "C005", name: "Feedback Request", status: "Paused", sent: 1200, read: 980, reply: 210, date: "10 Aug 2026" },
];

const mockAIReplyStats = [
  { label: "Auto Replied", value: "3,420", percent: 81 },
  { label: "Human Handled", value: "798", percent: 19 },
  { label: "Avg Response", value: "1.2s", percent: 0 },
];

const mockAIReplyLogs = [
  { id: "1", customer: "Rahul Verma", message: "What are your timings?", reply: "We are open 10 AM to 8 PM, Mon-Sat.", time: "2 min ago", type: "auto" },
  { id: "2", customer: "Priya Sharma", message: "I want to book an appointment", reply: "Sure! Please share your preferred date and time.", time: "5 min ago", type: "auto" },
  { id: "3", customer: "Amit Kumar", message: "Do you offer home delivery?", reply: "Yes, we deliver within 5km radius for orders above ₹500.", time: "8 min ago", type: "auto" },
  { id: "4", customer: "Neha Patel", message: "Can I get a refund?", reply: "Let me connect you with our support team.", time: "12 min ago", type: "handover" },
  { id: "5", customer: "Vikram Singh", message: "Thanks for the great service!", reply: "Thank you! We appreciate your feedback.", time: "15 min ago", type: "auto" },
];

const mockLiveHandover = [
  { id: "1", agent: "Sarah Johnson", status: "online", activeChats: 3, queue: 1 },
  { id: "2", agent: "Mike Chen", status: "online", activeChats: 2, queue: 0 },
  { id: "3", agent: "Emily Davis", status: "away", activeChats: 1, queue: 2 },
  { id: "4", agent: "James Wilson", status: "offline", activeChats: 0, queue: 0 },
];

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "campaigns" | "ai-replies" | "live-handover">("overview");
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  return (
    <DashboardLayout title="WhatsApp Automation" subtitle="Manage broadcasts, templates, and AI replies">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockWhatsAppStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}><Icon className="w-5 h-5" /></div>
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["templates", "Templates"], ["campaigns", "Campaigns"], ["ai-replies", "AI Replies"], ["live-handover", "Live Handover"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-brand-600" />Recent Campaigns</h3>
              <div className="space-y-3">
                {mockCampaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{campaign.name}</p>
                      <p className="text-xs text-gray-500">Sent: {campaign.sent.toLocaleString()} · Read: {campaign.read.toLocaleString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${campaign.status === "Active" ? "bg-green-100 text-green-700" : campaign.status === "Scheduled" ? "bg-blue-100 text-blue-700" : campaign.status === "Completed" ? "bg-gray-100 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>{campaign.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-brand-600" />AI Reply Performance</h3>
              <div className="space-y-4">
                {mockAIReplyStats.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">{item.value}</span>
                    </div>
                    {item.percent > 0 && <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5"><div className="bg-brand-600 h-2.5 rounded-full" style={{ width: `${item.percent}%` }} /></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
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
                  {mockTemplates.map((template) => (
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

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Campaigns</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Campaign</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Read</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Replies</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{campaign.name}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${campaign.status === "Active" ? "bg-green-100 text-green-700" : campaign.status === "Scheduled" ? "bg-blue-100 text-blue-700" : campaign.status === "Completed" ? "bg-gray-100 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>{campaign.status}</span></td>
                      <td className="px-4 py-3 text-gray-600">{campaign.sent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{campaign.read.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{campaign.reply.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{campaign.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Replies Tab */}
        {activeTab === "ai-replies" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockAIReplyStats.slice(0, 2).map((item) => (
                <div key={item.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                  <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                  <div className="mt-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="bg-brand-600 h-2 rounded-full" style={{ width: `${item.percent}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent AI Replies</h3>
              <div className="space-y-3">
                {mockAIReplyLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{log.customer}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.type === "auto" ? "bg-brand-100 text-brand-700" : "bg-yellow-100 text-yellow-700"}`}>{log.type === "auto" ? "AI Auto" : "Human Handover"}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Customer: {log.message}</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">Reply: {log.reply}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Handover Tab */}
        {activeTab === "live-handover" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Live Agent Status</h3>
              <span className="flex items-center gap-2 text-sm text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />3 Online</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Chats</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Queue</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockLiveHandover.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{agent.agent.split(" ").map(n => n[0]).join("")}</div><span className="font-medium text-gray-900 dark:text-gray-100">{agent.agent}</span></div></td>
                      <td className="px-4 py-3"><span className={`flex items-center gap-1.5 text-xs font-medium ${agent.status === "online" ? "text-green-600" : agent.status === "away" ? "text-yellow-600" : "text-gray-500"}`}><span className={`w-2 h-2 rounded-full ${agent.status === "online" ? "bg-green-500" : agent.status === "away" ? "bg-yellow-500" : "bg-gray-400"}`} />{agent.status}</span></td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{agent.activeChats}</td>
                      <td className="px-4 py-3 text-gray-600">{agent.queue}</td>
                      <td className="px-4 py-3"><button className="text-brand-600 text-sm font-medium hover:text-brand-700">Assign Chat</button></td>
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
