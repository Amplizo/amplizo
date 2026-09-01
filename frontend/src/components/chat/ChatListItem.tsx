"use client";
import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn, formatChatListTime } from "@/lib/utils";
import type { Chat } from "@/lib/types";

interface ChatListItemProps { chat: Chat; isActive: boolean; onClick: () => void; }

export function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  const statusConfig = { waiting: { color: "bg-yellow-500", label: "Waiting" }, active: { color: "bg-green-500", label: "Active" }, closed: { color: "bg-gray-400", label: "Closed" } };
  const status = statusConfig[chat.status];

  return (
    <button onClick={onClick} className={cn("w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left", "hover:bg-gray-50 dark:hover:bg-gray-800/50", isActive && "bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800")}>
      <div className="relative">
        <Avatar name={chat.visitor.name || "Visitor"} size="md" status={chat.visitor.status} />
        <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900", status.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{chat.visitor.name || `Visitor-${chat.visitor.id.slice(0, 6)}`}</span>
          <span className="text-xs text-gray-400 shrink-0">{chat.lastMessage ? formatChatListTime(chat.lastMessage.createdAt) : ""}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage?.content || "No messages yet"}</p>
          {chat.unreadCount > 0 && <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-medium flex items-center justify-center">{chat.unreadCount > 9 ? "9+" : chat.unreadCount}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant={chat.status === "waiting" ? "warning" : chat.status === "active" ? "success" : "default"} size="sm">{status.label}</Badge>
          {chat.agent && <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{chat.agent.name}</span>}
        </div>
      </div>
    </button>
  );
}
