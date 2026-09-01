"use client";
import React, { useState } from "react";
import { Send, Paperclip, Smile, Mic, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, isAcceptedFileType } from "@/lib/utils";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface ChatInputProps {
  onSend: (content: string, attachments: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  onVoiceRecord?: (blob: Blob) => void;
  disabled?: boolean;
  replyTo?: string;
  onCancelReply?: () => void;
}

export function ChatInput({ onSend, onTyping, onVoiceRecord, disabled, replyTo, onCancelReply }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    onSend(message.trim(), attachments);
    setMessage("");
    setAttachments([]);
    onTyping?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping?.(e.target.value.length > 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => isAcceptedFileType(f).valid);
    setAttachments((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => setAttachments((prev) => prev.filter((_, i) => i !== index));

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        onVoiceRecord?.(new Blob(chunks, { type: "audio/webm" }));
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (err) { console.error("Failed to start recording:", err); }
  };

  const stopRecording = () => { recorder?.stop(); setIsRecording(false); setRecorder(null); };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="w-1 h-8 bg-brand-500 rounded-full" />
          <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">Replying to message</span>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {attachments.length > 0 && (
        <div className="flex gap-2 p-3 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {attachments.map((file, index) => {
            const accepted = isAcceptedFileType(file);
            return (
              <div key={index} className="relative group flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {accepted.type === "image" && <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" data-unoptimized="true" />}
                {accepted.type === "video" && <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"><Video className="w-8 h-8 text-gray-400" /></div>}
                {accepted.type === "audio" && <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"><Mic className="w-8 h-8 text-gray-400" /></div>}
                <button onClick={() => removeAttachment(index)} className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
        <div className="flex gap-1">
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={handleFileSelect} />
          <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={disabled} className="text-gray-500 hover:text-brand-600"><Paperclip className="w-5 h-5" /></Button>
          <div className="relative">
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmoji(!showEmoji)} disabled={disabled} className="text-gray-500 hover:text-brand-600"><Smile className="w-5 h-5" /></Button>
            {showEmoji && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <EmojiPicker onEmojiClick={(emojiData) => { setMessage((prev) => prev + emojiData.emoji); setShowEmoji(false); }} width={300} height={400} />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 relative">
          <textarea value={message} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Type a message..." disabled={disabled} rows={1}
            className={cn("w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent max-h-32 scrollbar-thin")}
            style={{ minHeight: "42px" }} />
        </div>
        {message.trim() ? (
          <Button type="button" onClick={handleSend} disabled={disabled} size="icon" className="bg-brand-600 hover:bg-brand-700 text-white rounded-full"><Send className="w-5 h-5" /></Button>
        ) : (
          <Button type="button" variant={isRecording ? "danger" : "ghost"} size="icon" onClick={isRecording ? stopRecording : startRecording} disabled={disabled}
            className={cn("rounded-full", isRecording && "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse")}>
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
