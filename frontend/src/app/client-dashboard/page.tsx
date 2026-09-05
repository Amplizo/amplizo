"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store";
import api from "@/lib/api";
import { Users, UserPlus, PhoneCall, Calendar, TrendingUp, TrendingDown, ArrowUpRight, Plus, X, Eye, Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle, XCircle, MessageCircle, Star, IndianRupee, Activity, Target, Zap, Award, Heart, ShoppingCart, BarChart3 } from "lucide-react";
import { AddCustomerModal } from "@/components/crm/AddCustomerModal";
import { ScheduleCallModal } from "@/components/crm/ScheduleCallModal";
import { SendWhatsAppModal } from "@/components/crm/SendWhatsAppModal";
import { SendEmailModal } from "@/components/crm/SendEmailModal";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  lastContact: string;
  followups: number;
  nextFollowup: string;
  totalSpent: number;
  rating: number;
  city: string;
  source: string;
  joinDate: string;
}

const initialCustomers: Customer[] = [
  { id: "1", name: "Rahul Verma", phone: "+91 98765 43210", email: "rahul@company.com", status: "Active", lastContact: "2 hours ago", followups: 3, nextFollowup: "Tomorrow 10:00 AM", totalSpent: 45000, rating: 4.8, city: "Mumbai", source: "Website", joinDate: "15 Jan 2026" },
  { id: "2", name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@business.in", status: "Active", lastContact: "1 day ago", followups: 1, nextFollowup: "Today 3:00 PM", totalSpent: 32000, rating: 4.5, city: "Delhi", source: "Referral", joinDate: "22 Feb 2026" },
  { id: "3", name: "Amit Kumar", phone: "+91 76543 21098", email: "amit@startup.io", status: "Pending", lastContact: "3 days ago", followups: 5, nextFollowup: "Overdue", totalSpent: 8000, rating: 3.2, city: "Bangalore", source: "Google", joinDate: "10 Mar 2026" },
  { id: "4", name: "Neha Patel", phone: "+91 65432 10987", email: "neha@enterprise.com", status: "Active", lastContact: "5 hours ago", followups: 2, nextFollowup: "Tomorrow 2:00 PM", totalSpent: 67000, rating: 4.9, city: "Pune", source: "Social Media", joinDate: "05 Jan 2026" },
  { id: "5", name: "Vikram Singh", phone: "+91 54321 09876", email: "vikram@corp.in", status: "Inactive", lastContact: "1 week ago", followups: 0, nextFollowup: "Not scheduled", totalSpent: 12000, rating: 3.8, city: "Chennai", source: "Direct", joinDate: "20 Feb 2026" },
  { id: "6", name: "Sneha Gupta", phone: "+91 43210 98765", email: "sneha@tech.co", status: "VIP", lastContact: "30 min ago", followups: 1, nextFollowup: "Today 5:00 PM", totalSpent: 125000, rating: 5.0, city: "Hyderabad", source: "Referral", joinDate: "01 Jan 2026" },
];

const mockFollowups = [
  { id: "F001", customer: "Rahul Verma", customerId: "1", type: "Call", subject: "Product Demo", date: "Today 10:00 AM", status: "Pending", notes: "Discuss pricing", priority: "High" },
  { id: "F002", customer: "Priya Sharma", customerId: "2", type: "Email", subject: "Follow-up", date: "Today 3:00 PM", status: "Pending", notes: "Send proposal", priority: "Medium" },
  { id: "F003", customer: "Amit Kumar", customerId: "3", type: "Meeting", subject: "Contract Sign", date: "Tomorrow 11:00 AM", status: "Scheduled", notes: "Final meeting", priority: "High" },
  { id: "F004", customer: "Neha Patel", customerId: "4", type: "Call", subject: "Support", date: "Tomorrow 2:00 PM", status: "Scheduled", notes: "Technical support", priority: "Low" },
  { id: "F005", customer: "Sneha Gupta", customerId: "6", type: "WhatsApp", subject: "Renewal", date: "Today 5:00 PM", status: "Pending", notes: "Plan renewal discussion", priority: "High" },
];

const mockActivities = [
  { id: 1, type: "call", customer: "Rahul Verma", action: "Incoming call received", time: "2 min ago", icon: PhoneCall, color: "green" },
  { id: 2, type: "whatsapp", customer: "Priya Sharma", action: "Message received", time: "15 min ago", icon: MessageCircle, color: "blue" },
  { id: 3, type: "review", customer: "Neha Patel", action: "5-star review received", time: "1 hour ago", icon: Star, color: "yellow" },
  { id: 4, type: "purchase", customer: "Sneha Gupta", action: "New order - ₹25,000", time: "2 hours ago", icon: ShoppingCart, color: "purple" },
  { id: 5, type: "followup", customer: "Amit Kumar", action: "Follow-up completed", time: "3 hours ago", icon: CheckCircle2, color: "green" },
  { id: 6, type: "lead", customer: "New Lead", action: "Lead captured from website", time: "4 hours ago", icon: UserPlus, color: "blue" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "VIP": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "Pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Inactive": return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "Medium": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "Low": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400";
  }
};

const getActivityColor = (color: string) => {
  const colors: Record<string, string> = {
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };
  return colors[color] || colors.blue;
};

export default function ClientDashboard() {
  const router = useRouter();
  const { agent } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"overview" | "customers" | "followups" | "analytics">("overview");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [showSendWhatsApp, setShowSendWhatsApp] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState<{ total: number; active: number; vip: number; todayNew: number; hot: number; cold: number; notInterested: number; pendingFollowUps: number } | null>(null);
  const [followUpStats, setFollowUpStats] = useState<{ pending: number; completed: number; todayDue: number; overdue: number } | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", notes: "", city: "", source: "Website" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, stats, fuStats] = await Promise.all([
          api.getCustomers({ take: 100 }).catch(() => ({ items: [], total: 0 })),
          api.getCustomerStats().catch(() => null),
          api.getFollowUpStats().catch(() => null),
        ]);
        if (cancelled) return;
        const items = (list && (list.items || list)) as any[];
        setCustomers(items || []);
        if (stats) setCustomerStats(stats);
        if (fuStats) setFollowUpStats(fuStats);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [showAddCustomer, showScheduleCall, showSendWhatsApp, showSendEmail]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAddCustomerLocal = () => {
    setShowAddCustomer(false);
    setNewCustomer({ name: "", phone: "", email: "", notes: "", city: "", source: "Website" });
    showSuccess("Customer added successfully! Follow-ups scheduled for +3, +7, and +15 days.");
  };

  const totalCustomers = customerStats?.total ?? 0;
  const activeCustomers = customerStats?.active ?? 0;
  const vipCustomers = customerStats?.vip ?? 0;
  const pendingFollowups = followUpStats?.pending ?? 0;
  const totalFollowUps = followUpStats ? (followUpStats.pending + followUpStats.completed) : 0;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgRating = "0";

  const filteredCustomers = customerSearch.trim()
    ? customers.filter((c) => {
        const q = customerSearch.trim().toLowerCase();
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q) || c.city.toLowerCase().includes(q);
      })
    : customers;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <DashboardLayout title="My Dashboard" subtitle={`${getGreeting()}, ${agent?.name || "User"}!`}>
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-white shadow-lg">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 p-6 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{getGreeting()}, {agent?.name || "User"}!</h2>
                <p className="text-brand-100 mt-1">Here is what is happening with your business today.</p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-brand-100 text-sm">{currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-2xl font-bold mt-1">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-brand-100 text-xs">Total Revenue</p>
                <p className="text-xl font-bold">₹{(totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-brand-100 text-xs">Customers</p>
                <p className="text-xl font-bold">{totalCustomers}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-brand-100 text-xs">Pending Tasks</p>
                <p className="text-xl font-bold">{pendingFollowups}</p>
              </div>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="bg-white text-brand-700 hover:bg-white/95 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-bold text-base">Add Customer</span>
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            href="/customers"
            className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" />{totalCustomers > 0 ? `${customerStats?.todayNew ?? 0} new` : "0"}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">Total Customers</p>
          </Link>
          <Link
            href="/customers?filter=active"
            className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" />Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">Active</p>
          </Link>
          <Link
            href="/customers?filter=vip"
            className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs text-purple-600 flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full"><Star className="w-3 h-3" />VIP</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{vipCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">VIP Customers</p>
          </Link>
          <Link
            href="/follow-ups"
            className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">{pendingFollowups} pending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalFollowUps}</p>
            <p className="text-sm text-gray-500 mt-1">Follow-ups</p>
          </Link>
          <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-900/20 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <span className="text-xs text-green-600 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" />5%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgRating}</p>
            <p className="text-sm text-gray-500 mt-1">Avg Rating</p>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview", Activity], ["customers", "My Customers", Users], ["followups", "Follow-ups", Calendar], ["analytics", "Analytics", BarChart3]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                  <button className="text-sm text-brand-600 font-medium hover:text-brand-700">View All</button>
                </div>
                <div className="space-y-3">
                  {mockActivities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.color)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.customer}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Upcoming Follow-ups</h3>
                  <button onClick={() => setActiveTab("followups")} className="text-sm text-brand-600 font-medium hover:text-brand-700">View All</button>
                </div>
                <div className="space-y-3">
                  {mockFollowups.filter(f => f.status === "Pending").slice(0, 3).map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
                          {f.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{f.customer}</p>
                          <p className="text-xs text-gray-500">{f.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(f.priority)}`}>{f.priority}</span>
                        <p className="text-xs text-gray-500 mt-1">{f.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => setShowAddCustomer(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors">
                    <Plus className="w-5 h-5" /><span className="font-medium">Add Customer</span>
                  </button>
                  <button onClick={() => setShowScheduleCall(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <PhoneCall className="w-5 h-5" /><span className="font-medium">Schedule Call</span>
                  </button>
                  <button onClick={() => setShowSendWhatsApp(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <MessageCircle className="w-5 h-5" /><span className="font-medium">Send WhatsApp</span>
                  </button>
                  <button onClick={() => setShowSendEmail(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <Mail className="w-5 h-5" /><span className="font-medium">Send Email</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Customers</h3>
                <div className="space-y-3">
                  {[...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 4).map((c, idx) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-gray-100 text-gray-700" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">₹{(c.totalSpent / 1000).toFixed(0)}K spent</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-yellow-500" />
                        <span className="text-xs font-medium">{c.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl p-6 text-white">
                <Zap className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                <p className="text-brand-100 text-sm mt-1">Unlock AI Predictions, Autonomous Mode, and more!</p>
                <button
                  onClick={() => router.push("/subscription")}
                  className="mt-4 w-full py-2 bg-white text-brand-700 rounded-lg font-medium hover:bg-brand-50 transition-colors flex items-center justify-center gap-2"
                >
                  View Plans
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "customers" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Customers ({filteredCustomers.length})</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input type="text" placeholder="Search customers..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm w-64" />
                  <Eye className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button onClick={() => setShowAddCustomer(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
                  <Plus className="w-4 h-4" />Add Customer
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Followup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
                            {c.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Phone className="w-3 h-3" />{c.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><MapPin className="w-3 h-3" />{c.city}</div>
                      </td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>{c.status}</span></td>
                      <td className="px-4 py-3"><span className="font-medium text-gray-900 dark:text-gray-100">₹{c.totalSpent.toLocaleString()}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${c.nextFollowup === "Overdue" ? "text-red-600 font-medium" : "text-gray-600 dark:text-gray-400"}`}>{c.nextFollowup}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customerSearch.trim() && filteredCustomers.length === 0 && (
                <div className="p-8 text-center text-gray-500">No customers found matching &quot;{customerSearch}&quot;</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "followups" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Follow-ups ({mockFollowups.length})</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-sm font-medium">Pending ({mockFollowups.filter(f => f.status === "Pending").length})</button>
                <button className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium">Scheduled ({mockFollowups.filter(f => f.status === "Scheduled").length})</button>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockFollowups.map((f) => (
                <div key={f.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
                        {f.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{f.customer}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(f.priority)}`}>{f.priority}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{f.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">{f.notes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${f.status === "Pending" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>{f.status}</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-2 font-medium">{f.date}</p>
                      <p className="text-xs text-gray-500">{f.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Customer Growth</span>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">+23%</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Conversion Rate</span>
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">34%</p>
                <p className="text-xs text-green-600 mt-1">+5% from last month</p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Retention Rate</span>
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">87%</p>
                <p className="text-xs text-red-600 mt-1">-2% from last month</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue by Customer</h3>
                <div className="space-y-3">
                  {[...customers].sort((a, b) => b.totalSpent - a.totalSpent).map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xs">
                        {c.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">₹{c.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full" style={{ width: `${(c.totalSpent / 125000) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Customer Sources</h3>
                <div className="space-y-3">
                  {[
                    { source: "Website", count: 45, percentage: 35 },
                    { source: "Referral", count: 32, percentage: 25 },
                    { source: "Google", count: 28, percentage: 22 },
                    { source: "Social Media", count: 15, percentage: 12 },
                    { source: "Direct", count: 8, percentage: 6 },
                  ].map((item) => (
                    <div key={item.source} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-24">{item.source}</span>
                      <div className="flex-1">
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-12 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedCustomer(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xl">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Spent</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.rating}</p>
                    <p className="text-xs text-gray-500 mt-1">Rating</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.followups}</p>
                    <p className="text-xs text-gray-500 mt-1">Follow-ups</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">{selectedCustomer.status}</p>
                    <p className="text-xs text-gray-500 mt-1">Status</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">City</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <UserPlus className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Source</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddCustomer && (
          <AddCustomerModal
            onClose={() => setShowAddCustomer(false)}
            onCreated={() => {
              handleAddCustomerLocal();
            }}
          />
        )}
        {showScheduleCall && (
          <ScheduleCallModal
            onClose={() => setShowScheduleCall(false)}
            onScheduled={() => {
              showSuccess("Call scheduled successfully!");
            }}
          />
        )}
        {showSendWhatsApp && (
          <SendWhatsAppModal
            onClose={() => setShowSendWhatsApp(false)}
            onSent={() => {
              showSuccess("WhatsApp message sent successfully!");
            }}
          />
        )}
        {showSendEmail && (
          <SendEmailModal
            onClose={() => setShowSendEmail(false)}
            onSent={() => {
              showSuccess("Email sent successfully!");
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
