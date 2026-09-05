"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Clock, AlertCircle, CheckCircle2, X, Loader2, Calendar, Phone,
  ChevronRight, User, RefreshCw, Filter, Send, Mail, MessageCircle,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";
import { LeadStatusBadge, FollowUpStatusBadge } from "@/components/crm/lead-status";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface FollowUp {
  id: string;
  followUpNumber: number;
  scheduledDate: string;
  status: string;
  notes?: string;
  completedAt?: string;
  sentAt?: string;
  error?: string;
  client: { id: string; name: string; phone?: string; email?: string; city?: string; currentLeadStatus: string };
  assignedEmployee?: { id: string; name: string; email: string };
  sentBy?: { id: string; name: string };
  cycle: { id: string; status: string; purchaseId: string };
}

interface FollowUpStats {
  pending: number;
  sent: number;
  failed: number;
  completed: number;
  todayDue: number;
  overdue: number;
}

type FilterType = "today" | "due-soon" | "upcoming" | "overdue" | "pending" | "sent" | "failed" | "completed" | "all";

export default function FollowUpsPage() {
  return (
    <RoleGuard allow={["agent", "admin"]} fallback="/client-dashboard">
      <FollowUpsPageInner />
    </RoleGuard>
  );
}

function FollowUpsPageInner() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [stats, setStats] = useState<FollowUpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("today");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sendChannel, setSendChannel] = useState<Record<string, "whatsapp" | "sms" | "email">>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "today") params.today = true;
      else if (filter === "overdue") params.overdue = true;
      else if (filter === "upcoming") params.upcoming = true;
      else if (filter === "pending") params.status = "PENDING";
      else if (filter === "sent") params.status = "SENT";
      else if (filter === "failed") params.status = "FAILED";
      else if (filter === "completed") params.status = "COMPLETED";

      const [list, s] = await Promise.all([
        api.getFollowUps(params),
        api.getFollowUpStats().catch(() => null),
      ]);
      setItems(list || []);
      if (s) setStats(s);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const complete = async (id: string) => {
    setBusyId(id);
    try {
      await api.completeFollowUp(id);
      await load();
    } catch (err) {} finally { setBusyId(null); }
  };

  const skip = async (id: string) => {
    setBusyId(id);
    try {
      await api.skipFollowUp(id);
      await load();
    } catch (err) {} finally { setBusyId(null); }
  };

  const sendNow = async (id: string) => {
    setBusyId(id);
    try {
      const channel = sendChannel[id];
      await api.sendFollowUp(id, channel);
      await load();
    } catch (err) {} finally { setBusyId(null); }
  };

  const getCountdown = (scheduledDate: string, status: string) => {
    if (status !== "PENDING") return null;
    const now = new Date();
    const due = new Date(scheduledDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      const overdueHours = Math.abs(diffHours);
      if (overdueDays > 0) return { text: `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`, color: "text-rose-600 dark:text-rose-400" };
      return { text: `Overdue by ${overdueHours} hour${overdueHours > 1 ? "s" : ""}`, color: "text-rose-600 dark:text-rose-400" };
    }
    if (diffDays === 0) return { text: `Due in ${diffHours} hour${diffHours > 1 ? "s" : ""}`, color: "text-amber-600 dark:text-amber-400" };
    if (diffDays === 1) return { text: "Due tomorrow", color: "text-amber-600 dark:text-amber-400" };
    return { text: `Due in ${diffDays} days`, color: "text-blue-600 dark:text-blue-400" };
  };

  const total = stats ? stats.pending + stats.sent + stats.failed + stats.completed : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Follow-ups</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage customer follow-ups and send messages</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          <StatCard label="Total" value={total} accent="gray" />
          <StatCard label="Pending" value={stats.pending} accent="blue" />
          <StatCard label="Due Today" value={stats.todayDue} accent="amber" />
          <StatCard label="Overdue" value={stats.overdue} accent="rose" />
          <StatCard label="Sent" value={stats.sent} accent="emerald" />
          <StatCard label="Failed" value={stats.failed} accent="red" />
          <StatCard label="Completed" value={stats.completed} accent="green" />
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <FilterChip active={filter === "today"} onClick={() => setFilter("today")}>Due Today</FilterChip>
        <FilterChip active={filter === "due-soon"} onClick={() => setFilter("due-soon")}>Due Soon</FilterChip>
        <FilterChip active={filter === "upcoming"} onClick={() => setFilter("upcoming")}>Upcoming</FilterChip>
        <FilterChip active={filter === "overdue"} onClick={() => setFilter("overdue")}>Overdue</FilterChip>
        <FilterChip active={filter === "pending"} onClick={() => setFilter("pending")}>Pending</FilterChip>
        <FilterChip active={filter === "sent"} onClick={() => setFilter("sent")}>Sent</FilterChip>
        <FilterChip active={filter === "failed"} onClick={() => setFilter("failed")}>Failed</FilterChip>
        <FilterChip active={filter === "completed"} onClick={() => setFilter("completed")}>Completed</FilterChip>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#0A66FF]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">All caught up!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No follow-ups matching this filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((f) => {
              const countdown = getCountdown(f.scheduledDate, f.status);
              const isPending = f.status === "PENDING";
              const isProcessing = f.status === "PROCESSING";
              const date = new Date(f.scheduledDate);

              return (
                <div key={f.id} className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <Link href={`/customers/${f.client.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#00C6FF] text-white font-semibold flex items-center justify-center">
                          {f.client.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white dark:bg-gray-900 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-[10px] font-bold text-[#0A66FF]">
                          {f.followUpNumber}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-[#0A66FF] transition-colors truncate">{f.client.name}</p>
                          <LeadStatusBadge status={f.client.currentLeadStatus} />
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {f.client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{f.client.phone}</span>}
                          {f.client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{f.client.email}</span>}
                          {f.assignedEmployee && <span className="flex items-center gap-1"><User className="h-3 w-3" />{f.assignedEmployee.name}</span>}
                        </div>
                      </div>
                    </Link>
                    <div className="text-right shrink-0 sm:ml-3">
                      <p className={`text-sm font-semibold ${countdown?.color || "text-gray-700 dark:text-gray-300"}`}>
                        {countdown?.text || date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <FollowUpStatusBadge status={f.status} className="mt-1" />
                      {f.sentAt && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Sent {new Date(f.sentAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          {f.sentBy && ` by ${f.sentBy.name}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {isPending && (
                    <div className="mt-3 sm:ml-13 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={sendChannel[f.id] || ""}
                          onChange={(e) => setSendChannel({ ...sendChannel, [f.id]: e.target.value as any })}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Auto channel</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                          <option value="email">Email</option>
                        </select>
                        <button
                          onClick={() => sendNow(f.id)}
                          disabled={busyId === f.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0A66FF] text-white text-sm font-semibold hover:bg-[#0952CC] disabled:opacity-60"
                        >
                          {busyId === f.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Send Now
                        </button>
                        <button onClick={() => complete(f.id)} disabled={busyId === f.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">
                          <CheckCircle2 className="h-4 w-4" /> Complete
                        </button>
                        <button onClick={() => skip(f.id)} disabled={busyId === f.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60">
                          <X className="h-4 w-4" /> Skip
                        </button>
                        <Link href={`/customers/${f.client.id}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#0A66FF] hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          View <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {f.status === "SENT" && (
                    <div className="mt-3 sm:ml-13 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Sent successfully
                    </div>
                  )}

                  {f.status === "FAILED" && (
                    <div className="mt-3 sm:ml-13 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {f.error || "Failed to send"}
                    </div>
                  )}

                  {f.notes && f.status !== "PENDING" && (
                    <div className="mt-2 sm:ml-13 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 italic">
                      &ldquo;{f.notes}&rdquo;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: "gray" | "amber" | "rose" | "blue" | "emerald" | "red" | "green" }) {
  const colors: Record<string, string> = {
    gray: "text-gray-600 dark:text-gray-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-600 dark:text-red-400",
    green: "text-green-600 dark:text-green-400",
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[accent] || colors.gray}`}>{value}</p>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
        active
          ? "bg-[#0A66FF] text-white"
          : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
