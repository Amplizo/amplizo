"use client";
import React from "react";

export function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-gray-200 dark:bg-gray-700 ${className || ""}`} />;
}
