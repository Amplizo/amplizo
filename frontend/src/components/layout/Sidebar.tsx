"use client";
import React, { useRef, useLayoutEffect, useState } from "react";
import { LayoutDashboard, MessageCircle, Users, Clock, UserCog, Settings, User, Search, BarChart3, Bell, FileUp, FileDown, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LogOut } from "lucide-react";

interface SidebarProps { activeRoute: string; onNavigate: (route: string) => void; onLogout?: () => void; }

export function Sidebar({ activeRoute, onNavigate, onLogout }: SidebarProps) {
  const { logout, agent } = useAuthStore();
  const isAdmin = agent?.role === "admin";
  const navRef = useRef<HTMLElement>(null);
  const scrollKey = isAdmin ? "amplizo-admin-sidebar-scroll" : "amplizo-client-sidebar-scroll";
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useLayoutEffect(() => {
    const saved = sessionStorage.getItem(scrollKey);
    if (saved && navRef.current) {
      navRef.current.scrollTop = parseInt(saved, 10);
    }
  }, [scrollKey]);

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const handleScroll = () => {
      sessionStorage.setItem(scrollKey, String(el.scrollTop));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollKey]);

  // Live Chat - shown for both admin and agent
  const primaryItems = [
    { id: "chats", label: "Live Chat", icon: MessageCircle, badge: "primary" as const },
  ];

  const adminNavItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, section: "main" },
    { id: "notifications", label: "Notifications", icon: Bell, section: "main" },
    { id: "customers", label: "Customers", icon: Users, section: "main" },
    { id: "follow-ups", label: "Follow-ups", icon: Clock, section: "main" },
    { id: "search", label: "Global Search", icon: Search, section: "tools" },
    { id: "analytics", label: "Analytics", icon: BarChart3, section: "tools" },
    { id: "settings", label: "Settings", icon: Settings, section: "system" },
    { id: "profile", label: "Profile", icon: User, section: "system" },
    { id: "logout", label: "Logout", icon: LogOut, section: "system", action: "logout" as const },
  ];

  const clientNavItems = [
    { id: "client-dashboard", label: "Dashboard", icon: LayoutDashboard, section: "main" },
    { id: "customers", label: "Customers", icon: Users, section: "main" },
    { id: "follow-ups", label: "Follow-ups", icon: Clock, section: "main" },
    { id: "data-import", label: "Data Import", icon: FileUp, section: "tools" },
    { id: "data-export", label: "Data Export", icon: FileDown, section: "tools" },
    { id: "subscription", label: "Subscription", icon: CreditCard, section: "system" },
    { id: "settings", label: "Settings", icon: Settings, section: "system" },
    { id: "profile", label: "Profile", icon: User, section: "system" },
    { id: "logout", label: "Logout", icon: LogOut, section: "system", action: "logout" as const },
  ];

  const adminSections = [
    { id: "main", label: "MAIN" },
    { id: "tools", label: "TOOLS" },
    { id: "system", label: "SYSTEM" },
  ];

  const clientSections = [
    { id: "main", label: "MAIN" },
    { id: "tools", label: "TOOLS" },
    { id: "system", label: "SYSTEM" },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;
  const sections = isAdmin ? adminSections : clientSections;

  const groupedItems = sections.map(section => ({
    ...section,
    items: navItems.filter(item => item.section === section.id),
  })).filter(section => section.items.length > 0);

  return (
    <aside className="flex flex-col w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <img src="/logo.png" alt="Amplizo" className="h-10 w-10 object-contain shrink-0" />
        <div>
          <div className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">Amplizo</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAdmin ? "Admin Panel" : "AI Platform"}
          </p>
        </div>
      </div>

      <nav ref={navRef} className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Live Chat - shown for client only (admin doesn't have it) */}
{primaryItems.length > 0 && (
            <div className="mb-3">
              {primaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98]",
                      isActive
                        ? "bg-gradient-to-r from-[#0A66FF] to-[#00C6FF] text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 text-[#0A66FF] border border-[#0A66FF] hover:bg-[#0A66FF] hover:text-white dark:hover:bg-[#0A66FF] shadow-sm"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <span className="h-2 w-2 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          )}

        {groupedItems.map((section) => (
          <div key={section.id} className="mb-4">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.id;
                const isLogout = item.action === "logout";
                return (
                  <button
                    key={item.id}
                    onClick={isLogout ? onLogout : () => onNavigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                      isLogout
                        ? "text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                        : isActive
                        ? "bg-[#0A66FF] text-white shadow-sm hover:bg-[#0952CC]"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : isLogout ? "" : "")} />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isActive && !isLogout && <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        isLoading={isLoggingOut}
        onConfirm={async () => {
          setIsLoggingOut(true);
          try {
            await logout();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          } finally {
            setIsLoggingOut(false);
          }
        }}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </aside>
  );
}
