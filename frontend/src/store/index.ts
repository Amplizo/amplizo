"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { Agent, Chat, Message, Visitor, TypingEvent, PresenceEvent } from "@/lib/types";

interface AuthState {
  agent: Agent | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (agent: Agent, token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        agent: null, token: null, refreshToken: null, isAuthenticated: false,
        setAuth: (agent, token, refreshToken) => set({ agent, token, refreshToken, isAuthenticated: true }),
        logout: () => {
          if (typeof document !== "undefined") {
            document.cookie = "amplizo_token=; path=/; max-age=0";
            document.cookie = "amplizo_role=; path=/; max-age=0";
          }
          set({ agent: null, token: null, refreshToken: null, isAuthenticated: false });
        },
      }),
      { name: "amplizo-auth" }
    ),
    { name: "auth-store" }
  )
);

interface VisitorState {
  visitor: Visitor | null;
  setVisitor: (visitor: Visitor) => void;
  clearVisitor: () => void;
}

export const useVisitorStore = create<VisitorState>()(
  devtools(
    persist(
      (set) => ({
        visitor: null,
        setVisitor: (visitor) => set({ visitor }),
        clearVisitor: () => set({ visitor: null }),
      }),
      { name: "amplizo-visitor" }
    ),
    { name: "visitor-store" }
  )
);

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, TypingEvent>;
  presenceUsers: Record<string, PresenceEvent>;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setActiveChat: (chat: Chat | null) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  setTyping: (event: TypingEvent) => void;
  setPresence: (event: PresenceEvent) => void;
  incrementUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      chats: [], activeChat: null, messages: {}, typingUsers: {}, presenceUsers: {},
      setChats: (chats) => set({ chats }),
      addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
      updateChat: (chatId, updates) =>
        set((state) => ({
          chats: state.chats.map((c) => (c.id === chatId ? { ...c, ...updates } : c)),
          activeChat: state.activeChat?.id === chatId ? { ...state.activeChat, ...updates } : state.activeChat,
        })),
      setActiveChat: (chat) => set({ activeChat: chat }),
      setMessages: (chatId, messages) => set((state) => ({ messages: { ...state.messages, [chatId]: messages } })),
      addMessage: (chatId, message) =>
        set((state) => ({ messages: { ...state.messages, [chatId]: [...(state.messages[chatId] || []), message] } })),
      updateMessage: (chatId, messageId, updates) =>
        set((state) => ({
          messages: { ...state.messages, [chatId]: (state.messages[chatId] || []).map((m) => (m.id === messageId ? { ...m, ...updates } : m)) },
        })),
      setTyping: (event) => set((state) => ({ typingUsers: { ...state.typingUsers, [`${event.chatId}-${event.userId}`]: event } })),
      setPresence: (event) => set((state) => ({ presenceUsers: { ...state.presenceUsers, [event.userId]: event } })),
      incrementUnread: (chatId) => set((state) => ({ chats: state.chats.map((c) => (c.id === chatId ? { ...c, unreadCount: c.unreadCount + 1 } : c)) })),
      clearUnread: (chatId) => set((state) => ({ chats: state.chats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)) })),
    }),
    { name: "chat-store" }
  )
);

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true, darkMode: false,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
      }),
      { name: "amplizo-ui" }
    ),
    { name: "ui-store" }
  )
);
