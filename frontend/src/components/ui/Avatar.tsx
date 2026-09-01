"use client";
import React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps { name: string; src?: string; size?: "sm" | "md" | "lg" | "xl"; status?: "online" | "offline" | "away"; className?: string; }

export function Avatar({ name, src, size = "md", status, className }: AvatarProps) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base", xl: "h-16 w-16 text-lg" };
  const statusSizes = { sm: "h-2.5 w-2.5 border", md: "h-3 w-3 border-2", lg: "h-3.5 w-3.5 border-2", xl: "h-4 w-4 border-2" };
  const statusColors = { online: "bg-green-500", offline: "bg-gray-400", away: "bg-yellow-500" };

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size])} />
      ) : (
        <div className={cn("rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold", sizes[size], "dark:bg-brand-900 dark:text-brand-300")}>
          {getInitials(name)}
        </div>
      )}
      {status && <span className={cn("absolute bottom-0 right-0 rounded-full border-white dark:border-gray-900", statusSizes[size], statusColors[status])} />}
    </div>
  );
}
