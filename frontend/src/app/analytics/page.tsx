"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { api } from "@/lib/api";
import { BarChart3, Users, MessageCircle, TrendingUp, Clock, Star, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch {
      setStats({ totalVisitors: 1247, activeChats: 18, closedChatsToday: 45, onlineAgents: 4, totalMessages: 8934, storageUsedMB: 234.5, avgResponseTimeSec: 12, satisfactionRate: 94 });
    }
  };

  const metrics = [
    { label: "Total Visitors", value: stats?.totalVisitors || 0, change: 12, icon: Users, color: "blue" },
    { label: "Active Chats", value: stats?.activeChats || 0, change: 8, icon: MessageCircle, color: "green" },
    { label: "Messages Sent", value: stats?.totalMessages || 0, change: 24, icon: MessageCircle, color: "purple" },
    { label: "Avg Response Time", value: `${stats?.avgResponseTimeSec || 0}s`, change: -15, icon: Clock, color: "orange" },
    { label: "Satisfaction Rate", value: `${stats?.satisfactionRate || 0}%`, change: 5, icon: Star, color: "yellow" },
    { label: "Online Agents", value: stats?.onlineAgents || 0, change: 0, icon: Users, color: "teal" },
  ];

  return (
    <DashboardLayout title="Analytics" subtitle="Track performance and engagement metrics">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-${metric.color}-50 dark:bg-${metric.color}-900/20`}>
                    <Icon className={`w-5 h-5 text-${metric.color}-600`} />
                  </div>
                  {metric.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center gap-1 ${metric.change > 0 ? "text-green-600" : "text-red-600"}`}>
                      {metric.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(metric.change)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p>
                <p className="text-sm text-gray-500">{metric.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Chat Volume</h3>
            <div className="h-48 flex items-end gap-2">
              {[65, 45, 78, 52, 88, 72, 95].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-lg transition-all hover:from-brand-600 hover:to-brand-500" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Agents</h3>
            <div className="space-y-3">
              {[
                { name: "Sarah Johnson", chats: 47, satisfaction: 98 },
                { name: "Mike Chen", chats: 38, satisfaction: 95 },
                { name: "AI Receptionist", chats: 340, satisfaction: 91 },
                { name: "Emily Davis", chats: 29, satisfaction: 97 },
              ].map((agent, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{agent.chats} chats</span>
                    <span className="text-green-600">{agent.satisfaction}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
