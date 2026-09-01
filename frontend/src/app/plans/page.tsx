"use client";
import React, { useState } from "react";
import { Check, X, Zap, Crown, Building2, Star, ArrowRight } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "₹999",
    period: "/month",
    description: "Small businesses ke liye perfect start",
    icon: Zap,
    color: "blue",
    popular: false,
    features: [
      { name: "AI Receptionist", included: true, limit: "100 calls/month" },
      { name: "AI Sales Agent", included: true, limit: "50 sales/month" },
      { name: "AI Follow-up Agent", included: true, limit: "200 follow-ups" },
      { name: "AI Retention Agent", included: false, limit: null },
      { name: "AI Marketing Manager", included: false, limit: null },
      { name: "AI Business Advisor", included: false, limit: null },
      { name: "AI Customer Brain", included: true, limit: "500 customers" },
      { name: "AI Decision Engine", included: false, limit: null },
      { name: "AI Predictions", included: false, limit: null },
      { name: "Smart CRM", included: true, limit: "Basic" },
      { name: "Lead Management", included: true, limit: "100 leads" },
      { name: "WhatsApp Automation", included: true, limit: "500 messages" },
      { name: "Customer Timeline", included: true, limit: null },
      { name: "Sales Dashboard", included: false, limit: null },
      { name: "Inventory Management", included: false, limit: null },
      { name: "Billing & Invoices", included: true, limit: "Basic" },
      { name: "Loyalty & Rewards", included: false, limit: null },
      { name: "Review Manager", included: false, limit: null },
      { name: "Employee Management", included: false, limit: null },
      { name: "Multi Branch", included: false, limit: null },
      { name: "Integrations", included: true, limit: "3 integrations" },
      { name: "Security Features", included: true, limit: "Basic" },
      { name: "Support", included: true, limit: "Email" },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹2,999",
    period: "/month",
    description: "Growing businesses ke liye recommended",
    icon: Crown,
    color: "purple",
    popular: true,
    features: [
      { name: "AI Receptionist", included: true, limit: "500 calls/month" },
      { name: "AI Sales Agent", included: true, limit: "200 sales/month" },
      { name: "AI Follow-up Agent", included: true, limit: "1000 follow-ups" },
      { name: "AI Retention Agent", included: true, limit: "100 recoveries" },
      { name: "AI Marketing Manager", included: true, limit: "10 campaigns" },
      { name: "AI Business Advisor", included: true, limit: "500 queries" },
      { name: "AI Customer Brain", included: true, limit: "2500 customers" },
      { name: "AI Decision Engine", included: true, limit: null },
      { name: "AI Predictions", included: true, limit: "100 predictions" },
      { name: "Smart CRM", included: true, limit: "Advanced" },
      { name: "Lead Management", included: true, limit: "500 leads" },
      { name: "WhatsApp Automation", included: true, limit: "2500 messages" },
      { name: "Customer Timeline", included: true, limit: null },
      { name: "Sales Dashboard", included: true, limit: null },
      { name: "Inventory Management", included: true, limit: "1000 products" },
      { name: "Billing & Invoices", included: true, limit: "Advanced" },
      { name: "Loyalty & Rewards", included: true, limit: "Basic" },
      { name: "Review Manager", included: true, limit: null },
      { name: "Employee Management", included: true, limit: "5 employees" },
      { name: "Multi Branch", included: false, limit: null },
      { name: "Integrations", included: true, limit: "10 integrations" },
      { name: "Security Features", included: true, limit: "Advanced" },
      { name: "Support", included: true, limit: "Priority Email + Chat" },
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "₹7,999",
    period: "/month",
    description: "Established businesses ke liye full power",
    icon: Building2,
    color: "orange",
    popular: false,
    features: [
      { name: "AI Receptionist", included: true, limit: "Unlimited" },
      { name: "AI Sales Agent", included: true, limit: "Unlimited" },
      { name: "AI Follow-up Agent", included: true, limit: "Unlimited" },
      { name: "AI Retention Agent", included: true, limit: "Unlimited" },
      { name: "AI Marketing Manager", included: true, limit: "Unlimited" },
      { name: "AI Business Advisor", included: true, limit: "Unlimited" },
      { name: "AI Customer Brain", included: true, limit: "Unlimited" },
      { name: "AI Decision Engine", included: true, limit: "Unlimited" },
      { name: "AI Predictions", included: true, limit: "Unlimited" },
      { name: "Smart CRM", included: true, limit: "Enterprise" },
      { name: "Lead Management", included: true, limit: "Unlimited" },
      { name: "WhatsApp Automation", included: true, limit: "Unlimited" },
      { name: "Customer Timeline", included: true, limit: null },
      { name: "Sales Dashboard", included: true, limit: null },
      { name: "Inventory Management", included: true, limit: "Unlimited" },
      { name: "Billing & Invoices", included: true, limit: "Enterprise" },
      { name: "Loyalty & Rewards", included: true, limit: "Advanced" },
      { name: "Review Manager", included: true, limit: null },
      { name: "Employee Management", included: true, limit: "25 employees" },
      { name: "Multi Branch", included: true, limit: "10 branches" },
      { name: "Integrations", included: true, limit: "Unlimited" },
      { name: "Security Features", included: true, limit: "Enterprise" },
      { name: "Support", included: true, limit: "24/7 Phone + Chat" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹25,000+",
    period: "/month",
    description: "Large organizations ke liye custom solution",
    icon: Star,
    color: "indigo",
    popular: false,
    features: [
      { name: "AI Receptionist", included: true, limit: "Unlimited" },
      { name: "AI Sales Agent", included: true, limit: "Unlimited" },
      { name: "AI Follow-up Agent", included: true, limit: "Unlimited" },
      { name: "AI Retention Agent", included: true, limit: "Unlimited" },
      { name: "AI Marketing Manager", included: true, limit: "Unlimited" },
      { name: "AI Business Advisor", included: true, limit: "Unlimited" },
      { name: "AI Customer Brain", included: true, limit: "Unlimited" },
      { name: "AI Decision Engine", included: true, limit: "Unlimited" },
      { name: "AI Predictions", included: true, limit: "Unlimited" },
      { name: "Smart CRM", included: true, limit: "Custom" },
      { name: "Lead Management", included: true, limit: "Unlimited" },
      { name: "WhatsApp Automation", included: true, limit: "Unlimited" },
      { name: "Customer Timeline", included: true, limit: null },
      { name: "Sales Dashboard", included: true, limit: null },
      { name: "Inventory Management", included: true, limit: "Unlimited" },
      { name: "Billing & Invoices", included: true, limit: "Custom" },
      { name: "Loyalty & Rewards", included: true, limit: "Custom" },
      { name: "Review Manager", included: true, limit: null },
      { name: "Employee Management", included: true, limit: "Unlimited" },
      { name: "Multi Branch", included: true, limit: "Unlimited" },
      { name: "Integrations", included: true, limit: "Custom API" },
      { name: "Security Features", included: true, limit: "Enterprise+" },
      { name: "Support", included: true, limit: "Dedicated Manager" },
      { name: "Custom AI Training", included: true, limit: null },
      { name: "White Label", included: true, limit: null },
      { name: "SLA Guarantee", included: true, limit: "99.9% uptime" },
    ],
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; button: string; iconBg: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", button: "bg-blue-600 hover:bg-blue-700", iconBg: "bg-blue-100 dark:bg-blue-900/40" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", button: "bg-purple-600 hover:bg-purple-700", iconBg: "bg-purple-100 dark:bg-purple-900/40" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800", button: "bg-orange-600 hover:bg-orange-700", iconBg: "bg-orange-100 dark:bg-orange-900/40" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800", button: "bg-indigo-600 hover:bg-indigo-700", iconBg: "bg-indigo-100 dark:bg-indigo-900/40" },
};

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Choose Your Plan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">All plans include 14-day free trial. No credit card required.</p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-brand-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === "yearly"
                ? "bg-brand-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Yearly <span className="text-green-600 dark:text-green-400 text-sm ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const colors = colorClasses[plan.color];
          const price = billingCycle === "yearly"
            ? `₹${Math.round(parseInt(plan.price.replace(/[₹,]/g, "")) * 0.8).toLocaleString()}`
            : plan.price;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 transition-all duration-200 ${
                plan.popular
                  ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-brand-500`
                  : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className={`inline-flex p-3 rounded-xl ${colors.iconBg} mb-4`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{price}</span>
                <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                {billingCycle === "yearly" && plan.price !== "₹25,000+" && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Billed yearly</p>
                )}
              </div>

              <button className={`w-full py-2.5 rounded-lg font-medium text-white transition-colors ${colors.button}`}>
                {plan.id === "enterprise" ? "Contact Sales" : "Start Free Trial"}
              </button>

              <div className="mt-6 space-y-3">
                {plan.features.slice(0, 8).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
                      {feature.name}
                      {feature.limit && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({feature.limit})</span>
                      )}
                    </span>
                  </div>
                ))}
                {plan.features.length > 8 && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                    +{plan.features.length - 8} more features
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Need a Custom Plan?</h2>
            <p className="text-brand-100 mt-2">Enterprise customers get dedicated support, custom AI training, and SLA guarantees.</p>
          </div>
          <button className="px-6 py-3 bg-white text-brand-700 rounded-lg font-medium hover:bg-brand-50 transition-colors flex items-center gap-2">
            Contact Sales <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">14-Day Free Trial</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try any plan free for 14 days. No credit card required.</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Cancel Anytime</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">No long-term contracts. Cancel your subscription anytime.</p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Money-Back Guarantee</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">30-day money-back guarantee if you&apos;re not satisfied.</p>
        </div>
      </div>
    </div>
  );
}
