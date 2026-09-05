"use client";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export interface CustomerForEdit {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  source?: string | null;
  status?: string | null;
  notes?: string | null;
}

interface EditCustomerModalProps {
  customer: CustomerForEdit;
  onClose: () => void;
  onUpdated?: (updated: any) => void;
}

export function EditCustomerModal({ customer, onClose, onUpdated }: EditCustomerModalProps) {
  const [form, setForm] = useState({
    name: customer.name || "",
    phone: customer.phone || "",
    email: customer.email || "",
    city: customer.city || "",
    source: customer.source || "",
    status: customer.status || "Active",
    notes: customer.notes || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      city: customer.city || "",
      source: customer.source || "",
      status: customer.status || "Active",
      notes: customer.notes || "",
    });
  }, [customer]);

  const update = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.phone.trim() || !form.city.trim()) {
      setError("Name, mobile, and city are required");
      return;
    }
    const phoneDigits = form.phone.replace(/[^0-9]/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError("Invalid mobile number");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Invalid email format");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: phoneDigits,
        email: form.email.trim() || undefined,
        city: form.city.trim(),
        source: form.source.trim() || undefined,
        status: form.status,
        notes: form.notes.trim() || undefined,
      };
      const updated = await api.updateCustomer(customer.id, payload);
      onUpdated?.(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message?.message || err?.response?.data?.message || "Failed to update customer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Customer</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update customer details and notes</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-400">{error}</div>}

          <Field label="Customer Name" required>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} />
          </Field>
          <Field label="Mobile Number" required>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} required className={inputClass} placeholder="10-digit mobile" />
          </Field>
          <Field label="City" required>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} required className={inputClass} />
          </Field>
          <Field label="Email" hint="Optional">
            <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Source">
              <input value={form.source} onChange={(e) => update("source", e.target.value)} className={inputClass} placeholder="Website, Referral..." />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
            </Field>
          </div>
          <Field label="Notes" hint="Optional">
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className={inputClass + " min-h-[80px]"} rows={3} placeholder="Internal notes about this customer" />
          </Field>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 text-xs text-amber-700 dark:text-amber-300">
            <p className="font-semibold mb-1">Note:</p>
            <p>The customer&apos;s ownership (assigned agent) will not be changed.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:bg-[#0952CC] disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66FF] focus:border-transparent";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
