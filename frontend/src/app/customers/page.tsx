"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus, Search, Filter, Users, Phone, MapPin, Mail, Loader2,
  ChevronRight, IndianRupee, Calendar, AlertCircle, RefreshCw,
  Edit, Trash2, X, Check,
} from "lucide-react";
import api from "@/lib/api";
import { LeadStatusBadge, FollowUpStatusBadge, LeadStatus, FOLLOW_UP_STATUS_COLORS } from "@/components/crm/lead-status";
import { AddCustomerModal } from "@/components/crm/AddCustomerModal";
import { EditCustomerModal } from "@/components/crm/EditCustomerModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type FilterKey = "" | "new" | "active" | "vip" | "hot" | "cold" | "not_interested";

const FILTERS: { key: FilterKey; label: string; params: { leadStatus?: string; status?: string; plan?: string; isNew?: boolean } }[] = [
  { key: "", label: "All", params: {} },
  { key: "new", label: "New", params: { isNew: true } },
  { key: "active", label: "Active", params: { status: "Active" } },
  { key: "vip", label: "VIP", params: { plan: "VIP" } },
  { key: "hot", label: "Hot", params: { leadStatus: "HOT_LEAD" } },
  { key: "cold", label: "Cold", params: { leadStatus: "COLD_LEAD" } },
  { key: "not_interested", label: "Not Interested", params: { leadStatus: "NOT_INTERESTED" } },
];

function filterKeyToParams(key: FilterKey) {
  return FILTERS.find((f) => f.key === key)?.params || {};
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  currentLeadStatus: string;
  assignedEmployeeId?: string;
  assignedEmployee?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  purchases: Array<{ id: string; purchaseAmount: number; productDetails?: string; purchaseDate: string }>;
  followUps: Array<{
    id: string;
    followUpNumber: number;
    scheduledDate: string;
    status: string;
    cycle: { id: string; status: string };
  }>;
}

