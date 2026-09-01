"use client";
import React, { useState } from "react";
import { Brain, ShoppingCart, CreditCard, TrendingUp, MessageCircle, Mail, Phone, Clock, Star, AlertTriangle, Heart, Globe } from "lucide-react";

const customers = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul@example.com",
    avatar: "RS",
    purchaseHistory: { total: 12, value: "₹45,000", lastPurchase: "2 days ago" },
    budget: "₹50,000 - ₹1,00,000",
    behaviour: "Regular buyer, prefers premium products",
    mood: "Happy",
    complaint: "None",
    favouriteProduct: "Premium Package",
    favouriteLanguage: "Hindi",
    callHistory: { total: 5, lastCall: "1 week ago" },
    whatsappHistory: { total: 23, lastMessage: "Today" },
    emailHistory: { total: 8, lastEmail: "3 days ago" },
    preferredTime: "Evening (6-8 PM)",
    trustScore: 85,
    churnRisk: "Low",
    lifetimeValue: "₹2,50,000",
    nextPurchasePrediction: "Premium Package - 78% probability",
  },
  {
    id: 2,
    name: "Priya Patel",
    phone: "+91 87654 32109",
    email: "priya@example.com",
    avatar: "PP",
    purchaseHistory: { total: 8, value: "₹32,000", lastPurchase: "1 week ago" },
    budget: "₹30,000 - ₹80,000",
    behaviour: "Price-sensitive, compares before buying",
    mood: "Neutral",
    complaint: "Delivery delay (resolved)",
    favouriteProduct: "Basic Package",
    favouriteLanguage: "English",
    callHistory: { total: 3, lastCall: "2 weeks ago" },
    whatsappHistory: { total: 15, lastMessage: "3 days ago" },
    emailHistory: { total: 5, lastEmail: "1 week ago" },
    preferredTime: "Afternoon (12-2 PM)",
    trustScore: 72,
    churnRisk: "Medium",
    lifetimeValue: "₹1,80,000",
    nextPurchasePrediction: "Growth Package - 65% probability",
  },
  {
    id: 3,
    name: "Amit Kumar",
    phone: "+91 76543 21098",
    email: "amit@example.com",
    avatar: "AK",
    purchaseHistory: { total: 2, value: "₹8,000", lastPurchase: "1 month ago" },
    budget: "₹10,000 - ₹30,000",
    behaviour: "New customer, exploring options",
    mood: "Interested",
    complaint: "None",
    favouriteProduct: "Starter Package",
    favouriteLanguage: "Hindi",
    callHistory: { total: 1, lastCall: "1 month ago" },
    whatsappHistory: { total: 5, lastMessage: "1 week ago" },
    emailHistory: { total: 2, lastEmail: "1 month ago" },
    preferredTime: "Morning (10 AM-12 PM)",
    trustScore: 45,
    churnRisk: "High",
    lifetimeValue: "₹50,000",
    nextPurchasePrediction: "Starter Package - 45% probability",
  },
];

const getRiskColor = (risk: string) => {
  if (risk === "Low") return "text-green-600 bg-green-100 dark:bg-green-900/30";
  if (risk === "Medium") return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
  return "text-red-600 bg-red-100 dark:bg-red-900/30";
};

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

export default function AIBrainPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" /> AI Customer Brain
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Har customer ka complete AI Memory - Purchase History, Budget, Behaviour, Mood, aur bahut kuch</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Customers</h2>
          {customers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedCustomer.id === customer.id
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
                  {customer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{customer.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(customer.churnRisk)}`}>
                  {customer.churnRisk}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xl">
                {selectedCustomer.avatar}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Trust Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(selectedCustomer.trustScore)}`}>{selectedCustomer.trustScore}/100</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-medium">Purchases</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.purchaseHistory.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.purchaseHistory.value}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs font-medium">Budget</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.budget}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Lifetime Value</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.lifetimeValue}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Churn Risk</span>
              </div>
              <p className={`text-lg font-bold ${selectedCustomer.churnRisk === "Low" ? "text-green-600" : selectedCustomer.churnRisk === "Medium" ? "text-yellow-600" : "text-red-600"}`}>
                {selectedCustomer.churnRisk}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-600" /> Customer Profile
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Behaviour:</span><span className="text-gray-900 dark:text-gray-100">{selectedCustomer.behaviour}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Mood:</span><span className="text-gray-900 dark:text-gray-100">{selectedCustomer.mood}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Favourite Product:</span><span className="text-gray-900 dark:text-gray-100">{selectedCustomer.favouriteProduct}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Favourite Language:</span><span className="text-gray-900 dark:text-gray-100">{selectedCustomer.favouriteLanguage}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Preferred Time:</span><span className="text-gray-900 dark:text-gray-100">{selectedCustomer.preferredTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Complaint:</span><span className="text-gray-900 dark:text-gray-100">{selectedCustomer.complaint}</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Communication History
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><Phone className="w-4 h-4 text-green-600" /></div>
                  <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">Calls</p><p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.callHistory.total} calls, last: {selectedCustomer.callHistory.lastCall}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><MessageCircle className="w-4 h-4 text-green-600" /></div>
                  <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">WhatsApp</p><p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.whatsappHistory.total} messages, last: {selectedCustomer.whatsappHistory.lastMessage}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Mail className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</p><p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.emailHistory.total} emails, last: {selectedCustomer.emailHistory.lastEmail}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6" />
              <div>
                <h3 className="font-bold">AI Prediction</h3>
                <p className="text-purple-100 text-sm mt-1">{selectedCustomer.nextPurchasePrediction}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
