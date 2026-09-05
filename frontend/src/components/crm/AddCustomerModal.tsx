"use client";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface AddCustomerModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

export function AddCustomerModal({ onClose, onCreated }: AddCustomerModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    purchaseAmount: "",
    productDetails: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const amount = Number(form.purchaseAmount);
      if (!form.name.trim() || !form.phone.trim() || !form.city.trim() || !amount) {
        setError("Name, mobile, city and purchase amount are required");
        setSubmitting(false);
        return;
      }
      await api.createCustomer({
        name: form.name.trim(),
        phone: form.phone.replace(/[^0-9]/g, ""),
        email: form.email.trim() || undefined,
        city: form.city.trim(),
        purchaseAmount: amount,
        productDetails: form.productDetails.trim() || undefined,
      });
      onCreated?.();
    } catch (err: any) {
      setError(err?.response?.data?.message?.message || err?.response?.data?.message || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add New Customer</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">First purchase will create 3 follow-ups automatically</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-400">{error}</div>}

          <Field label="Customer Name" required>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} placeholder="e.g. Rahul Kumar" />
          </Field>
          <Field label="Mobile Number" required>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} required className={inputClass} placeholder="10-digit mobile" />
          </Field>
          <Field label="City" required>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} required className={inputClass} placeholder="e.g. Patna" />
          </Field>
          <Field label="Email" hint="Optional">
            <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" className={inputClass} placeholder="email@example.com" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Purchase Amount (₹)" required>
              <input value={form.purchaseAmount} onChange={(e) => update("purchaseAmount", e.target.value)} required type="number" min="1" className={inputClass} placeholder="25000" />
            </Field>
            <Field label="Product / Item" hint="Optional">
              <input value={form.productDetails} onChange={(e) => update("productDetails", e.target.value)} className={inputClass} placeholder="Laptop" />
            </Field>
          </div>

          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-3 text-xs text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">Auto Follow-ups will be created:</p>
            <p>+3 days, +7 days, +15 days from today</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:bg-[#0952CC] disabled:opacity-60">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating..." : "Add Customer"}
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
