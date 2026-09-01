"use client";
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatList } from "@/components/chat/ChatList";
import { AgentChatWindow } from "@/components/chat/AgentChatWindow";
import { useAuthStore, useChatStore } from "@/store";
import api from "@/lib/api";
import { socketService } from "@/lib/socket";

export default function ChatsPage() {
  const { isAuthenticated, token } = useAuthStore();
  const { setChats } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) { if (typeof window !== "undefined") window.location.href = "/login"; return; }
    const fetchChats = async () => { try { const data = await api.getChats(); setChats(data); } catch {} };
    fetchChats();
    if (token) socketService.connect(token);
    return () => { socketService.disconnect(); };
  }, [isAuthenticated, token, setChats]);

  return (
    <DashboardLayout title="Chats" subtitle="Manage all conversations with visitors">
      <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="w-80 shrink-0 border-r border-gray-200 dark:border-gray-700"><ChatList /></div>
        <div className="flex-1 min-w-0"><AgentChatWindow /></div>
      </div>
    </DashboardLayout>
  );
}
