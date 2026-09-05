"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Search, Send, MessageCircle, CheckCheck, Check, AlertCircle, Loader2, User, Phone, MapPin, Mail, Link as LinkIcon, X, MessageSquare, RefreshCw, UserPlus, Inbox, ShieldAlert } from "lucide-react";
import api from "@/lib/api";

interface WAConversation {
  id: string;
  remotePhone: string;
  remoteName?: string | null;
  unreadCount: number;
  lastMessagePreview?: string | null;
  lastMessageDirection?: string | null;
  lastMessageAt: string;
  status: string;
  isUnassigned?: boolean;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    currentLeadStatus?: string;
    plan?: string;
  } | null;
  messages?: Array<WAMessage>;
}

interface WAAgent {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface WAMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  body?: string | null;
  status: string;
  sentAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  errorMessage?: string | null;
  errorCode?: string | null;
}

export function WhatsAppChannel() {
  const [config, setConfig] = useState<{ configured: boolean; phoneNumberId: string | null } | null>(null);
  const [conversations, setConversations] = useState<WAConversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<WAConversation | null>(null);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pollSec] = useState(5);
  // Unassigned lead handling
  const [isAdmin, setIsAdmin] = useState(false);
  const [allAgents, setAllAgents] = useState<WAAgent[]>([]);
  const [claimTarget, setClaimTarget] = useState<string>("");
  const [createForm, setCreateForm] = useState<{ name: string; email: string; city: string }>({ name: "", email: "", city: "" });
  const [busyUnassigned, setBusyUnassigned] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Load config once
  useEffect(() => {
    api.getWhatsAppConfig().then(setConfig).catch(() => setConfig({ configured: false, phoneNumberId: null }));
  }, []);

  // Detect admin role and load agent list (for claim/assign)
  useEffect(() => {
    const role = (typeof window !== "undefined" ? (localStorage.getItem("amplizo_role") || "") : "").toLowerCase();
    const admin = role === "admin";
    setIsAdmin(admin);
    if (admin) {
      api.getWhatsAppAgents().then((list) => setAllAgents(Array.isArray(list) ? list : [])).catch(() => setAllAgents([]));
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getWhatsAppConversations();
      setConversations(data.items || []);
      setTotalUnread(data.totalUnread || 0);
    } catch (e) {}
  }, []);

  const loadActive = useCallback(async (id: string) => {
    try {
      const data = await api.getWhatsAppConversation(id);
      setActive(data);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message?.message || e?.message || "Failed to load conversation");
    }
  }, []);

  // Initial load
  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Poll for new messages (in production, would use WebSocket)
  useEffect(() => {
    const t = setInterval(() => { loadConversations(); if (activeId) loadActive(activeId); }, pollSec * 1000);
    return () => clearInterval(t);
  }, [activeId, loadConversations, loadActive, pollSec]);

  // Mark active as read
  useEffect(() => {
    if (activeId) api.markWhatsAppRead(activeId).catch(() => {});
  }, [activeId]);

  // Scroll messages to bottom
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length]);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.remoteName || "").toLowerCase().includes(q)
      || (c.remotePhone || "").includes(q)
      || (c.client?.name || "").toLowerCase().includes(q);
  });

  const handleSelect = (id: string) => {
    setActiveId(id);
    setError(null);
  };

  const handleSend = async () => {
    if (!activeId || !text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await api.sendWhatsAppMessage(activeId, text.trim());
      setText("");
      await loadActive(activeId);
      await loadConversations();
    } catch (e: any) {
      setError(e?.response?.data?.message?.message || e?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleStartNew = async () => {
    if (!newPhone.trim()) return;
    setError(null);
    try {
      const conv = await api.createWhatsAppConversation({
        remotePhone: newPhone.trim(),
        remoteName: newName.trim() || undefined,
      });
      setLinkMode(false);
      setNewPhone("");
      setNewName("");
      setActiveId(conv.id);
      await loadConversations();
    } catch (e: any) {
      setError(e?.response?.data?.message?.message || "Failed to start conversation");
    }
  };

  // Unassigned lead handlers (only relevant for active.isUnassigned === true)
  const handleCreateCustomer = async () => {
    if (!active || !createForm.name.trim()) return;
    setBusyUnassigned(true);
    setError(null);
    try {
      await api.createAndLinkWhatsAppCustomer(active.id, {
        name: createForm.name.trim(),
        email: createForm.email.trim() || undefined,
        city: createForm.city.trim() || undefined,
        source: "WhatsApp (New Lead)",
      });
      setCreateForm({ name: "", email: "", city: "" });
      await loadActive(active.id);
      await loadConversations();
    } catch (e: any) {
      setError(e?.response?.data?.message?.message || e?.message || "Failed to create customer");
    } finally {
      setBusyUnassigned(false);
    }
  };

  const handleClaim = async () => {
    if (!active || !claimTarget) return;
    setBusyUnassigned(true);
    setError(null);
    try {
      await api.claimWhatsAppConversation(active.id, claimTarget);
      setClaimTarget("");
      await loadConversations();
      // After claim, the active conversation may have moved to a different agent (admin still sees it)
      await loadActive(active.id);
    } catch (e: any) {
      setError(e?.response?.data?.message?.message || e?.message || "Failed to claim conversation");
    } finally {
      setBusyUnassigned(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-80 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone..."
                className="w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66FF]"
              />
            </div>
            <button
              onClick={() => setLinkMode(true)}
              className="p-2 rounded-lg bg-[#25D366] text-white hover:bg-[#1eb854]"
              title="Start new WhatsApp conversation"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
          {config && !config.configured && (
            <div className="px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
              WhatsApp not configured — messages will be mocked.
            </div>
          )}
          {totalUnread > 0 && (
            <div className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              {totalUnread} unread message{totalUnread > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {linkMode && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/10 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">New conversation</p>
              <button onClick={() => setLinkMode(false)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Customer phone (e.g. 9876543210)"
              className="w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name (optional)"
              className="w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <button
              onClick={handleStartNew}
              disabled={!newPhone.trim()}
              className="w-full px-3 py-1.5 rounded-md bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1eb854] disabled:opacity-50"
            >
              Start Chat
            </button>
          </div>
        )}

        <div ref={listRef} className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <MessageCircle className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Click the green button to start a new chat</p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={`w-full px-3 py-3 flex items-start gap-3 text-left border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  activeId === c.id ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white font-semibold flex items-center justify-center shrink-0">
                  {(c.client?.name?.[0] || c.remoteName?.[0] || c.remotePhone?.[2] || "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                      {c.isUnassigned && (
                        <span title="Unassigned WhatsApp Lead" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0">
                          <Inbox className="w-2.5 h-2.5" />NEW LEAD
                        </span>
                      )}
                      <span className="truncate">{c.client?.name || c.remoteName || c.remotePhone}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 shrink-0">
                      {new Date(c.lastMessageAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                      {c.lastMessageDirection === "OUTBOUND" && <span className="text-gray-400">You: </span>}
                      {c.lastMessagePreview || <span className="italic text-gray-400">No messages</span>}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#25D366] text-white text-[10px] font-bold">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat window + customer panel */}
      <div className="flex-1 min-w-0 flex">
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                <MessageCircle className="w-8 h-8 text-[#25D366]" />
              </div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Select a conversation</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose a conversation from the left or start a new one</p>
            </div>
          ) : !active ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#0A66FF]" />
            </div>
          ) : (
            <>
              <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white font-semibold flex items-center justify-center">
                  {(active.client?.name?.[0] || active.remoteName?.[0] || active.remotePhone?.[2] || "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {active.client?.name || active.remoteName || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />{active.remotePhone}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  WhatsApp
                </span>
                {active.isUnassigned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    <Inbox className="w-3 h-3" />
                    New WhatsApp Lead
                  </span>
                )}
              </div>

              {error && (
                <div className="mx-4 mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {(active.messages || []).length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400">No messages yet. Send a message to start.</div>
                ) : (
                  active.messages!.map((m) => {
                    const isOut = m.direction === "OUTBOUND";
                    return (
                      <div key={m.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isOut ? "bg-[#25D366] text-white rounded-br-sm" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700"}`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOut ? "text-emerald-100" : "text-gray-400"}`}>
                            <span>{new Date(m.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                            {isOut && (
                              m.status === "READ" ? <CheckCheck className="w-3 h-3" /> :
                              m.status === "DELIVERED" ? <CheckCheck className="w-3 h-3" /> :
                              m.status === "FAILED" ? <AlertCircle className="w-3 h-3 text-rose-300" /> :
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                          {isOut && m.status === "FAILED" && m.errorMessage && (
                            <p className="text-[10px] mt-1 text-rose-100">⚠ {m.errorMessage}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={msgEndRef} />
              </div>

              <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end gap-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#1eb854] disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Customer panel */}
        {active && (
          <div className="w-72 shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hidden xl:flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white font-semibold flex items-center justify-center">
                  {(active.client?.name?.[0] || active.remoteName?.[0] || active.remotePhone?.[2] || "?").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {active.client?.name || active.remoteName || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{active.client ? "Linked Customer" : "Not linked"}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              <DetailRow icon={Phone} label="Phone" value={active.remotePhone} />
              <DetailRow icon={MessageSquare} label="Last Message" value={active.lastMessagePreview || "—"} />
              <DetailRow icon={User} label="Profile Name" value={active.remoteName || "—"} />
              <DetailRow icon={Mail} label="Status" value={active.isUnassigned ? "Unassigned" : (active.client ? "Linked" : "Unknown")} />

              {active.client ? (
                <>
                  <DetailRow icon={User} label="Name" value={active.client.name} />
                  <DetailRow icon={Mail} label="Email" value={active.client.email || "—"} />
                  <DetailRow icon={MapPin} label="City" value={active.client.city || "—"} />
                  <DetailRow icon={LinkIcon} label="Lead Status" value={active.client.currentLeadStatus || "—"} />
                  <DetailRow icon={LinkIcon} label="Plan" value={active.client.plan || "—"} />
                </>
              ) : active.isUnassigned ? (
                <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-900/10 p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Unassigned WhatsApp Lead</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                        Tenant could not be determined automatically. Create a new customer or assign to an existing one to start a real conversation.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Create new customer</p>
                    <input
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Customer name *"
                      className="w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                    />
                    <input
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="Email (optional)"
                      className="w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                    />
                    <input
                      value={createForm.city}
                      onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                      placeholder="City (optional)"
                      className="w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                    />
                    <button
                      onClick={handleCreateCustomer}
                      disabled={!createForm.name.trim() || busyUnassigned}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0A66FF] text-white text-xs font-semibold hover:bg-[#0952CC] disabled:opacity-50"
                    >
                      {busyUnassigned ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      Create & Link
                    </button>
                  </div>

                  {isAdmin && (
                    <div className="space-y-1.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/60">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Or claim into a tenant (admin only)</p>
                      <select
                        value={claimTarget}
                        onChange={(e) => setClaimTarget(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                      >
                        <option value="">Select agent/tenant…</option>
                        {allAgents.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                        ))}
                      </select>
                      <button
                        onClick={handleClaim}
                        disabled={!claimTarget || busyUnassigned}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 disabled:opacity-50"
                      >
                        {busyUnassigned ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Inbox className="w-3.5 h-3.5" />}
                        Claim to Tenant
                      </button>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Moves the conversation (with full history) to the selected agent&apos;s tenant. If that agent already has a conversation with this number, messages will be merged.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3 text-xs text-gray-500 dark:text-gray-400">
                  This conversation is not linked to a customer yet. The customer record was not found in your tenant for this phone number.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
        <p className="text-sm text-gray-900 dark:text-gray-100 break-words">{value}</p>
      </div>
    </div>
  );
}
