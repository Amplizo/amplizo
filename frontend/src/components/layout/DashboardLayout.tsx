"use client";
import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps { children: React.ReactNode; title: string; subtitle?: string; }

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { agent } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = agent?.role === "admin";

  useEffect(() => { setMounted(true); }, []);

  // Map URL path to nav id (use current path immediately, fallback to dashboard default for /dashboard)
  const activeRoute = useMemo(() => {
    const map: Record<string, string> = {
      "/dashboard": "overview",
      "/customers": "customers",
      "/follow-ups": "follow-ups",
      "/employees": "employees",
      "/chats": "chats",
      "/notifications": "notifications",
      "/search": "search",
      "/analytics": "analytics",
      "/settings": "settings",
      "/profile": "profile",
      "/client-dashboard": "client-dashboard",
      "/data-import": "data-import",
      "/data-export": "data-export",
      "/subscription": "subscription",
    };
    return map[pathname] || "";
  }, [pathname]);

  const handleNavigate = (route: string) => {
    setSidebarOpen(false);
    const pageRoutes: Record<string, string> = {
      "chats": "/chats",
      "customers": "/customers",
      "follow-ups": "/follow-ups",
      "notifications": "/notifications",
      "search": "/search",
      "analytics": "/analytics",
      "settings": "/settings",
      "profile": "/profile",
      "account": "/account",
      "client-dashboard": "/client-dashboard",
      "overview": "/dashboard",
      "employees": "/employees",
      "data-import": "/data-import",
      "data-export": "/data-export",
      "subscription": "/subscription",
    };
    const target = pageRoutes[route];
    if (target) router.push(target);
  };

  // Avoid hydration mismatch: render with empty active route on first paint
  // Once mounted, sidebar gets correct active state
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar activeRoute={mounted ? activeRoute : ""} onNavigate={handleNavigate} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
