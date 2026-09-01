"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface DateSeparatorProps { date: string; }

export function DateSeparator({ date }: DateSeparatorProps) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (messageDate.toDateString() === today.toDateString()) label = "Today";
  else if (messageDate.toDateString() === yesterday.toDateString()) label = "Yesterday";
  else label = messageDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">{label}</span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
