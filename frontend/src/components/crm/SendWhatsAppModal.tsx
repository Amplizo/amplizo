"use client";
import React, { useState, useEffect, useRef } from "react";
import { Loader2, Search, Phone, X, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  status: string;
}

interface SendWhatsAppModalProps {
  onClose: () => void;
  onSent?: () => void;
}

export function SendWhatsAppModal({ onClose, onSent }: SendWhatsAppModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [config, setConfig] = useState<{ configured: boolean } | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await api.getWhatsAppConfig();
        setConfig(cfg);
      } catch {
        setConfig({ configured: false });
      }
      setLoadingConfig(false);
    })();
  }, []);

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
    setSearchQuery(c.name);
    setShowDropdown(false);
  };

  const sendWhatsApp = async () => {
    setError(null);
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }
    if (!message.trim()) {
      setError("Message is required");
      return;
    }
    if (!selectedCustomer.phone) {
      setError("Selected customer has no phone number");
      return;
    }

    setSubmitting(true);
    try {
      const conv = await api.createWhatsAppConversation({
        remotePhone: selectedCustomer.phone,
        remoteName: selectedCustomer.name,
        clientId: selectedCustomer.id,
      });

      const result = await api.sendWhatsAppMessage(conv.id, message.trim());
      const isMock = (result as any).mock;

      setSuccess(true);
      setTimeout(() => {
        onSent?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message?.message || err?.response?.data?.message || "Failed to send WhatsApp message";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Send WhatsApp</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Send a WhatsApp message to a customer</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!loadingConfig && !config?.configured && (
          <div className="mx-5 mt-5 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            WhatsApp is not configured. Messages cannot be sent. Please configure WhatsApp Business API credentials in the backend.
          </div>
        )}

        {success ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Message Sent!</p>
            <p className="text-sm text-gray-500">The WhatsApp message has been sent.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); sendWhatsApp(); }} className="p-5 space-y-4">
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
                  value={selectedCustomer?.phone || ""}
                  readOnly
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Phone from selected customer record</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                maxLength={4096}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="Type your WhatsApp message here..."
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/4096</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedCustomer || !message.trim() || !config?.configured}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1da851] disabled:opacity-60 transition-colors"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending..." : "Send WhatsApp"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
