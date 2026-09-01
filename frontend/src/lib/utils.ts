import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday, isSameDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(dateString: string): string {
  return format(new Date(dateString), "h:mm a");
}

export function formatChatListTime(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd MMM");
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function isAcceptedFileType(file: File): { valid: boolean; type?: "image" | "video" | "audio" } {
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const videoTypes = ["video/mp4", "video/quicktime", "video/webm"];
  const audioTypes = ["audio/mpeg", "audio/wav", "audio/aac", "audio/ogg", "audio/webm"];
  if (imageTypes.includes(file.type)) return { valid: true, type: "image" };
  if (videoTypes.includes(file.type)) return { valid: true, type: "video" };
  if (audioTypes.includes(file.type)) return { valid: true, type: "audio" };
  return { valid: false };
}

export { isSameDay };
