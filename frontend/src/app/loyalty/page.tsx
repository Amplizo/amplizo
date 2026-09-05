"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { Award, Wallet, Star, Gift, Users, TrendingUp, ArrowUpRight, Plus, Gift as GiftIcon, Copy, CheckCircle2 } from "lucide-react";

const mockMembershipTiers = [
  { id: "bronze", name: "Bronze", minSpend: 0, maxSpend: 25000, benefits: ["5% Cashback", "Birthday Reward", "Email Support"], color: "bg-orange-100 text-orange-700" },
  { id: "silver", name: "Silver", minSpend: 25000, maxSpend: 75000, benefits: ["10% Cashback", "Birthday Reward", "Priority Support", "Free Shipping"], color: "bg-gray-100 text-gray-700" },
  { id: "gold", name: "Gold", minSpend: 75000, maxSpend: 150000, benefits: ["15% Cashback", "Birthday Reward", "24/7 Support", "Free Shipping", "Early Access"], color: "bg-yellow-100 text-yellow-700" },
  { id: "platinum", name: "Platinum", minSpend: 150000, maxSpend: Infinity, benefits: ["20% Cashback", "Birthday Reward", "Dedicated Manager", "Free Shipping", "Early Access", "Exclusive Events"], color: "bg-purple-100 text-purple-700" },
];

const mockWallet = {
  balance: 12500,
  cashback: 3200,
  referralBonus: 1800,
  rewardPoints: 7500,
  pendingCashback: 450,
};

const mockTransactions = [
  { id: "TXN-001", type: "Cashback", amount: 500, date: "25 Aug 2026", status: "Credited" },
  { id: "TXN-002", type: "Referral Bonus", amount: 1000, date: "24 Aug 2026", status: "Credited" },
  { id: "TXN-003", type: "Reward Points Redeem", amount: -2000, date: "23 Aug 2026", status: "Debited" },
  { id: "TXN-004", type: "Cashback", amount: 750, date: "22 Aug 2026", status: "Credited" },
  { id: "TXN-005", type: "Birthday Reward", amount: 500, date: "20 Aug 2026", status: "Credited" },
];

const mockReferralStats = [
  { label: "Total Referrals", value: "24", change: "+3 this month" },
  { label: "Successful Conversions", value: "18", change: "+2 this month" },
  { label: "Referral Revenue", value: "₹1.2L", change: "+15%" },
];

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "wallet" | "tiers" | "referrals">("overview");
  const [copiedCode, setCopiedCode] = useState(false);

  const referralCode = "AMPLIZO-REF-2026";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <DashboardLayout title="Loyalty & Rewards" subtitle="Membership tiers, wallet, and referral program">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3"><div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/20"><Wallet className="w-5 h-5 text-brand-600" /></div></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{mockWallet.balance.toLocaleString("en-IN")}</p>
            <p className="text-sm text-gray-500">Wallet Balance</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3"><div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20"><TrendingUp className="w-5 h-5 text-green-600" /></div></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{mockWallet.cashback.toLocaleString("en-IN")}</p>
            <p className="text-sm text-gray-500">Total Cashback</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3"><div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20"><GiftIcon className="w-5 h-5 text-purple-600" /></div></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockWallet.rewardPoints.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Reward Points</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3"><div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20"><Users className="w-5 h-5 text-yellow-600" /></div></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{mockWallet.referralBonus.toLocaleString("en-IN")}</p>
            <p className="text-sm text-gray-500">Referral Bonus</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["wallet", "Wallet"], ["tiers", "Membership Tiers"], ["referrals", "Referrals"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Wallet Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Cashback Earned</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{mockWallet.cashback.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Reward Points</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{mockWallet.rewardPoints.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Pending Cashback</span>
                  <span className="font-semibold text-yellow-600">₹{mockWallet.pendingCashback.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {mockTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div><p className="font-medium text-gray-900 dark:text-gray-100">{txn.type}</p><p className="text-xs text-gray-500">{txn.date}</p></div>
                    <span className={`font-semibold ${txn.amount > 0 ? "text-green-600" : "text-red-600"}`}>{txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
              <p className="text-sm text-brand-100 mb-1">Total Wallet Balance</p>
              <p className="text-4xl font-bold">₹{mockWallet.balance.toLocaleString("en-IN")}</p>
              <div className="flex gap-4 mt-4">
                <div className="bg-white/10 rounded-lg px-4 py-2"><p className="text-xs text-brand-100">Cashback</p><p className="font-semibold">₹{mockWallet.cashback}</p></div>
                <div className="bg-white/10 rounded-lg px-4 py-2"><p className="text-xs text-brand-100">Points</p><p className="font-semibold">{mockWallet.rewardPoints}</p></div>
                <div className="bg-white/10 rounded-lg px-4 py-2"><p className="text-xs text-brand-100">Referral</p><p className="font-semibold">₹{mockWallet.referralBonus}</p></div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">All Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-mono text-gray-500 text-xs">{txn.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{txn.type}</td>
                        <td className={`px-4 py-3 font-medium ${txn.amount > 0 ? "text-green-600" : "text-red-600"}`}>{txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-gray-500">{txn.date}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${txn.status === "Credited" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{txn.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === "tiers" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockMembershipTiers.map((tier) => (
              <div key={tier.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tier.color} text-sm font-medium mb-4`}><Star className="w-4 h-4" />{tier.name}</div>
                <p className="text-sm text-gray-500 mb-4">₹{tier.minSpend.toLocaleString("en-IN")} - {tier.maxSpend === Infinity ? "∞" : `₹${tier.maxSpend.toLocaleString("en-IN")}`} spend</p>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><CheckCircle2 className="w-4 h-4 text-green-500" />{benefit}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === "referrals" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Referral Code</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 font-mono text-lg text-center tracking-wider">{referralCode}</div>
                <button onClick={handleCopyCode} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
                  {copiedCode ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3">Share this code with friends. They get ₹500 off their first purchase, and you get ₹500 in your wallet!</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockReferralStats.map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
