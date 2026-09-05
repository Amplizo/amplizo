"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, MoreVertical, User, Mail, Clock, Tag, Phone, Globe, MapPin, RefreshCw, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { useChatStore, useAuthStore } from "@/store";
import api from "@/lib/api";
import { socketService } from "@/lib/socket";
import { isSameDay } from "date-fns";
import Link from "next/link";

export function AgentChatWindow({ activeChatId }: { activeChatId?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { agent } = useAuthStore();
  const { activeChat, messages, typingUsers, updateChat, setMessages, addMessage, setActiveChat } = useChatStore();
  const currentMessages = activeChat?.id ? messages[activeChat?.id] || [] : [];
  const chatId = activeChat?.id;
  const prevChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  useEffect(() => {
    if (activeChatId && (!activeChat || activeChat.id !== activeChatId)) {
      (async () => {
        try {
          const chat = await api.getChatById(activeChatId);
          setActiveChat(chat);
        } catch (e) { console.error("Failed to load new chat:", e); }
      })();
    }
  }, [activeChatId, activeChat, setActiveChat]);

  useEffect(() => {
    if (!activeChat || activeChat.id === prevChatIdRef.current) return;
    prevChatIdRef.current = activeChat.id;

    socketService.joinChat(activeChat.id);
    api.markChatAsRead(activeChat.id).catch(() => {});

    const loadMessages = async () => {
      try {
        const data = await api.getMessages(activeChat.id);
        setMessages(activeChat.id, data);
      } catch (error) { console.error("Failed to load messages:", error); }
    };
    loadMessages();

    return () => { socketService.leaveChat(activeChat.id); };
  }, [activeChat?.id, setMessages]);

  useEffect(() => {
    if (!activeChat || currentMessages.length === 0) return;
    const lastMsg = currentMessages[currentMessages.length - 1];
    if (lastMsg.senderType === "visitor" && lastMsg.status !== "seen") {
      socketService.sendStatus(activeChat.id, lastMsg.id, "seen");
    }
  }, [currentMessages.length, activeChat?.id]);

  const handleAssignToMe = async () => {
    if (!activeChat || !agent) return; setIsLoading(true);
    try { await api.assignAgent(activeChat.id, agent.id); updateChat(activeChat.id, { agent, agentId: agent.id, status: "active" }); }
    catch (error) { console.error("Failed to assign chat:", error); } finally { setIsLoading(false); }
  };

  const handleCloseChat = async () => {
    if (!activeChat || !confirm("Are you sure you want to close this chat?")) return;
    try { await api.closeChat(activeChat.id); updateChat(activeChat.id, { status: "closed", closedAt: new Date().toISOString() }); }
    catch (error) { console.error("Failed to close chat:", error); }
  };

  const handleReopenChat = async () => {
    if (!activeChat) return; setIsLoading(true);
    try { await api.reopenChat(activeChat.id); updateChat(activeChat.id, { status: "active", closedAt: undefined }); }
    catch (error) { console.error("Failed to reopen chat:", error); } finally { setIsLoading(false); }
  };

  const handleSendMessage = (content: string, attachments: File[]) => {
    if (!chatId || !agent) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = { id: tempId, chatId, senderId: agent.id, senderType: "agent" as const, senderName: agent.name, content, attachments: [], status: "sending" as const, createdAt: new Date().toISOString() };
    addMessage(chatId, optimisticMessage);

    if (attachments.length > 0) {
      attachments.forEach(async (file) => {
        try {
          const uploaded = await api.uploadFile(file, chatId);
          socketService.sendMessage(chatId, content || file.name, [uploaded]);
        } catch (error) { console.error("Failed to upload file:", error); }
      });
    } else {
      socketService.sendMessage(chatId, content);
    }
  };

  const handleVoiceRecord = (blob: Blob) => {
    if (!chatId) return;
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
    handleSendMessage("", [file]);
  };

  const handleTyping = (isTyping: boolean) => { if (chatId) socketService.sendTyping(chatId, isTyping); };
  const typingNames = Object.values(typingUsers).filter((t) => t.isTyping && t.chatId === chatId).map((t) => t.userName);
  const shouldShowDateSeparator = (index: number) => { if (index === 0) return true; return !isSameDay(new Date(currentMessages[index].createdAt), new Date(currentMessages[index - 1].createdAt)); };

  if (!activeChat) return <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50"><div className="text-center"><div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4"><User className="w-10 h-10 text-gray-400" /></div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No chat selected</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a chat from the sidebar to start</p></div></div>;

  const customer = activeChat.client;
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900/50">
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={activeChat.visitor.name || "Visitor"} size="md" status={activeChat.visitor.status} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{activeChat.visitor.name || `Visitor-${activeChat.visitor.id.slice(0, 6)}`}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${activeChat.visitor.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />{activeChat.visitor.status}</span>
              {activeChat.agent && <span>• Assigned to {activeChat.agent.name}</span>}
              {customer && <span>• {customer.name}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeChat.status === "waiting" && <Button onClick={handleAssignToMe} isLoading={isLoading} size="sm">Assign to Me</Button>}
          {activeChat.status === "active" && <Button variant="danger" size="sm" onClick={handleCloseChat}><X className="w-4 h-4 mr-1" />Close</Button>}
          {activeChat.status === "closed" && <Button variant="secondary" size="sm" onClick={handleReopenChat} isLoading={isLoading}><RefreshCw className="w-4 h-4 mr-1" />Reopen</Button>}
          <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)} className="text-gray-500"><MoreVertical className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
            {currentMessages.length === 0 && <div className="text-center py-12"><p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p></div>}
            {currentMessages.map((msg, index) => (
              <React.Fragment key={msg.id}>
                {shouldShowDateSeparator(index) && <DateSeparator date={msg.createdAt} />}
                <MessageBubble message={msg} isOwn={msg.senderType === "agent"} showAvatar={msg.senderType === "visitor"} senderName={msg.senderName} />
              </React.Fragment>
            ))}
            <TypingIndicator names={typingNames} />
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSend={handleSendMessage} onTyping={handleTyping} onVoiceRecord={handleVoiceRecord} disabled={activeChat.status === "closed"} />
        </div>

        {showInfo && (
          <div className="w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto hidden lg:block">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Customer Info</h4>
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <Avatar name={customer?.name || activeChat.visitor.name || "V"} size="xl" className="mx-auto mb-2" />
                <p className="font-medium text-gray-900 dark:text-gray-100">{customer?.name || activeChat.visitor.name || "Visitor"}</p>
                <Badge variant={activeChat.status === "waiting" ? "warning" : activeChat.status === "active" ? "success" : "default"} size="sm" className="mt-2">{activeChat.status}</Badge>
              </div>
              {customer ? (
                <>
                  <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-700 dark:text-gray-300 truncate">{customer.phone || "—"}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-700 dark:text-gray-300 truncate">{customer.email || "—"}</span></div>
                  <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-700 dark:text-gray-300">{customer.city || "—"}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Tag className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-700 dark:text-gray-300">{customer.currentLeadStatus || "—"}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Globe className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-700 dark:text-gray-300">{customer.plan || "—"}</span></div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <Link href={`/customers/${customer.id}`} target="_blank" className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
                      <ExternalLink className="w-4 h-4" /> View Customer
                    </Link>
                    <Link href={`/customers/${customer.id}/edit`} target="_blank" className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                      Edit Customer
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3 text-xs text-gray-500 dark:text-gray-400">
                  This chat is not linked to a customer yet. You can link it from the chat actions.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
