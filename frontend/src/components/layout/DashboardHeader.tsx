"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bell, LogOut, Moon, Sun, Menu, Search, X, Clock, AlertCircle, Info, UserPlus, MessageCircle, ShoppingCart, Users, MessageSquare, User, Check, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuthStore, useUIStore } from "@/store";
import { api } from "@/lib/api";

interface DashboardHeaderProps { title: string; subtitle?: string; onMenuClick?: () => void; }

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface SearchResult {
  id: string;
  type: "client" | "agent" | "chat" | "visitor";
  title: string;
  subtitle: string;
  badge?: string;
  status?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message": return MessageCircle;
    case "order": return ShoppingCart;
    case "user": return UserPlus;
    case "alert": return AlertCircle;
    case "info": return Info;
    case "chat": return MessageSquare;
    case "client": return Users;
    default: return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "message": return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    case "order": return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    case "user": return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
    case "alert": return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    case "info": return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    case "chat": return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
    case "client": return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  }
};

const getSearchIcon = (type: string) => {
  switch (type) {
    case "client": return Users;
    case "agent": return User;
    case "chat": return MessageSquare;
    case "visitor": return UserPlus;
    default: return Search;
  }
};

const getSearchColor = (type: string) => {
  switch (type) {
    case "client": return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    case "agent": return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    case "chat": return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
    case "visitor": return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  }
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export function DashboardHeader({ title, subtitle, onMenuClick }: DashboardHeaderProps) {
  const { agent, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => { setShowLogoutDialog(true); };

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const [notifs, countData] = await Promise.all([
        api.getNotifications(),
        api.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(countData.count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

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

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      setIsSearching(true);
      setSearchError(false);
      const isAdmin = agent?.role === "admin";
      const data = isAdmin ? await api.globalSearch(query) : await api.publicSearch(query);
      const allResults: SearchResult[] = [
        ...(data.clients || []),
        ...(data.agents || []),
        ...(data.chats || []),
        ...(data.visitors || []),
      ];
      setSearchResults(allResults);
    } catch (error) {
      setSearchError(true);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [agent?.role]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchQuery.length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      const notif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleClearRead = async () => {
    try {
      await api.clearReadNotifications();
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
    }
  };

  const totalResults = searchResults.length;

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
                onFocus={() => setShowSearch(true)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Search Dropdown */}
          {showSearch && searchQuery.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  {isSearching ? "Searching..." : searchError ? "Search failed" : `${totalResults} result${totalResults !== 1 ? "s" : ""} found`}
                </span>
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <div className="animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchError ? (
                  <div className="p-4 text-center text-sm text-red-500">Failed to search. Please try again.</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.some(r => r.type === "client") && (
                      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 uppercase">Clients</div>
                    )}
                    {searchResults.filter(r => r.type === "client").map((result) => {
                      const Icon = getSearchIcon(result.type);
                      return (
                        <button key={`${result.type}-${result.id}`} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getSearchColor(result.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                          </div>
                          {result.badge && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{result.badge}</span>}
                        </button>
                      );
                    })}
                    {searchResults.some(r => r.type === "agent") && (
                      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 uppercase">Agents</div>
                    )}
                    {searchResults.filter(r => r.type === "agent").map((result) => {
                      const Icon = getSearchIcon(result.type);
                      return (
                        <button key={`${result.type}-${result.id}`} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getSearchColor(result.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                          </div>
                          {result.badge && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{result.badge}</span>}
                        </button>
                      );
                    })}
                    {searchResults.some(r => r.type === "chat") && (
                      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 uppercase">Chats</div>
                    )}
                    {searchResults.filter(r => r.type === "chat").map((result) => {
                      const Icon = getSearchIcon(result.type);
                      return (
                        <button key={`${result.type}-${result.id}`} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getSearchColor(result.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                    {searchResults.some(r => r.type === "visitor") && (
                      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 uppercase">Visitors</div>
                    )}
                    {searchResults.filter(r => r.type === "visitor").map((result) => {
                      const Icon = getSearchIcon(result.type);
                      return (
                        <button key={`${result.type}-${result.id}`} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getSearchColor(result.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No results found for &quot;{searchQuery}&quot;</div>
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
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-xs text-brand-600 font-medium hover:text-brand-700">Mark all read</button>
                  )}
                  {notifications.some(n => n.read) && (
                    <button onClick={handleClearRead} className="text-xs text-red-500 font-medium hover:text-red-600">Clear read</button>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <div className="animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <div key={notification.id} className={`flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!notification.read ? "bg-brand-50/50 dark:bg-brand-900/10" : ""}`}>
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(notification.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {!notification.read && (
                            <button onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Mark as read">
                              <Check className="w-3 h-3 text-gray-400" />
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification.id); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Delete">
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                )}
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
    </header>
  );
}
