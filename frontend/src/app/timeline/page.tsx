"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { Clock, ShoppingBag, Phone, MessageSquare, AlertTriangle, Ticket, Star, ChevronRight, Filter, Search, Calendar } from "lucide-react";

const mockCustomers = [
  { id: "1", name: "Rahul Verma", phone: "+91 98765 43210", email: "rahul@company.com", city: "Mumbai", totalSpend: 125000, visits: 24 },
  { id: "2", name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@business.in", city: "Delhi", totalSpend: 89000, visits: 18 },
  { id: "3", name: "Amit Kumar", phone: "+91 76543 21098", email: "amit@startup.io", city: "Bangalore", totalSpend: 45000, visits: 12 },
  { id: "4", name: "Neha Patel", phone: "+91 65432 10987", email: "neha@enterprise.com", city: "Pune", totalSpend: 23000, visits: 6 },
];

const interactionTypes: Record<string, { icon: typeof ShoppingBag; color: string; bg: string }> = {
  purchase: { icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
  call: { icon: Phone, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  whatsapp: { icon: MessageSquare, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
  complaint: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  review: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  coupon: { icon: Ticket, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
};

const mockTimelineData: Record<string, { date: string; interactions: { type: keyof typeof interactionTypes; title: string; description: string; amount?: number }[] }[]> = {
  "1": [
    { date: "25 Aug 2026", interactions: [
      { type: "purchase", title: "New Purchase", description: "Bought Premium Package - ₹25,000", amount: 25000 },
      { type: "review", title: "Left Review", description: "Rated 5 stars on Google" },
    ]},
    { date: "20 Aug 2026", interactions: [
      { type: "call", title: "Support Call", description: "Discussed upgrade options" },
    ]},
    { date: "15 Aug 2026", interactions: [
      { type: "whatsapp", title: "WhatsApp Message", description: "Sent birthday discount coupon" },
      { type: "coupon", title: "Coupon Used", description: "Applied BIRTHDAY50 - Saved ₹500", amount: 500 },
    ]},
    { date: "10 Aug 2026", interactions: [
      { type: "purchase", title: "New Purchase", description: "Bought Basic Package - ₹8,000", amount: 8000 },
    ]},
    { date: "05 Aug 2026", interactions: [
      { type: "complaint", title: "Complaint Raised", description: "Issue with delivery - Resolved" },
    ]},
  ],
  "2": [
    { date: "24 Aug 2026", interactions: [
      { type: "call", title: "Sales Call", description: "Discussed enterprise plan" },
    ]},
    { date: "20 Aug 2026", interactions: [
      { type: "whatsapp", title: "WhatsApp Message", description: "Sent festival offer" },
      { type: "coupon", title: "Coupon Used", description: "Applied FESTIVAL20 - Saved ₹2,000", amount: 2000 },
    ]},
  ],
  "3": [
    { date: "23 Aug 2026", interactions: [
      { type: "purchase", title: "New Purchase", description: "Bought Starter Package - ₹3,000", amount: 3000 },
    ]},
    { date: "18 Aug 2026", interactions: [
      { type: "review", title: "Left Review", description: "Rated 4 stars on Google" },
    ]},
  ],
  "4": [
    { date: "22 Aug 2026", interactions: [
      { type: "complaint", title: "Complaint Raised", description: "Refund request - Pending" },
    ]},
  ],
};

export default function TimelinePage() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("1");
  const [filterType, setFilterType] = useState<string>("All");

  const customerData = mockTimelineData[selectedCustomer] || [];
  const filteredData = filterType === "All" ? customerData : customerData.map(day => ({
    ...day,
    interactions: day.interactions.filter(i => i.type === filterType)
  })).filter(day => day.interactions.length > 0);

  const allInteractionTypes = Array.from(new Set(customerData.flatMap(day => day.interactions.map(i => i.type))));

  return (
    <DashboardLayout title="Customer Timeline" subtitle="View complete customer journey and interactions">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* Customer Selector */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                {mockCustomers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.city}</option>
                ))}
              </select>
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
              <option value="All">All Interactions</option>
              {allInteractionTypes.map((type) => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Info */}
        {selectedCustomer && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            {(() => {
              const customer = mockCustomers.find(c => c.id === selectedCustomer);
              if (!customer) return null;
              return (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl">{customer.name.split(" ").map(n => n[0]).join("")}</div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.email} · {customer.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Spend: ₹{customer.totalSpend.toLocaleString("en-IN")} · {customer.visits} visits</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Interaction Timeline</h3>
          <div className="space-y-6">
            {filteredData.map((day, dayIndex) => (
              <div key={dayIndex} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-brand-600" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{day.date}</p>
                </div>
                <div className="ml-6 pl-8 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
                  {day.interactions.map((interaction, index) => {
                    const typeConfig = interactionTypes[interaction.type];
                    const Icon = typeConfig.icon;
                    return (
                      <div key={index} className={`relative flex items-start gap-4 p-4 rounded-xl ${typeConfig.bg}`}>
                        <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center ${typeConfig.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{interaction.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{interaction.description}</p>
                          {interaction.amount && <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-2">₹{interaction.amount.toLocaleString("en-IN")}</p>}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${typeConfig.color} bg-white dark:bg-gray-800`}>{interaction.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
