"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, UserPlus, IndianRupee, Clock, TrendingUp, CheckCircle2,
  Flame, Snowflake, XCircle, ArrowRight, Calendar, Phone, Loader2, MessageCircle,
} from "lucide-react";
import { useAuthStore } from "@/store";
import api from "@/lib/api";
import { LeadStatusBadge, FollowUpStatusBadge } from "@/components/crm/lead-status";

interface CustomerStats {
  total: number;
  todayNew: number;
  hot: number;
  cold: number;
  notInterested: number;
  pendingFollowUps: number;
}
interface SalesStats {
  totalSales: number;
  todaySales: number;
  todayPurchaseCount: number;
  totalPurchaseCount: number;
}
interface FollowUpStats {
  pending: number;
  completed: number;
  todayDue: number;
  overdue: number;
}
interface TodayFollowUp {
  id: string;
  followUpNumber: number;
  scheduledDate: string;
  status: string;
  client: { id: string; name: string; phone?: string; currentLeadStatus: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const { agent } = useAuthStore();
  const [customerStats, setCustomerStats] = useState<CustomerStats>({ total: 0, todayNew: 0, hot: 0, cold: 0, notInterested: 0, pendingFollowUps: 0 });
  const [salesStats, setSalesStats] = useState<SalesStats>({ totalSales: 0, todaySales: 0, todayPurchaseCount: 0, totalPurchaseCount: 0 });
  const [followUpStats, setFollowUpStats] = useState<FollowUpStats>({ pending: 0, completed: 0, todayDue: 0, overdue: 0 });
  const [todayFollowUps, setTodayFollowUps] = useState<TodayFollowUp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agent?.role && agent.role !== "admin") {
      router.replace("/client-dashboard");
    }
  }, [agent, router]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cs, ss, fs, tf] = await Promise.all([
        api.getCustomerStats().catch(() => null),
        api.getSalesStats().catch(() => null),
        api.getFollowUpStats().catch(() => null),
        api.getFollowUps({ today: true }).catch(() => []),
      ]);
      if (cs) setCustomerStats(cs);
      if (ss) setSalesStats(ss);
      if (fs) setFollowUpStats(fs);
      setTodayFollowUps(Array.isArray(tf) ? tf : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your business at a glance</p>
        </div>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-[#0A66FF]" />}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-400">
          {error}
          <button onClick={load} className="ml-2 font-semibold underline">Retry</button>
        </div>
      )}

      {/* Top stats - ALWAYS rendered with current values, no full loading state */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Total Customers"
          value={customerStats.total}
          hint={`+${customerStats.todayNew} today`}
          icon={<Users className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          label="Total Sales"
          value={`₹${salesStats.totalSales.toLocaleString("en-IN")}`}
          hint={`+₹${salesStats.todaySales.toLocaleString("en-IN")} today`}
          icon={<IndianRupee className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Today's Follow-ups"
          value={followUpStats.todayDue}
          hint={`${followUpStats.overdue} overdue`}
          icon={<Clock className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          label="Completed"
          value={followUpStats.completed}
          hint="All-time"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
        />
      </div>

      {/* Lead stats - ALWAYS rendered */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <LeadStatCard label="Hot Lead" value={customerStats.hot} icon={<Flame className="h-5 w-5" />} color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-900/20" />
        <LeadStatCard label="Cold Lead" value={customerStats.cold} icon={<Snowflake className="h-5 w-5" />} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" />
        <LeadStatCard label="Not Interested" value={customerStats.notInterested} icon={<XCircle className="h-5 w-5" />} color="text-gray-600 dark:text-gray-400" bg="bg-gray-100 dark:bg-gray-800" />
      </div>

      {/* Today's Follow-ups - always shows structure, only list changes */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Today&apos;s Follow-ups</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{todayFollowUps.length} tasks due</p>
          </div>
          <Link href="/follow-ups" className="inline-flex items-center gap-1 text-sm font-medium text-[#0A66FF] hover:text-[#0952CC]">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div>
          {todayFollowUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">All clear!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No follow-ups due today</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {todayFollowUps.slice(0, 10).map((f) => (
                <Link key={f.id} href={`/customers/${f.client.id}`} className="flex items-center gap-3 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#00C6FF] text-white font-semibold text-sm flex items-center justify-center shrink-0">
                    {f.client.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{f.client.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                      {f.client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{f.client.phone}</span>}
                      <span>Follow-up {f.followUpNumber}</span>
                    </p>
                  </div>
                  <LeadStatusBadge status={f.client.currentLeadStatus} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <QuickLink href="/customers" label="All Customers" icon={<Users className="h-4 w-4" />} />
        <QuickLink href="/follow-ups" label="Follow-ups" icon={<Clock className="h-4 w-4" />} />
        <QuickLink href="/chats" label="Live Chats" icon={<MessageCircle className="h-4 w-4" />} />
        <QuickLink href="/employees" label="Employees" icon={<UserPlus className="h-4 w-4" />} />
      </div>
      </div>
  );
}

function StatCard({ label, value, hint, icon, accent }: { label: string; value: any; hint?: string; icon: React.ReactNode; accent: "blue" | "emerald" | "amber" }) {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  }[accent];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${colors} text-white flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function LeadStatCard({ label, value, icon, color, bg }: { label: string; value: number; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4 border border-gray-200 dark:border-gray-800`}>
      <div className="flex items-center gap-2">
        <div className={color}>{icon}</div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      </div>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[#0A66FF] hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#0A66FF] flex items-center justify-center group-hover:bg-[#0A66FF] group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#0A66FF] transition-colors" />
    </Link>
  );
}
