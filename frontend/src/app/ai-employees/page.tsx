"use client";
import React, { useState } from "react";
import { Bot, Phone, ShoppingCart, MessageCircle, Users, TrendingUp, BarChart3, Play, Pause, Settings, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const aiEmployees = [
  {
    id: 1,
    name: "AI Receptionist",
    description: "Call receive, appointment book, customer details save, language detect",
    icon: Phone,
    color: "blue",
    status: "active",
    stats: { calls: 247, appointments: 89, languages: 5 },
    features: ["Call Receive", "Appointment Book", "Customer Details Save", "Language Detect"],
    tasks: ["Answer customer calls", "Book appointments", "Save customer information", "Detect & speak in customer language"],
  },
  {
    id: 2,
    name: "AI Sales Agent",
    description: "Product explain, offers, upsell, cross sell, order confirm",
    icon: ShoppingCart,
    color: "green",
    status: "active",
    stats: { sales: 156, revenue: "₹2.4L", conversion: "34%" },
    features: ["Product Explain", "Offers", "Upsell", "Cross Sell", "Order Confirm"],
    tasks: ["Explain products to customers", "Suggest relevant offers", "Upsell premium products", "Cross-sell related items", "Confirm orders"],
  },
  {
    id: 3,
    name: "AI Follow-up Agent",
    description: "Automatically Call, WhatsApp, SMS, Email customers",
    icon: MessageCircle,
    color: "purple",
    status: "active",
    stats: { followups: 892, channels: 4, success: "67%" },
    features: ["Call", "WhatsApp", "SMS", "Email"],
    tasks: ["Automated follow-ups", "Multi-channel communication", "Reminder notifications", "Status tracking"],
  },
  {
    id: 4,
    name: "AI Retention Agent",
    description: "Lost customers recover karega",
    icon: Users,
    color: "orange",
    status: "active",
    stats: { recovered: 234, atRisk: 45, saved: "₹8.2L" },
    features: ["Identify Lost Customers", "Recovery Campaigns", "Win-back Offers", "Re-engagement"],
    tasks: ["Identify churning customers", "Create recovery campaigns", "Send win-back offers", "Re-engage inactive customers"],
  },
  {
    id: 5,
    name: "AI Marketing Manager",
    description: "Campaign banayega, audience choose karega, offer decide karega",
    icon: BarChart3,
    color: "pink",
    status: "active",
    stats: { campaigns: 28, reach: "45K", roi: "340%" },
    features: ["Campaign Creation", "Audience Selection", "Offer Management", "Message Writing", "Image Creation", "Campaign Sending"],
    tasks: ["Create marketing campaigns", "Select target audience", "Decide offers & discounts", "Write compelling messages", "Generate campaign images", "Send campaigns"],
  },
  {
    id: 6,
    name: "AI Business Advisor",
    description: "Owner pooche 'Sales kaise badhega' AI answer",
    icon: TrendingUp,
    color: "indigo",
    status: "active",
    stats: { queries: 1247, insights: 89, accuracy: "94%" },
    features: ["Sales Queries", "Strategy Suggestions", "Market Analysis", "Competitive Insights"],
    tasks: ["Answer business questions", "Suggest sales strategies", "Analyze market trends", "Provide competitive insights"],
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-100 dark:bg-blue-900/40" },
  green: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800", iconBg: "bg-green-100 dark:bg-green-900/40" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", iconBg: "bg-purple-100 dark:bg-purple-900/40" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800", iconBg: "bg-orange-100 dark:bg-orange-900/40" },
  pink: { bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-700 dark:text-pink-400", border: "border-pink-200 dark:border-pink-800", iconBg: "bg-pink-100 dark:bg-pink-900/40" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800", iconBg: "bg-indigo-100 dark:bg-indigo-900/40" },
};

export default function AIEmployeesPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(aiEmployees[0]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Employees</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your AI workforce - 6 AI employees working 24/7 for your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {aiEmployees.map((employee) => {
          const Icon = employee.icon;
          const colors = colorClasses[employee.color];
          const isSelected = selectedEmployee.id === employee.id;
          return (
            <button
              key={employee.id}
              onClick={() => setSelectedEmployee(employee)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-brand-500`
                  : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{employee.name}</h3>
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500" title="Active" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{employee.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {Object.entries(employee.stats).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{value}</span>
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className={`rounded-xl border-2 p-6 ${colorClasses[selectedEmployee.color].bg} ${colorClasses[selectedEmployee.color].border}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colorClasses[selectedEmployee.color].iconBg}`}>
              {React.createElement(selectedEmployee.icon, { className: `w-8 h-8 ${colorClasses[selectedEmployee.color].text}` })}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedEmployee.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{selectedEmployee.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
              <Play className="w-4 h-4" /> Active
            </button>
            <button className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(selectedEmployee.stats).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{key}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Features
            </h3>
            <ul className="space-y-2">
              {selectedEmployee.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Tasks
            </h3>
            <ul className="space-y-2">
              {selectedEmployee.tasks.map((task, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Autonomous Mode</h3>
            <p className="text-brand-100 text-sm mt-1">AI will work even when you&apos;re not in office. Calls, WhatsApp, Appointments, Invoices - everything automatic.</p>
          </div>
          <button className="px-4 py-2 bg-white text-brand-700 rounded-lg font-medium hover:bg-brand-50 transition-colors">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
