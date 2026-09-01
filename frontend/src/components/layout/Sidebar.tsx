"use client";
import React from "react";
import { LayoutDashboard, MessageCircle, User, LogOut, Zap, Users, CreditCard, Bot, Brain, Cpu, BarChart3, MessageSquare, Clock, Package, IndianRupee, Award, UserCheck, TrendingUp, Settings, ShoppingCart, FileText, Star, Shield, Building2, Smartphone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

interface SidebarProps { activeRoute: string; onNavigate: (route: string) => void; }

export function Sidebar({ activeRoute, onNavigate }: SidebarProps) {
  const { logout, agent } = useAuthStore();
  const isAdmin = agent?.role === "admin";

  const adminNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "main" },
    { id: "chats", label: "Chats", icon: MessageCircle, section: "main" },
    { id: "clients", label: "Clients", icon: Users, section: "main" },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard, section: "main" },
    { id: "account", label: "My Account", icon: User, section: "account" },
  ];

  const clientNavItems = [
    { id: "client-dashboard", label: "Dashboard", icon: LayoutDashboard, section: "overview" },
    { id: "ai-employees", label: "AI Employees", icon: Bot, section: "overview" },
    { id: "ai-brain", label: "AI Customer Brain", icon: Brain, section: "overview" },
    { id: "ai-decisions", label: "AI Decisions", icon: Cpu, section: "overview" },
    { id: "ai-predictions", label: "AI Predictions", icon: TrendingUp, section: "overview" },
    { id: "chats", label: "Live Chats", icon: MessageCircle, section: "communication" },
    { id: "whatsapp", label: "WhatsApp Automation", icon: MessageSquare, section: "communication" },
    { id: "crm", label: "Smart CRM", icon: Users, section: "sales" },
    { id: "leads", label: "Lead Management", icon: UserCheck, section: "sales" },
    { id: "timeline", label: "Customer Timeline", icon: Clock, section: "sales" },
    { id: "sales-dashboard", label: "Sales Dashboard", icon: BarChart3, section: "sales" },
    { id: "inventory", label: "Inventory", icon: Package, section: "business" },
    { id: "billing", label: "Billing & Invoices", icon: IndianRupee, section: "business" },
    { id: "loyalty", label: "Loyalty & Rewards", icon: Award, section: "business" },
    { id: "reviews", label: "Review Manager", icon: Star, section: "business" },
    { id: "employees", label: "Employees", icon: Users, section: "business" },
    { id: "branches", label: "Multi Branch", icon: Building2, section: "business" },
    { id: "integrations", label: "Integrations", icon: Globe, section: "settings" },
    { id: "security", label: "Security", icon: Shield, section: "settings" },
    { id: "account", label: "Subscription", icon: CreditCard, section: "settings" },
  ];

  const sections = [
    { id: "overview", label: "AI Overview" },
    { id: "communication", label: "Communication" },
    { id: "sales", label: "Sales & CRM" },
    { id: "business", label: "Business Tools" },
    { id: "settings", label: "Settings" },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  const groupedItems = sections.map(section => ({
    ...section,
    items: navItems.filter(item => item.section === section.id),
  })).filter(section => section.items.length > 0);

  return (
    <aside className="flex flex-col w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-gray-100">Amplizo</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAdmin ? "Admin Panel" : "AI Platform"}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        {groupedItems.map((section) => (
          <div key={section.id} className="mb-4">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive && "text-brand-600 dark:text-brand-400")} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === "ai-employees" && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">6</span>
                    )}
                    {item.id === "ai-brain" && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">AI</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => { logout(); window.location.href = "/login"; }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
