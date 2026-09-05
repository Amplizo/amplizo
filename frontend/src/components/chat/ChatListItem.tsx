"use client";
import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn, formatChatListTime } from "@/lib/utils";
import { LeadStatusBadge } from "@/components/crm/lead-status";
import { Bot, UserCheck, Clock, MessageCircle } from "lucide-react";
import type { Chat } from "@/lib/types";

interface ChatListItemProps { chat: Chat; isActive: boolean; onClick: () => void; }

const stateConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  AI_ACTIVE: { icon: <Bot className="h-3 w-3" />, label: "AI", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  WAITING_FOR_HUMAN: { icon: <Clock className="h-3 w-3" />, label: "Wait", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  HUMAN_ASSIGNED: { icon: <UserCheck className="h-3 w-3" />, label: "Assigned", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  HUMAN_ACTIVE: { icon: <MessageCircle className="h-3 w-3" />, label: "Live", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  CLOSED: { icon: <MessageCircle className="h-3 w-3" />, label: "Closed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

export function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  const statusConfig = { waiting: { color: "bg-yellow-500", label: "Waiting" }, active: { color: "bg-green-500", label: "Active" }, closed: { color: "bg-gray-400", label: "Closed" } };
  const status = statusConfig[chat.status];
  const state = (chat as any).conversationState ? stateConfig[(chat as any).conversationState] : null;
  const customer = (chat as any).client;
  const displayName = customer?.name || chat.visitor.name || `Visitor-${chat.visitor.id.slice(0, 6)}`;

  return (
    <button onClick={onClick} className={cn("w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left", "hover:bg-gray-50 dark:hover:bg-gray-800/50", isActive && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800")}>
      <div className="relative">
        <Avatar name={displayName} size="md" status={chat.visitor.status} />
        <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900", status.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{displayName}</span>
          <span className="text-xs text-gray-400 shrink-0">{chat.lastMessage ? formatChatListTime(chat.lastMessage.createdAt) : ""}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage?.content || "No messages yet"}</p>
          {chat.unreadCount > 0 && <span className="shrink-0 w-5 h-5 rounded-full bg-[#0A66FF] text-white text-xs font-medium flex items-center justify-center">{chat.unreadCount > 9 ? "9+" : chat.unreadCount}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {state && <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold", state.color)}>{state.icon}{state.label}</span>}
          {customer?.currentLeadStatus && <LeadStatusBadge status={customer.currentLeadStatus} />}
        </div>
      </div>
    </button>
  );
}
