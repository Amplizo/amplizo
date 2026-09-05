import React from "react";

export type LeadStatus = "NEW" | "HOT_LEAD" | "COLD_LEAD" | "NOT_INTERESTED";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  HOT_LEAD: "Hot Lead",
  COLD_LEAD: "Cold Lead",
  NOT_INTERESTED: "Not Interested",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; ring: string; dot: string }> = {
  NEW: {
    bg: "bg-slate-50 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    ring: "ring-slate-200 dark:ring-slate-700",
    dot: "bg-slate-400",
  },
  HOT_LEAD: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    ring: "ring-red-200 dark:ring-red-800/50",
    dot: "bg-red-500",
  },
  COLD_LEAD: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    ring: "ring-blue-200 dark:ring-blue-800/50",
    dot: "bg-blue-500",
  },
  NOT_INTERESTED: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    ring: "ring-gray-200 dark:ring-gray-700",
    dot: "bg-gray-400",
  },
};

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function LeadStatusBadge({ status, className = "", showDot = true }: LeadStatusBadgeProps) {
  const s = (status as LeadStatus) in LEAD_STATUS_LABELS ? (status as LeadStatus) : "NEW";
  const colors = LEAD_STATUS_COLORS[s];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />}
      {LEAD_STATUS_LABELS[s]}
    </span>
  );
}

export const FOLLOW_UP_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
  CANCELLED: "Cancelled",
};

export const FOLLOW_UP_STATUS_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  PENDING: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-800/50",
  },
  COMPLETED: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-200 dark:ring-emerald-800/50",
  },
  SKIPPED: {
    bg: "bg-slate-50 dark:bg-slate-800/60",
    text: "text-slate-600 dark:text-slate-400",
    ring: "ring-slate-200 dark:ring-slate-700",
  },
  CANCELLED: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-200 dark:ring-rose-800/50",
  },
};

export function FollowUpStatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const colors = FOLLOW_UP_STATUS_COLORS[status] || FOLLOW_UP_STATUS_COLORS.PENDING;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring} ${className}`}
    >
      {FOLLOW_UP_STATUS_LABELS[status] || status}
    </span>
  );
}
