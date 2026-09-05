"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, User, Mail, Phone, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";

interface CustomerResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  currentLeadStatus?: string;
}

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export function NewChatModal({ open, onClose, onChatCreated }: NewChatModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); setShowCreate(false); }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || showCreate) { setResults([]); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.searchCustomers(query.trim());
        if (!cancelled) setResults(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
      } catch { if (!cancelled) setResults([]); }
      finally { if (!cancelled) setIsSearching(false); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, showCreate]);

  const handleSelectCustomer = async (client: CustomerResult) => {
    try {
      const visitor = await api.createVisitor(client.name, client.email);
      const chat = await api.createChat(visitor.id, `Chat with ${client.name}`, client.id);
      onChatCreated(chat.id);
      onClose();
    } catch (e) { console.error("Failed to start chat:", e); }
  };

  const handleCreateCustomer = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const customer = await api.createCustomerBasic({
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
        source: "Website Chat",
        status: "Active",
      });
      const visitor = await api.createVisitor(newName.trim(), newEmail.trim() || undefined);
      const chat = await api.createChat(visitor.id, `Chat with ${newName.trim()}`, customer.id);
      onChatCreated(chat.id);
      onClose();
    } catch (e) { console.error("Failed to create customer and chat:", e); }
    finally { setCreating(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>Search for an existing customer or create a new one to start a chat.</DialogDescription>
        </DialogHeader>

        {!showCreate ? (
          <div className="space-y-4">
            <div className="relative">
              <Input placeholder="Search customers by name, phone, or email..." value={query} onChange={(e) => setQuery(e.target.value)} icon={<Search className="w-4 h-4" />} />
              {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>}
            </div>

            {results.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
                {results.map((client) => (
                  <button key={client.id} onClick={() => handleSelectCustomer(client)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                    <Avatar name={client.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{client.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{client.email || client.phone || "—"}</p>
                    </div>
                    {client.currentLeadStatus && <Badge variant="info" size="sm">{client.currentLeadStatus}</Badge>}
                  </button>
                ))}
              </div>
            )}

            {query.trim() && results.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No customers found</p>
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)} className="mt-2"><Plus className="w-4 h-4 mr-1" />Create New Customer</Button>
              </div>
            )}

            {!query.trim() && (
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Search for a customer to start a chat</p>
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)} className="mt-2"><Plus className="w-4 h-4 mr-1" />Or create New Customer</Button>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" onClick={() => setShowCreate(true)} className="w-full"><Plus className="w-4 h-4 mr-2" />Create New Customer</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Name *</label>
                <Input placeholder="Customer name" value={newName} onChange={(e) => setNewName(e.target.value)} icon={<User className="w-4 h-4" />} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                <Input placeholder="email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                <Input placeholder="+91 98765 43210" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} icon={<Phone className="w-4 h-4" />} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1"><X className="w-4 h-4 mr-1" />Back</Button>
              <Button onClick={handleCreateCustomer} isLoading={creating} disabled={!newName.trim()} className="flex-1">Create & Start Chat</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}