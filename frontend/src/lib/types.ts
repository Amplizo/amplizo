export interface Visitor {
  id: string;
  name?: string;
  email?: string;
  status: "online" | "offline";
  createdAt: string;
  lastSeenAt: string;
  metadata?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: "agent" | "admin";
  avatar?: string;
  status: "online" | "offline" | "away";
  createdAt: string;
}

export interface Attachment {
  id: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: "image" | "video" | "audio" | "file";
  duration?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: "visitor" | "agent" | "system";
  senderName?: string;
  content: string;
  attachments?: Attachment[];
  status: "sending" | "sent" | "delivered" | "seen" | "failed";
  replyTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Chat {
  id: string;
  visitorId: string;
  visitor: Visitor;
  clientId?: string;
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    city?: string;
    currentLeadStatus?: string;
    plan?: string;
    status?: string;
    totalSpent?: number;
    purchaseCount?: number;
  };
  agentId?: string;
  agent?: Agent;
  status: "waiting" | "active" | "closed";
  unreadCount: number;
  lastMessage?: Message;
  subject?: string;
  tags: string[];
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  conversationState?: string;
}

export interface TypingEvent {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface PresenceEvent {
  userId: string;
  status: "online" | "offline" | "away";
}

export interface AdminStats {
  totalVisitors: number;
  activeChats: number;
  closedChatsToday: number;
  onlineAgents: number;
  totalMessages: number;
  storageUsedMB: number;
  avgResponseTimeSec: number;
  satisfactionRate: number;
}
