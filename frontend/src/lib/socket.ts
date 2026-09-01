"use client";

import { io, Socket } from "socket.io-client";
import api from "@/lib/api";
import { useChatStore, useAuthStore } from "@/store";
import { useConnectionStore } from "@/store/connection";
import type { Message, TypingEvent, PresenceEvent } from "@/lib/types";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(api.getWsUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      useConnectionStore.getState().setConnected(true);
      useConnectionStore.getState().setReconnecting(false);
      if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    });

    this.socket.on("disconnect", (reason) => {
      useConnectionStore.getState().setConnected(false);
      if (reason === "io server disconnect") {
        useConnectionStore.getState().setReconnecting(true);
        this.reconnectTimer = setTimeout(() => this.connect(token), 2000);
      }
    });

    this.socket.on("connect_error", () => {
      this.reconnectAttempts++;
      useConnectionStore.getState().setReconnecting(true);
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.socket?.disconnect();
        useConnectionStore.getState().setReconnecting(false);
      }
    });

    this.registerListeners();
  }

  private registerListeners() {
    if (!this.socket) return;

    this.socket.on("message:new", (message: Message) => {
      const { activeChat, addMessage, incrementUnread, chats, updateChat } = useChatStore.getState();
      addMessage(message.chatId, message);
      const chat = chats.find((c) => c.id === message.chatId);
      if (chat) updateChat(message.chatId, { lastMessage: message });
      if (activeChat?.id !== message.chatId) incrementUnread(message.chatId);
    });

    this.socket.on("message:status", ({ chatId, messageId, status }: { chatId: string; messageId: string; status: string }) => {
      useChatStore.getState().updateMessage(chatId, messageId, { status: status as Message["status"] });
    });

    this.socket.on("chat:new", (chat: any) => { useChatStore.getState().addChat(chat); });

    this.socket.on("chat:assigned", (chat: any) => { useChatStore.getState().updateChat(chat.id, { agent: chat.agent, status: "active" }); });

    this.socket.on("chat:closed", ({ chatId }: { chatId: string }) => { useChatStore.getState().updateChat(chatId, { status: "closed", closedAt: new Date().toISOString() }); });

    this.socket.on("typing", (event: TypingEvent) => {
      useChatStore.getState().setTyping(event);
      setTimeout(() => {
        const current = useChatStore.getState().typingUsers[`${event.chatId}-${event.userId}`];
        if (current?.isTyping === event.isTyping) { useChatStore.getState().setTyping({ ...event, isTyping: false }); }
      }, 5000);
    });

    this.socket.on("presence", (event: PresenceEvent) => { useChatStore.getState().setPresence(event); });
  }

  disconnect() {
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
    useConnectionStore.getState().setConnected(false);
  }

  joinChat(chatId: string) { this.socket?.emit("chat:join", { chatId }); }
  leaveChat(chatId: string) { this.socket?.emit("chat:leave", { chatId }); }
  sendMessage(chatId: string, content: string, attachments?: any[], replyTo?: string) { this.socket?.emit("message:send", { chatId, content, attachments, replyTo }); }
  sendTyping(chatId: string, isTyping: boolean) { this.socket?.emit("typing", { chatId, isTyping }); }
  sendStatus(chatId: string, messageId: string, status: "delivered" | "seen") { this.socket?.emit("message:status", { chatId, messageId, status }); }
  isConnected(): boolean { return this.socket?.connected ?? false; }
}

export const socketService = new SocketService();
export default socketService;
