"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, MapPin, IndianRupee, Calendar, Loader2,
  CheckCircle2, XCircle, Plus, UserPlus, MessageCircle, Package,
  Activity as ActivityIcon, Check, X, Clock, AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { LeadStatusBadge, FollowUpStatusBadge, LEAD_STATUS_LABELS, type LeadStatus } from "@/components/crm/lead-status";

interface CustomerDetail {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  currentLeadStatus: string;
  assignedEmployee?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  purchases: Array<{
    id: string;
    purchaseAmount: number;
    productDetails?: string;
    purchaseDate: string;
    createdBy?: { id: string; name: string };
  }>;
  followUpCycles: Array<{
    id: string;
    status: string;
    cancelledReason?: string;
    createdAt: string;
    followUps: Array<{
      id: string;
      followUpNumber: number;
      scheduledDate: string;
      status: string;
      notes?: string;
      completedAt?: string;
      assignedEmployee?: { id: string; name: string };
      completedBy?: { id: string; name: string };
    }>;
  }>;
  activityLogs: Array<{
    id: string;
    activityType: string;
    description: string;
    createdAt: string;
    user?: { id: string; name: string };
  }>;
  assignments: Array<{
    id: string;
    assignedAt: string;
    unassignedAt?: string;
    employee: { id: string; name: string; email: string };
    assignedBy?: { id: string; name: string };
  }>;
}

