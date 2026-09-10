"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Mail, Phone, CheckCircle2, XCircle, Briefcase, Loader2, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { useAuthStore } from "@/store";

interface Employee {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Workload {
  assignedCustomers: number;
  pendingFollowUps: number;
  todayFollowUps: number;
  completedFollowUps: number;
}

function EmployeesContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workloads, setWorkloads] = useState<Record<string, Workload>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const list: Employee[] = await api.getEmployees();
      setEmployees(list || []);
      const wl: Record<string, Workload> = {};
      await Promise.all(
        (list || []).map(async (e) => {
          try {
            wl[e.id] = await api.getEmployeeWorkload(e.id);
          } catch {
            wl[e.id] = { assignedCustomers: 0, pendingFollowUps: 0, todayFollowUps: 0, completedFollowUps: 0 };
          }
        })
      );
      setWorkloads(wl);
    } catch (err) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = employees.filter(
    (e) => e.name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{employees.length} team members</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66FF]"
          />
        </div>
      </div>

      {loading && employees.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#0A66FF]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 py-16 text-center">
          <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">No employees found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => {
            const wl = workloads[emp.id] || { assignedCustomers: 0, pendingFollowUps: 0, todayFollowUps: 0, completedFollowUps: 0 };
            const isOnline = emp.status === "online";
            return (
              <div key={emp.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#00C6FF] text-white font-semibold flex items-center justify-center">
                      {emp.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-900 ${isOnline ? "bg-emerald-500" : "bg-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{emp.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{emp.role}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  {emp.email && <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" />{emp.email}</p>}
                  {emp.mobile && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" />{emp.mobile}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Customers</p>
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100">{wl.assignedCustomers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                    <p className="text-base font-bold text-amber-600">{wl.pendingFollowUps}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                    <p className="text-base font-bold text-[#0A66FF]">{wl.todayFollowUps}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-base font-bold text-emerald-600">{wl.completedFollowUps}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EmployeesPage() {
  const router = useRouter();
  const { agent } = useAuthStore();

  useEffect(() => {
    if (agent?.role && agent.role !== "admin") {
      router.replace("/client-dashboard");
    }
  }, [agent, router]);

  if (agent?.role && agent.role !== "admin") {
    return null;
  }

  return (
    <DashboardLayout title="Employees" subtitle="Manage your team">
      <BackButton className="mb-3" fallback="/dashboard" />
      <EmployeesContent />
    </DashboardLayout>
  );
}