interface CustomerStats {
  total: number;
  todayNew: number;
  hot: number;
  cold: number;
  notInterested: number;
  active?: number;
  vip?: number;
  pendingFollowUps: number;
}

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("filter") || "") as FilterKey;
  const [filter, setFilter] = useState<FilterKey>(initialFilter);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteResult, setBulkDeleteResult] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Keep state in sync with URL (browser back/forward + dashboard navigation)
  useEffect(() => {
    const f = (searchParams.get("filter") || "") as FilterKey;
    setFilter(f);
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filterKeyToParams(filter);
      const [listRes, statsRes] = await Promise.all([
        api.getCustomers({ search: search || undefined, ...params, take: 100 }),
        api.getCustomerStats().catch(() => null),
      ]);
      setCustomers(listRes.items || []);
      setTotal(listRes.total || 0);
      if (statsRes) setStats(statsRes);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} {total === 1 ? "customer" : "customers"}
            {filter ? ` · ${FILTERS.find((f) => f.key === filter)?.label ?? filter}` : ""}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
            >
              <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:bg-[#0952CC] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} accent="slate" />
          <StatCard label="New Today" value={stats.todayNew} accent="blue" />
          <StatCard label="Active" value={stats.active ?? 0} accent="emerald" />
          <StatCard label="VIP" value={stats.vip ?? 0} accent="purple" />
          <StatCard label="Hot Lead" value={stats.hot} accent="red" />
          <StatCard label="Cold Lead" value={stats.cold} accent="blue" />
          <StatCard label="Not Interested" value={stats.notInterested} accent="gray" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66FF] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <FilterChip key={f.key || "all"} active={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </FilterChip>
            ))}
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading && customers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#0A66FF]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p>
            <button onClick={load} className="mt-3 text-sm text-[#0A66FF] font-medium">Try again</button>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-[#0A66FF]" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">No customers yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Add your first customer to start tracking purchases and follow-ups.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:bg-[#0952CC]"
            >
              <Plus className="h-4 w-4" /> Add Customer
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-3 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={customers.length > 0 && selectedIds.size === customers.length}
                        ref={(el) => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < customers.length; }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(customers.map((c) => c.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#0A66FF] focus:ring-[#0A66FF] cursor-pointer"
                      />
                    </th>
                    <Th>Customer</Th>
                    <Th>Contact</Th>
                    <Th>Latest Purchase</Th>
                    <Th>Status</Th>
                    <Th>Next Follow-up</Th>
                    <Th>Assigned</Th>
                    <Th>{""}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {customers.map((c) => (
                    <CustomerRow
                      key={c.id}
                      customer={c}
                      selected={selectedIds.has(c.id)}
                      onToggleSelect={() => {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(c.id)) next.delete(c.id);
                          else next.add(c.id);
                          return next;
                        });
                      }}
                      onEdit={() => setEditingCustomer(c)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {customers.map((c) => (
                <CustomerCard
                  key={c.id}
                  customer={c}
                  selected={selectedIds.has(c.id)}
                  onToggleSelect={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.id)) next.delete(c.id);
                      else next.add(c.id);
                      return next;
                    });
                  }}
                  onEdit={() => setEditingCustomer(c)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}

      {editingCustomer && (
        <EditCustomerModal
          customer={{
            id: editingCustomer.id,
            name: editingCustomer.name,
            phone: editingCustomer.phone || "",
            email: editingCustomer.email,
            city: editingCustomer.city,
            source: (editingCustomer as any).source,
            status: (editingCustomer as any).status,
            notes: (editingCustomer as any).notes,
          }}
          onClose={() => setEditingCustomer(null)}
          onUpdated={() => {
            setEditingCustomer(null);
            load();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        title="Delete Selected Customers"
        message={`Are you sure you want to delete ${selectedIds.size} customer${selectedIds.size === 1 ? "" : "s"}? This will also remove their follow-ups, purchases, and related data. This action cannot be undone.`}
        confirmText={bulkDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isLoading={bulkDeleting}
        onConfirm={async () => {
          setBulkDeleting(true);
          setBulkDeleteResult(null);
          try {
            const ids = Array.from(selectedIds);
            const res = await api.bulkDeleteCustomers(ids);
            setBulkDeleteResult(
              `Deleted ${res.success} of ${res.total} customers. ${res.failed > 0 ? `${res.failed} failed.` : ""}`
            );
            setSelectedIds(new Set());
            await load();
            setTimeout(() => setShowBulkDeleteConfirm(false), 1500);
          } catch (e: any) {
            setBulkDeleteResult(e?.response?.data?.message?.message || e?.message || "Bulk delete failed");
          } finally {
            setBulkDeleting(false);
          }
        }}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />

      {bulkDeleteResult && !showBulkDeleteConfirm && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-gray-900 text-white text-sm shadow-lg flex items-center gap-2">
          {bulkDeleteResult}
          <button onClick={() => setBulkDeleteResult(null)} className="p-0.5 rounded hover:bg-white/10">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: "slate" | "blue" | "red" | "gray" | "emerald" | "purple" }) {
  const colors = {
    slate: "text-slate-700 dark:text-slate-300",
    blue: "text-blue-600 dark:text-blue-400",
    red: "text-red-600 dark:text-red-400",
    gray: "text-gray-600 dark:text-gray-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    purple: "text-purple-600 dark:text-purple-400",
  }[accent];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors}`}>{value}</p>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-[#0A66FF] text-white"
          : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function CustomerRow({ customer: c, selected, onToggleSelect, onEdit }: { customer: Customer; selected: boolean; onToggleSelect: () => void; onEdit: () => void }) {
  const latestPurchase = c.purchases?.[0];
  const nextFollowUp = c.followUps?.find((f) => f.status === "PENDING" && f.cycle?.status === "ACTIVE");
  const isOverdue = nextFollowUp && new Date(nextFollowUp.scheduledDate) < new Date();
  return (
    <tr className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${selected ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}>
      <td className="px-3 py-3.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-gray-300 text-[#0A66FF] focus:ring-[#0A66FF] cursor-pointer"
        />
      </td>
      <td className="px-4 py-3.5">
        <Link href={`/customers/${c.id}`} className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#00C6FF] text-white font-semibold text-sm flex items-center justify-center shrink-0">
            {c.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-[#0A66FF] transition-colors">{c.name}</p>
            {c.city && <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{c.city}</p>}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3.5">
        {c.phone && <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" />{c.phone}</p>}
        {c.email && <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5"><Mail className="h-3 w-3" />{c.email}</p>}
      </td>
      <td className="px-4 py-3.5">
        {latestPurchase ? (
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-0.5">
              <IndianRupee className="h-3.5 w-3.5" />
              {latestPurchase.purchaseAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{latestPurchase.productDetails || "—"}</p>
          </div>
        ) : (
          <span className="text-xs text-gray-400">No purchase</span>
        )}
      </td>
      <td className="px-4 py-3.5"><LeadStatusBadge status={c.currentLeadStatus} /></td>
      <td className="px-4 py-3.5">
        {nextFollowUp ? (
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Follow-up {nextFollowUp.followUpNumber}</p>
            <p className={`text-xs ${isOverdue ? "text-rose-600 font-semibold" : "text-gray-500 dark:text-gray-400"}`}>
              {isOverdue ? "Overdue · " : ""}{new Date(nextFollowUp.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
        {c.assignedEmployee?.name || <span className="text-xs text-gray-400">Unassigned</span>}
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-[#0A66FF]"
            title="Edit customer"
          >
            <Edit className="h-3.5 w-3.5" /> Edit
          </button>
          <Link href={`/customers/${c.id}`} className="inline-flex items-center text-sm font-medium text-[#0A66FF] hover:text-[#0952CC]">
            View <ChevronRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function CustomerCard({ customer: c, selected, onToggleSelect, onEdit }: { customer: Customer; selected: boolean; onToggleSelect: () => void; onEdit: () => void }) {
  const latestPurchase = c.purchases?.[0];
  const nextFollowUp = c.followUps?.find((f) => f.status === "PENDING" && f.cycle?.status === "ACTIVE");
  return (
    <div className={`block p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 ${selected ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0A66FF] focus:ring-[#0A66FF] cursor-pointer"
        />
        <Link href={`/customers/${c.id}`} className="flex items-start justify-between gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#00C6FF] text-white font-semibold flex items-center justify-center shrink-0">
              {c.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
              {c.phone && <p className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</p>}
            </div>
          </div>
          <LeadStatusBadge status={c.currentLeadStatus} />
        </Link>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-[#0A66FF] shrink-0"
          title="Edit customer"
        >
          <Edit className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      {latestPurchase && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-7 flex items-center gap-1">
          <IndianRupee className="h-3 w-3" />{latestPurchase.purchaseAmount.toLocaleString("en-IN")} · {latestPurchase.productDetails}
        </p>
      )}
    </div>
  );
}
