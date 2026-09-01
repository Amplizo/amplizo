"use client";
import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store";

interface DashboardLayoutProps { children: React.ReactNode; title: string; subtitle?: string; }

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { agent } = useAuthStore();
  const isAdmin = agent?.role === "admin";

  const handleNavigate = (route: string) => {
    setActiveRoute(route);
    setSidebarOpen(false);
    const routes: Record<string, string> = {
      "dashboard": "/dashboard",
      "chats": "/chats",
      "account": "/account",
      "client-dashboard": "/client-dashboard",
      "clients": "/clients",
      "subscriptions": "/subscriptions",
      "ai-employees": "/ai-employees",
      "ai-brain": "/ai-brain",
      "ai-decisions": "/ai-decisions",
      "ai-predictions": "/ai-predictions",
      "whatsapp": "/whatsapp",
      "crm": "/crm",
      "leads": "/leads",
      "timeline": "/timeline",
      "sales-dashboard": "/sales-dashboard",
      "inventory": "/inventory",
      "billing": "/billing",
      "loyalty": "/loyalty",
      "reviews": "/reviews",
      "employees": "/employees",
      "branches": "/branches",
      "integrations": "/integrations",
      "security": "/security",
      "plans": "/plans",
    };
    if (routes[route]) {
      window.location.href = routes[route];
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar activeRoute={activeRoute} onNavigate={handleNavigate} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