const LEAD_OPTIONS: LeadStatus[] = ["NEW", "HOT_LEAD", "COLD_LEAD", "NOT_INTERESTED"];

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const c = await api.getCustomerById(id);
      setCustomer(c);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    api.getEmployees().then(setEmployees).catch(() => {});
  }, [load]);

  const updateLead = async (status: string) => {
    if (!customer) return;
    setSavingStatus(true);
    try {
      await api.updateCustomer(customer.id, { currentLeadStatus: status });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update");
    } finally {
      setSavingStatus(false);
    }
  };

  const completeFollowUp = async (followUpId: string) => {
    try {
      await api.completeFollowUp(followUpId, followUpNotes[followUpId] || undefined);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to complete");
    }
  };

  const skipFollowUp = async (followUpId: string) => {
    try {
      await api.skipFollowUp(followUpId, followUpNotes[followUpId] || undefined);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to skip");
    }
  };

  const assignTo = async (employeeId: string) => {
    try {
      await api.assignCustomer(customer!.id, employeeId);
      setShowAssignModal(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to assign");
    }
  };

  if (loading && !customer) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A66FF]" />
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
        <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p>
        <button onClick={load} className="mt-3 text-sm text-[#0A66FF] font-medium">Try again</button>
      </div>
    );
  }

  if (!customer) return null;

  const totalPurchases = customer.purchases?.length || 0;
  const totalValue = customer.purchases?.reduce((s, p) => s + p.purchaseAmount, 0) || 0;
  const activeCycle = customer.followUpCycles?.find((c) => c.status === "ACTIVE");
  const completedCycles = customer.followUpCycles?.filter((c) => c.status !== "ACTIVE") || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/customers")}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </button>

      {/* Profile header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#00C6FF] text-white font-bold text-2xl flex items-center justify-center shrink-0">
            {customer.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{customer.name}</h1>
              <LeadStatusBadge status={customer.currentLeadStatus} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
              {customer.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{customer.phone}</span>}
              {customer.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{customer.email}</span>}
              {customer.city && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{customer.city}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4" /> {customer.assignedEmployee ? "Reassign" : "Assign"}
            </button>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:bg-[#0952CC]"
            >
              <Plus className="h-4 w-4" /> New Purchase
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Stat label="Total Purchases" value={String(totalPurchases)} />
        <Stat label="Total Value" value={`₹${totalValue.toLocaleString("en-IN")}`} />
        <Stat label="Assigned To" value={customer.assignedEmployee?.name || "Unassigned"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {/* Lead Status Control */}
          <Card title="Lead Status" icon={<ActivityIcon className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {LEAD_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => updateLead(s)}
                  disabled={savingStatus}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-colors ${
                    customer.currentLeadStatus === s
                      ? "border-[#0A66FF] bg-blue-50 dark:bg-blue-900/20 text-[#0A66FF]"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {LEAD_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            {customer.currentLeadStatus === "HOT_LEAD" && !activeCycle && completedCycles.length > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">All follow-ups completed. Set the final status.</p>
            )}
          </Card>

          {/* Active Follow-up Cycle */}
          {activeCycle && (
            <Card title="Active Follow-up Cycle" icon={<Clock className="h-4 w-4" />}>
              <div className="space-y-3">
                {activeCycle.followUps.sort((a, b) => a.followUpNumber - b.followUpNumber).map((f) => {
                  const isOverdue = f.status === "PENDING" && new Date(f.scheduledDate) < new Date();
                  return (
                    <div key={f.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[#0A66FF] text-xs font-bold flex items-center justify-center">{f.followUpNumber}</span>
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Follow-up {f.followUpNumber}</span>
                          <FollowUpStatusBadge status={f.status} />
                        </div>
                        <p className={`text-xs ${isOverdue ? "text-rose-600 font-semibold" : "text-gray-500 dark:text-gray-400"}`}>
                          {new Date(f.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      {f.status === "PENDING" && (
                        <>
                          <textarea
                            value={followUpNotes[f.id] || ""}
                            onChange={(e) => setFollowUpNotes({ ...followUpNotes, [f.id]: e.target.value })}
                            placeholder="Add a note (optional)..."
                            rows={2}
                            className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66FF]"
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => completeFollowUp(f.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
                              <Check className="h-4 w-4" /> Complete
                            </button>
                            <button onClick={() => skipFollowUp(f.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <X className="h-4 w-4" /> Skip
                            </button>
                          </div>
                        </>
                      )}
                      {f.notes && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">&ldquo;{f.notes}&rdquo;</p>}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Purchase History */}
          <Card title={`Purchase History (${totalPurchases})`} icon={<Package className="h-4 w-4" />}>
            {customer.purchases.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No purchases yet</p>
            ) : (
              <div className="space-y-2">
                {customer.purchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-0.5">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {p.purchaseAmount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.productDetails || "—"} · {p.createdBy?.name || "—"}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.purchaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* History cycles */}
          {completedCycles.length > 0 && (
            <Card title="Past Follow-up Cycles" icon={<Clock className="h-4 w-4" />}>
              <div className="space-y-3">
                {completedCycles.map((c) => (
                  <div key={c.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {c.status === "CANCELLED" ? `Cancelled: ${c.cancelledReason || ""}` : c.status}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {c.followUps.sort((a, b) => a.followUpNumber - b.followUpNumber).map((f) => (
                        <div key={f.id} className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div className={`h-full ${
                            f.status === "COMPLETED" ? "bg-emerald-500" :
                            f.status === "SKIPPED" ? "bg-slate-400" :
                            f.status === "CANCELLED" ? "bg-rose-400" : "bg-amber-400"
                          }`} style={{ width: f.status === "PENDING" ? "0%" : "100%" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card title="Activity Timeline" icon={<ActivityIcon className="h-4 w-4" />}>
            {customer.activityLogs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No activity yet</p>
            ) : (
              <ol className="space-y-3">
                {customer.activityLogs.map((log) => (
                  <li key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className={`h-2 w-2 rounded-full ${activityDotColor(log.activityType)}`} />
                      <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{log.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {log.user && ` · ${log.user.name}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      {showPurchaseModal && (
        <NewPurchaseModal
          customerId={customer.id}
          onClose={() => setShowPurchaseModal(false)}
          onCreated={() => { setShowPurchaseModal(false); load(); }}
        />
      )}

      {showAssignModal && (
        <AssignModal
          employees={employees}
          current={customer.assignedEmployee?.id}
          onClose={() => setShowAssignModal(false)}
          onAssign={assignTo}
        />
      )}
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">{icon}{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">{value}</p>
    </div>
  );
}

function activityDotColor(type: string) {
  if (type.includes("CREATED")) return "bg-blue-500";
  if (type.includes("PURCHASE")) return "bg-emerald-500";
  if (type.includes("FOLLOWUP")) return "bg-amber-500";
  if (type.includes("ASSIGN")) return "bg-purple-500";
  if (type.includes("LEAD")) return "bg-rose-500";
  return "bg-gray-400";
}

function NewPurchaseModal({ customerId, onClose, onCreated }: { customerId: string; onClose: () => void; onCreated: () => void }) {
  const [amount, setAmount] = useState("");
  const [product, setProduct] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError("Enter valid amount"); return; }
    setSubmitting(true);
    setError(null);
    try {
      await api.addPurchase(customerId, { purchaseAmount: amt, productDetails: product || undefined });
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New Purchase" subtitle="Previous follow-ups will be cancelled and a new cycle starts" onClose={onClose}>
      {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-sm text-rose-700 mb-3">{error}</div>}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Amount (₹) *</label>
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} placeholder="25000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Product / Item (optional)</label>
          <input value={product} onChange={(e) => setProduct(e.target.value)} className={inputCls} placeholder="Laptop" />
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
        <button onClick={submit} disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:bg-[#0952CC] disabled:opacity-60">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Saving..." : "Add Purchase"}
        </button>
      </div>
    </Modal>
  );
}

function AssignModal({ employees, current, onClose, onAssign }: { employees: any[]; current?: string; onClose: () => void; onAssign: (id: string) => void }) {
  return (
    <Modal title="Assign to Employee" onClose={onClose}>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {employees.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No employees available</p>
        ) : employees.map((e) => (
          <button
            key={e.id}
            onClick={() => onAssign(e.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              current === e.id ? "border-[#0A66FF] bg-blue-50" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#00C6FF] text-white text-sm font-semibold flex items-center justify-center">
              {e.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{e.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{e.email}</p>
            </div>
            {current === e.id && <CheckCircle2 className="h-5 w-5 text-[#0A66FF]" />}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66FF] focus:border-transparent";
