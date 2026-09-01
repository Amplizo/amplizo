"use client";
import React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useConnectionStore } from "@/store/connection";
import { cn } from "@/lib/utils";

export function ConnectionIndicator() {
  const { isConnected, isReconnecting } = useConnectionStore();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-xs font-medium text-green-700 dark:text-green-400">Connected</span>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <RefreshCw className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-spin" />
        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
      <span className="text-xs font-medium text-red-700 dark:text-red-400">Disconnected</span>
    </div>
  );
}
