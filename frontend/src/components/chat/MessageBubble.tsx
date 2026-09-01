"use client";
import React from "react";
import { cn, formatMessageTime, formatFileSize } from "@/lib/utils";
import type { Message, Attachment } from "@/lib/types";
import { Check, CheckCheck, Clock, AlertCircle, Play, FileText, Download } from "lucide-react";

interface MessageBubbleProps { message: Message; isOwn: boolean; showAvatar?: boolean; senderName?: string; }

export function MessageBubble({ message, isOwn, showAvatar, senderName }: MessageBubbleProps) {
  const statusIcon = {
    sending: <Clock className="w-3 h-3 text-gray-400" />,
    sent: <Check className="w-3 h-3 text-gray-400" />,
    delivered: <CheckCheck className="w-3 h-3 text-gray-400" />,
    seen: <CheckCheck className="w-3 h-3 text-blue-500" />,
    failed: <AlertCircle className="w-3 h-3 text-red-500" />,
  };

  return (
    <div className={cn("flex gap-2 animate-fade-in", isOwn ? "flex-row-reverse" : "flex-row")}>
      {showAvatar && !isOwn && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 shrink-0 mt-auto">
          {senderName?.[0]?.toUpperCase() || "A"}
        </div>
      )}
      {!showAvatar && <div className="w-8" />}
      <div className={cn("max-w-[70%] group", isOwn ? "items-end" : "items-start")}>
        <div className={cn("rounded-2xl px-4 py-2.5 shadow-sm", isOwn ? "bg-brand-600 text-white rounded-br-md" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md", message.status === "failed" && "opacity-70")}>
          {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((att) => <AttachmentPreview key={att.id} attachment={att} />)}
            </div>
          )}
        </div>
        <div className={cn("flex items-center gap-1.5 mt-1 px-1", isOwn ? "justify-end" : "justify-start")}>
          <span className="text-xs text-gray-400">{formatMessageTime(message.createdAt)}</span>
          {isOwn && statusIcon[message.status]}
          {message.status === "failed" && <span className="text-xs text-red-500">Failed to send</span>}
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  if (attachment.type === "image") {
    return <a href={attachment.url} target="_blank" rel="noopener noreferrer"><img src={attachment.thumbnailUrl || attachment.url} alt={attachment.fileName} className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" data-unoptimized="true" /></a>;
  }
  if (attachment.type === "video") {
    return <video src={attachment.url} controls className="max-w-full rounded-lg max-h-48" preload="metadata"><source src={attachment.url} type={attachment.mimeType} /></video>;
  }
  if (attachment.type === "audio") {
    return (
      <div className="flex items-center gap-3 bg-black/10 dark:bg-white/10 rounded-lg p-3">
        <button className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 hover:bg-brand-700 transition-colors"><Play className="w-4 h-4 ml-0.5" /></button>
        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{attachment.fileName}</p><p className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</p></div>
      </div>
    );
  }
  return (
    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-black/10 dark:bg-white/10 rounded-lg p-3 hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
      <FileText className="w-8 h-8 shrink-0" />
      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{attachment.fileName}</p><p className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</p></div>
      <Download className="w-4 h-4 shrink-0" />
    </a>
  );
}
