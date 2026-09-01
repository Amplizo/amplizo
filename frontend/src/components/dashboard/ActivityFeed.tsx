"use client";
import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import { MessageCircle, UserPlus, CheckCircle2, XCircle } from "lucide-react";

interface ActivityItem { id: string; type: "chat_started" | "chat_closed" | "agent_assigned" | "message_received" | "visitor_left"; message: string; timestamp: string; }

interface ActivityFeedProps { activities: ActivityItem[]; }

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const iconMap = { chat_started: <MessageCircle className="w-4 h-4 text-green-500" />, chat_closed: <XCircle className="w-4 h-4 text-red-500" />, agent_assigned: <UserPlus className="w-4 h-4 text-blue-500" />, message_received: <MessageCircle className="w-4 h-4 text-purple-500" />, visitor_left: <XCircle className="w-4 h-4 text-gray-500" /> };
  const bgMap = { chat_started: "bg-green-100 dark:bg-green-900/30", chat_closed: "bg-red-100 dark:bg-red-900/30", agent_assigned: "bg-blue-100 dark:bg-blue-900/30", message_received: "bg-purple-100 dark:bg-purple-900/30", visitor_left: "bg-gray-100 dark:bg-gray-800" };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
        {activities.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p> : activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className={cn("p-2 rounded-lg shrink-0", bgMap[activity.type])}>{iconMap[activity.type]}</div>
            <div className="flex-1 min-w-0"><p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatRelativeTime(activity.timestamp)}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AgentStatusListProps { agents: { id: string; name: string; avatar?: string; status: "online" | "offline" | "away"; activeChats: number; totalChats?: number; avgTime?: string; satisfaction?: number; }[]; }

export function AgentStatusList({ agents }: AgentStatusListProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Agent Status</h3>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={agent.name} src={agent.avatar} size="sm" status={agent.status} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{agent.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">{agent.totalChats || 0} chats</p>
                <p className="text-xs text-gray-400">{agent.avgTime || "—"} avg</p>
              </div>
              <div className="flex items-center gap-1">
                {agent.satisfaction && <span className="text-xs text-yellow-500">★</span>}
                <Badge variant={agent.activeChats > 0 ? "info" : "default"} size="sm">{agent.activeChats}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
