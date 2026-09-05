"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  allow: Array<"admin" | "agent">;
  fallback: string;
  children: React.ReactNode;
}

export function RoleGuard({ allow, fallback, children }: RoleGuardProps) {
  const router = useRouter();
  const { agent, token } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = token || localStorage.getItem("amplizo_token");
    const r = (agent?.role as string | undefined) || localStorage.getItem("amplizo_role") || "";
    if (!t) {
      router.replace("/login");
      return;
    }
    if (!allow.includes(r as any)) {
      router.replace(fallback);
      return;
    }
    setReady(true);
  }, [router, allow, fallback, token, agent]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-6 h-6 animate-spin text-[#0A66FF]" />
      </div>
    );
  }
  return <>{children}</>;
}
