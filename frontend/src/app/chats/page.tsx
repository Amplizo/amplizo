"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { ChatList } from "@/components/chat/ChatList";
import { AgentChatWindow } from "@/components/chat/AgentChatWindow";
import { WhatsAppChannel } from "@/components/chat/WhatsAppChannel";
import { NewChatModal } from "@/components/chat/NewChatModal";
import { useAuthStore } from "@/store";
import { socketService } from "@/lib/socket";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { MessageCircle, MessagesSquare } from "lucide-react";

type Channel = "website" | "whatsapp";

export default function ChatsPage() {
  return (
    <RoleGuard allow={["agent", "admin"]} fallback="/client-dashboard">
      <ChatsPageInner />
    </RoleGuard>
  );
}

function ChatsPageInner() {
  const { isAuthenticated, token } = useAuthStore();
  const [channel, setChannel] = useState<Channel>("website");
  const [showNewChat, setShowNewChat] = useState(false);
  const [createdChatId, setCreatedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { if (typeof window !== "undefined") window.location.href = "/login"; return; }
    if (token) socketService.connect(token);
    return () => { socketService.disconnect(); };
  }, [isAuthenticated, token]);

  const handleChatCreated = (chatId: string) => {
    setCreatedChatId(chatId);
    setShowNewChat(false);
  };

  return (
    <DashboardLayout title="Live Chat" subtitle="Manage conversations across channels">
      <div className="px-4 sm:px-6 lg:px-8 pt-4">
        <BackButton className="mb-2" />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mb-2">
        <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 shadow-sm">
          <button
            onClick={() => setChannel("website")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              channel === "website"
                ? "bg-[#0A66FF] text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <MessagesSquare className="w-4 h-4" />
            Website Chats
          </button>
          <button
            onClick={() => setChannel("whatsapp")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              channel === "whatsapp"
                ? "bg-[#25D366] text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-12rem)] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm mx-4 sm:mx-6 lg:mx-8 mb-4 sm:mb-6 lg:mb-8">
        {channel === "website" ? (
          <>
            <div className="w-80 shrink-0 border-r border-gray-200 dark:border-gray-700"><ChatList onNewChat={() => setShowNewChat(true)} /></div>
            <div className="flex-1 min-w-0"><AgentChatWindow activeChatId={createdChatId || undefined} /></div>
          </>
        ) : (
          <div className="flex-1 min-w-0"><WhatsAppChannel /></div>
        )}
      </div>

      <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} onChatCreated={handleChatCreated} />
    </DashboardLayout>
  );
}
