"use client";
import React, { useState, useEffect, useRef } from "react";
import { Loader2, Search, Phone, Calendar, X, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  status: string;
}

interface ScheduleCallModalProps {
  onClose: () => void;
  onScheduled?: () => void;
}

export function ScheduleCallModal({ onClose, onScheduled }: ScheduleCallModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setCustomers([]);
      setShowDropdown(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.getCustomers({ search: searchQuery.trim(), take: 20 });
        const items = (res as any).items || [];
        if (!cancelled) {
          setCustomers(items);
          setShowDropdown(true);
        }
      } catch {}
      if (!cancelled) setSearching(false);
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setPhone(c.phone || "");
    setSearchQuery(c.name);
    setShowDropdown(false);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }
    if (!date || !time) {
      setError("Please select date and time");
      return;
    }
    const scheduledDate = new Date(`${date}T${time}`);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      setError("Please select a future date and time");
      return;
    }

    setSubmitting(true);
    try {
      const scheduledDateStr = scheduledDate.toISOString();
      await api.scheduleCall({
        clientId: selectedCustomer.id,
        scheduledDate: scheduledDateStr,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onScheduled?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message?.message || err?.response?.data?.message || "Failed to schedule call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Schedule Call</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Schedule a call with a customer</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Call Scheduled!</p>
            <p className="text-sm text-gray-500">The call has been saved to the backend.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Select Customer <span className="text-rose-500">*</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSelectedCustomer(null); }}
                    onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                    placeholder="Search by name, phone or email..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    autoComplete="off"
                  />
                  {searching && <Loader2 className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />}
                </div>
                {showDropdown && customers.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.phone} {c.email ? `· ${c.email}` : ""}</p>
                        </div>
                        <span className="text-xs text-gray-400">{c.city}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && searchQuery.trim().length >= 2 && customers.length === 0 && !searching && (
                    <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 text-sm text-gray-500 text-center">
                      No customers found matching &quot;{searchQuery}&quot;
                    </div>
                )}
              </div>
              {selectedCustomer && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selected: <span className="font-medium">{selectedCustomer.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Customer Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  readOnly
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Phone from selected customer record</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Call Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Call Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Notes / Reminder
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="Optional notes or reminder..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting || !selectedCustomer} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66FF] text-white text-sm font-semibold hover:bg-[#0952CC] disabled:opacity-60 transition-colors">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Scheduling..." : "Schedule Call"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
