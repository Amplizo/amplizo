"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { api } from "@/lib/api";
import { Search, Users, MessageCircle, Eye, Filter } from "lucide-react";
import { useAuthStore } from "@/store";

export default function SearchPage() {
  const { agent } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ clients: [], agents: [], chats: [], visitors: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const isAdmin = agent?.role === "admin";
      const data = isAdmin ? await api.globalSearch(query) : await api.publicSearch(query);
      setResults(data);
      setHasSearched(true);
    } catch {
      setResults({ clients: [], agents: [], chats: [], visitors: [] });
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.clients?.length + results.agents?.length + results.chats?.length + results.visitors?.length;

  return (
    <DashboardLayout title="Global Search" subtitle="Search across clients, agents, chats, and visitors">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, phone, or keyword..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-lg" />
          </div>
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {hasSearched && (
          <div className="text-sm text-gray-500">{totalResults} results found for &quot;{query}&quot;</div>
        )}

        {hasSearched && totalResults === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No results found. Try a different search term.</p>
          </div>
        )}

        {results.clients?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Clients ({results.clients.length})</span>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.clients.map((client: any) => (
                <div key={client.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{client.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.agents?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Agents ({results.agents.length})</span>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.agents.map((agent: any) => (
                <div key={agent.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${agent.status === "online" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{agent.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.chats?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Chats ({results.chats.length})</span>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.chats.map((chat: any) => (
                <div key={chat.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{chat.visitorName || chat.title || "Anonymous"}</p>
                  <p className="text-sm text-gray-500 truncate">{chat.subtitle || "No messages"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
