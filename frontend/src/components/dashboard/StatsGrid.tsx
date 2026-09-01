"use client";
import React from "react";
import { MessageCircle, Users, Clock, CheckCircle2, TrendingUp, HardDrive, Activity, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps { title: string; value: string | number; icon: React.ReactNode; trend?: { value: number; isPositive: boolean }; color: string; }

export function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={cn("w-3 h-3", trend.isPositive ? "text-green-500" : "text-red-500 rotate-180")} />
              <span className={cn("text-xs font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>{trend.value}%</span>
              <span className="text-xs text-gray-400">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", color)}>{icon}</div>
      </div>
    </div>
  );
}

interface StatsGridProps { stats: { totalVisitors: number; activeChats: number; closedChatsToday: number; onlineAgents: number; totalMessages: number; storageUsedMB: number; avgResponseTimeSec: number; satisfactionRate: number; }; }

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    { title: "Total Visitors", value: stats.totalVisitors, icon: <Users className="w-6 h-6 text-blue-600" />, color: "bg-blue-100 dark:bg-blue-900/30", trend: { value: 12, isPositive: true } },
    { title: "Active Chats", value: stats.activeChats, icon: <MessageCircle className="w-6 h-6 text-green-600" />, color: "bg-green-100 dark:bg-green-900/30" },
    { title: "Closed Today", value: stats.closedChatsToday, icon: <CheckCircle2 className="w-6 h-6 text-purple-600" />, color: "bg-purple-100 dark:bg-purple-900/30" },
    { title: "Online Agents", value: stats.onlineAgents, icon: <Activity className="w-6 h-6 text-orange-600" />, color: "bg-orange-100 dark:bg-orange-900/30" },
    { title: "Total Messages", value: stats.totalMessages, icon: <MessageCircle className="w-6 h-6 text-indigo-600" />, color: "bg-indigo-100 dark:bg-indigo-900/30", trend: { value: 8, isPositive: true } },
    { title: "Storage Used", value: `${stats.storageUsedMB.toFixed(1)} MB`, icon: <HardDrive className="w-6 h-6 text-gray-600" />, color: "bg-gray-100 dark:bg-gray-800" },
    { title: "Avg Response Time", value: `${stats.avgResponseTimeSec}s`, icon: <Clock className="w-6 h-6 text-yellow-600" />, color: "bg-yellow-100 dark:bg-yellow-900/30", trend: { value: 5, isPositive: false } },
    { title: "Satisfaction Rate", value: `${stats.satisfactionRate}%`, icon: <Star className="w-6 h-6 text-pink-600" />, color: "bg-pink-100 dark:bg-pink-900/30", trend: { value: 3, isPositive: true } },
  ];
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{cards.map((card) => <StatCard key={card.title} {...card} />)}</div>;
}
