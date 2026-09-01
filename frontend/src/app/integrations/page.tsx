"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MessageSquare, Calendar, Sheet, FileText, ShoppingBag, Store, CreditCard, Mail, Smartphone, Phone, Globe, CheckCircle2, XCircle, Settings, ExternalLink, ChevronRight, Plus, Search } from "lucide-react";

const integrations = [
  { id: "whatsapp", name: "WhatsApp Business API", icon: MessageSquare, description: "Send and receive WhatsApp messages at scale", status: "connected", category: "Communication" },
  { id: "google-calendar", name: "Google Calendar", icon: Calendar, description: "Sync appointments and meetings", status: "connected", category: "Productivity" },
  { id: "google-sheets", name: "Google Sheets", icon: Sheet, description: "Export data and reports to Sheets", status: "disconnected", category: "Productivity" },
  { id: "tally", name: "Tally", icon: FileText, description: "Sync accounting and invoicing data", status: "disconnected", category: "Accounting" },
  { id: "shopify", name: "Shopify", icon: ShoppingBag, description: "Connect your Shopify store", status: "connected", category: "E-commerce" },
  { id: "woocommerce", name: "WooCommerce", icon: Store, description: "Sync WooCommerce orders and products", status: "disconnected", category: "E-commerce" },
  { id: "pos", name: "POS System", icon: CreditCard, description: "Integrate with your point of sale", status: "connected", category: "Business" },
  { id: "payment-gateway", name: "Payment Gateway", icon: CreditCard, description: "Accept online payments", status: "connected", category: "Business" },
  { id: "email", name: "Email", icon: Mail, description: "Send transactional and marketing emails", status: "connected", category: "Communication" },
  { id: "sms", name: "SMS", icon: Smartphone, description: "Send SMS notifications and alerts", status: "disconnected", category: "Communication" },
  { id: "voice-api", name: "Voice API", icon: Phone, description: "Make and receive voice calls", status: "disconnected", category: "Communication" },
  { id: "web", name: "Website Widget", icon: Globe, description: "Embed chat widget on your website", status: "connected", category: "Communication" },
];

const categories = ["All", "Communication", "Productivity", "Accounting", "E-commerce", "Business"];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "integrations" | "setup">("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = integrations.filter((int) => {
    const matchesCategory = selectedCategory === "All" || int.category === selectedCategory;
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) || int.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const disconnectedCount = integrations.filter(i => i.status === "disconnected").length;

  return (
    <DashboardLayout title="Integrations" subtitle="Connect your favorite tools and platforms">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{integrations.length}</p>
            <p className="text-sm text-gray-500">Total Integrations</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
            <p className="text-sm text-gray-500">Connected</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-yellow-600">{disconnectedCount}</p>
            <p className="text-sm text-gray-500">Disconnected</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
            <p className="text-sm text-gray-500">Available</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["integrations", "Integrations"], ["setup", "Setup Guide"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Connected Integrations</h3>
              <div className="space-y-3">
                {integrations.filter(i => i.status === "connected").map((int) => {
                  const Icon = int.icon;
                  return (
                    <div key={int.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600"><Icon className="w-5 h-5" /></div>
                        <div><p className="font-medium text-gray-900 dark:text-gray-100">{int.name}</p><p className="text-xs text-gray-500">{int.category}</p></div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600"><CheckCircle2 className="w-4 h-4" />Connected</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Available to Connect</h3>
              <div className="space-y-3">
                {integrations.filter(i => i.status === "disconnected").map((int) => {
                  const Icon = int.icon;
                  return (
                    <div key={int.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500"><Icon className="w-5 h-5" /></div>
                        <div><p className="font-medium text-gray-900 dark:text-gray-100">{int.name}</p><p className="text-xs text-gray-500">{int.category}</p></div>
                      </div>
                      <button className="text-brand-600 text-sm font-medium hover:text-brand-700">Connect</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search integrations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{cat}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((int) => {
                const Icon = int.icon;
                return (
                  <div key={int.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${int.status === "connected" ? "bg-brand-100 dark:bg-brand-900/30 text-brand-600" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}><Icon className="w-6 h-6" /></div>
                      <div><p className="font-semibold text-gray-900 dark:text-gray-100">{int.name}</p><span className={`text-xs font-medium ${int.status === "connected" ? "text-green-600" : "text-gray-500"}`}>{int.status === "connected" ? "Connected" : "Not Connected"}</span></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{int.description}</p>
                    <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${int.status === "connected" ? "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" : "bg-brand-600 text-white hover:bg-brand-700"}`}>
                      {int.status === "connected" ? "Configure" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === "setup" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Setup Guide</h3>
            <div className="space-y-6">
              {[
                { step: 1, title: "Connect WhatsApp Business API", description: "Verify your business phone number and connect to WhatsApp Business Platform.", time: "5 min" },
                { step: 2, title: "Sync Google Calendar", description: "Allow Amplizo to access your calendar for appointment scheduling.", time: "2 min" },
                { step: 3, title: "Configure Payment Gateway", description: "Set up UPI, cards, and net banking for seamless payments.", time: "10 min" },
                { step: 4, title: "Install Website Widget", description: "Copy the embed code and paste it on your website to start chatting.", time: "3 min" },
                { step: 5, title: "Invite Your Team", description: "Add agents and assign roles for collaborative customer management.", time: "5 min" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                    <span className="text-xs text-gray-500 mt-2 inline-block">{item.time}</span>
                  </div>
                  <button className="text-brand-600 hover:text-brand-700"><ChevronRight className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
