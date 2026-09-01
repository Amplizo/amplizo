"use client";
import React from "react";
import { Cpu, Phone, MessageCircle, Mail, Clock, User, Tag, Sparkles } from "lucide-react";

const decisions = [
  { id: 1, customer: "Rahul Sharma", action: "WhatsApp", reason: "High trust score, prefers WhatsApp, evening time", timing: "6:00 PM", tone: "Friendly", offer: "10% discount on Premium", status: "scheduled" },
  { id: 2, customer: "Priya Patel", action: "Call", reason: "Medium churn risk, needs personal touch", timing: "12:30 PM", tone: "Professional", offer: "Free upgrade trial", status: "pending" },
  { id: 3, customer: "Amit Kumar", action: "Email", reason: "New customer, needs nurturing", reason2: "Morning time preferred", timing: "10:00 AM", tone: "Welcoming", offer: "Welcome offer 15%", status: "approved" },
  { id: 4, customer: "Sneha Gupta", action: "SMS", reason: "Quick reminder for appointment", timing: "9:00 AM", tone: "Casual", offer: "None", status: "sent" },
  { id: 5, customer: "Vikram Singh", action: "WhatsApp", reason: "Birthday special offer", timing: "11:00 AM", tone: "Celebratory", offer: "Birthday discount 20%", status: "scheduled" },
];

const actionIcons: Record<string, React.ElementType> = { Call: Phone, WhatsApp: MessageCircle, Email: Mail, SMS: Tag };
const actionColors: Record<string, string> = { Call: "green", WhatsApp: "blue", Email: "orange", SMS: "purple" };

export default function AIDecisionsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-indigo-600" /> AI Decision Engine
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">AI khud decide karega - Kisko Call, WhatsApp, Email, SMS, Kab, Kitni Baar, Kis Tone, Kis Offer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2"><Phone className="w-4 h-4" /><span className="text-sm font-medium">Calls</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">247</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2"><MessageCircle className="w-4 h-4" /><span className="text-sm font-medium">WhatsApp</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,892</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
        </div>
        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2"><Mail className="w-4 h-4" /><span className="text-sm font-medium">Emails</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">456</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-2"><Tag className="w-4 h-4" /><span className="text-sm font-medium">SMS</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">892</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Today&apos;s AI Decisions</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {decisions.map((decision) => {
            const ActionIcon = actionIcons[decision.action] || MessageCircle;
            const color = actionColors[decision.action] || "gray";
            return (
              <div key={decision.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
                    <ActionIcon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{decision.customer}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${decision.status === "scheduled" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : decision.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : decision.status === "sent" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"}`}>
                        {decision.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{decision.reason}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {decision.timing}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {decision.tone}</span>
                      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> {decision.offer}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
