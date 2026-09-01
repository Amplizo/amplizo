"use client";
import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { useChatStore, useVisitorStore } from "@/store";
import { api } from "@/lib/api";
import { generateId } from "@/lib/utils";
import { socketService } from "@/lib/socket";
import { isSameDay } from "date-fns";
import type { Message, Visitor } from "@/lib/types";

export function VisitorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"form" | "chat">("form");
  const [isLoading, setIsLoading] = useState(false);
  const { visitor, setVisitor } = useVisitorStore();
  const { messages, addMessage, activeChat, setActiveChat, typingUsers, addChat } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = activeChat?.id;
  const currentMessages = activeChat?.id ? messages[activeChat.id] || [] : [];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [currentMessages.length]);
  useEffect(() => { if (visitor && step === "form") setStep("chat"); }, [visitor, step]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const visitorData: Visitor = { id: generateId(), name: name || undefined, email: email || undefined, status: "online", createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString() };
      setVisitor(visitorData);
      const chat = await api.createChat(visitorData.id);
      addChat(chat); setActiveChat(chat); setStep("chat");
    } catch (error) { console.error("Failed to start chat:", error); } finally { setIsLoading(false); }
  };

  const handleSendMessage = (content: string, attachments: File[]) => {
    if (!chatId) return;
    const optimisticMessage: Message = { id: generateId(), chatId, senderId: visitor?.id || "", senderType: "visitor", senderName: visitor?.name, content, status: "sending", createdAt: new Date().toISOString() };
    addMessage(chatId, optimisticMessage);
    socketService.sendMessage(chatId, content);
    setTimeout(() => { useChatStore.getState().updateMessage(chatId, optimisticMessage.id, { status: "sent" }); }, 500);
  };

  const handleVoiceRecord = (blob: Blob) => { if (chatId) handleSendMessage("", [new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" })]); };
  const handleTyping = (isTyping: boolean) => { if (chatId) socketService.sendTyping(chatId, isTyping); };
  const typingNames = Object.values(typingUsers).filter((t) => t.isTyping && t.chatId === chatId).map((t) => t.userName);
  const shouldShowDateSeparator = (index: number) => { if (index === 0) return true; return !isSameDay(new Date(currentMessages[index].createdAt), new Date(currentMessages[index - 1].createdAt)); };

  if (!isOpen) return <div className="fixed bottom-6 right-6 z-50"><Button onClick={() => setIsOpen(true)} size="lg" className="rounded-full shadow-lg bg-brand-600 hover:bg-brand-700 h-14 w-14"><MessageCircle className="w-6 h-6" /></Button></div>;

  if (isMinimized) return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-t-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 bg-brand-600 text-white">
          <span className="font-semibold text-sm">Chat Support</span>
          <div className="flex gap-1">
            <button onClick={() => setIsMinimized(false)} className="p-1 hover:bg-white/20 rounded"><Minimize2 className="w-4 h-4 rotate-180" /></button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded"><X className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-slide-up">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[32rem] max-h-[calc(100vh-6rem)]">
        <div className="flex items-center justify-between px-4 py-3 bg-brand-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><MessageCircle className="w-4 h-4" /></div>
            <div><p className="font-semibold text-sm">Chat Support</p><p className="text-xs text-white/80">We typically reply instantly</p></div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><Minimize2 className="w-4 h-4" /></button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
        {step === "form" ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-8 h-8 text-brand-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Welcome!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a conversation with our team</p>
            </div>
            <form onSubmit={handleStartChat} className="space-y-4">
              <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="email" placeholder="Your email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" className="w-full" isLoading={isLoading}>Start Chat</Button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {currentMessages.length === 0 && <div className="text-center py-12"><div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3"><MessageCircle className="w-6 h-6 text-gray-400" /></div><p className="text-sm text-gray-500 dark:text-gray-400">Send a message to start the conversation</p></div>}
              {currentMessages.map((msg, index) => (
                <React.Fragment key={msg.id}>
                  {shouldShowDateSeparator(index) && <DateSeparator date={msg.createdAt} />}
                  <MessageBubble message={msg} isOwn={msg.senderType === "visitor"} showAvatar={msg.senderType === "agent"} senderName={msg.senderName} />
                </React.Fragment>
              ))}
              <TypingIndicator names={typingNames} />
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSendMessage} onTyping={handleTyping} onVoiceRecord={handleVoiceRecord} disabled={!activeChat || activeChat.status === "closed"} />
          </>
        )}
      </div>
    </div>
  );
}
