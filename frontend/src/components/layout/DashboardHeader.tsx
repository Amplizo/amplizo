"use client";
import React, { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Moon, Sun, Menu, Search, X, Check, Clock, AlertCircle, Info, UserPlus, MessageCircle, ShoppingCart } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuthStore, useUIStore } from "@/store";

interface DashboardHeaderProps { title: string; subtitle?: string; onMenuClick?: () => void; }

const mockNotifications = [
  { id: 1, type: "message", title: "New message from Rahul", time: "2 min ago", read: false, icon: MessageCircle, color: "blue" },
  { id: 2, type: "order", title: "New order received - ₹25,000", time: "15 min ago", read: false, icon: ShoppingCart, color: "green" },
  { id: 3, type: "user", title: "New client registered", time: "1 hour ago", read: true, icon: UserPlus, color: "purple" },
  { id: 4, type: "alert", title: "Follow-up overdue for Amit", time: "2 hours ago", read: true, icon: AlertCircle, color: "red" },
  { id: 5, type: "info", title: "System update completed", time: "3 hours ago", read: true, icon: Info, color: "gray" },
];

const mockSearchResults = [
  { id: 1, type: "customer", title: "Rahul Verma", subtitle: "rahul@company.com" },
  { id: 2, type: "customer", title: "Priya Sharma", subtitle: "priya@business.in" },
  { id: 3, type: "chat", title: "Chat #1234", subtitle: "Active conversation" },
  { id: 4, type: "order", title: "Order #ORD-5678", subtitle: "₹25,000 - Pending" },
];

const getNotificationColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    gray: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  };
  return colors[color] || colors.gray;
};

export function DashboardHeader({ title, subtitle, onMenuClick }: DashboardHeaderProps) {
  const { agent, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockSearchResults>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const handleLogout = () => { logout(); if (typeof window !== "undefined") window.location.href = "/login"; };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = mockSearchResults.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"><Menu className="w-5 h-5" /></button>
        <div className="hidden md:block"><h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>{subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}</div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
            <Search className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center w-64">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers, chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Search Dropdown */}
          {showSearch && searchQuery.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Search Results</span>
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? searchResults.map((result) => (
                  <button key={result.id} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                      {result.title.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{result.title}</p>
                      <p className="text-xs text-gray-500">{result.subtitle}</p>
                    </div>
                  </button>
                )) : (
                  <div className="p-4 text-center text-sm text-gray-500">No results found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-gray-500">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)} className="text-gray-500 relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadCount}</span>}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
                <button className="text-xs text-brand-600 font-medium hover:text-brand-700">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div key={notification.id} className={`flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!notification.read ? "bg-brand-50/50 dark:bg-brand-900/10" : ""}`}>
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.color)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{notification.time}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-brand-500 rounded-full mt-2" />}
                    </div>
                  );
                })}
              </div>
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full py-2 text-sm text-brand-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-gray-200 dark:border-gray-700">
          <Avatar name={agent?.name || "Agent"} size="sm" />
          <div className="hidden md:block"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent?.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{agent?.role}</p></div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 ml-1"><LogOut className="w-5 h-5" /></Button>
        </div>
      </div>
    </header>
  );
}
