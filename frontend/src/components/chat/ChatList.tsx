"use client";
import React, { useState, useEffect } from "react";
import { Search, MessageCircle, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { Separator } from "@/components/ui/Separator";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store";
import api from "@/lib/api";
import type { Chat } from "@/lib/types";

type FilterType = "all" | "waiting" | "active" | "closed";

export function ChatList({ onNewChat }: { onNewChat?: () => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { chats, setChats, activeChat, setActiveChat, clearUnread } = useChatStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getChats();
        if (mounted && Array.isArray(data)) setChats(data);
      } catch (e) { console.error("Failed to load chats:", e); }
      finally { if (mounted) setIsLoading(false); }
    })();
    return () => { mounted = false; };
  }, [setChats]);

  const filteredChats = chats.filter((chat) => {
    const matchesFilter = filter === "all" || chat.status === filter;
    const matchesSearch = !search || chat.visitor.name?.toLowerCase().includes(search.toLowerCase()) || chat.visitor.email?.toLowerCase().includes(search.toLowerCase()) || chat.visitor.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectChat = (chat: Chat) => { setActiveChat(chat); clearUnread(chat.id); };
  const filterCounts = { all: chats.length, waiting: chats.filter((c) => c.status === "waiting").length, active: chats.filter((c) => c.status === "active").length, closed: chats.filter((c) => c.status === "closed").length };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chats</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{chats.filter((c) => c.status !== "closed").length} active</span>
            {onNewChat && (
              <Button size="icon" variant="primary" onClick={onNewChat} title="New Chat">
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <Input placeholder="Search chats..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(["all", "waiting", "active", "closed"] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap", filter === f ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700")}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({filterCounts[f]})
            </button>
          ))}
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4"><MessageCircle className="w-8 h-8 text-gray-400" /></div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No chats found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{filter !== "all" ? "Try changing the filter" : "New chats will appear here"}</p>
          </div>
        ) : (
          <div className="space-y-1">{filteredChats.map((chat) => <ChatListItem key={chat.id} chat={chat} isActive={activeChat?.id === chat.id} onClick={() => handleSelectChat(chat)} />)}</div>
        )}
      </div>
    </div>
  );
}
