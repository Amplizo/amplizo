"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { CheckCircle2, XCircle, CreditCard, Calendar, Zap, Users, MessageSquare, BarChart3, Shield, Phone, ArrowUpRight, Loader2, Sparkles, Crown } from "lucide-react";
import { useAuthStore } from "@/store";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: { icon: React.ElementType; text: string; included: boolean }[];
  highlighted?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    description: "Get started with the basics",
    cta: "Current Plan",
    features: [
      { icon: Users, text: "Up to 50 customers", included: true },
      { icon: MessageSquare, text: "100 messages/month", included: true },
      { icon: BarChart3, text: "Basic analytics", included: true },
      { icon: Zap, text: "AI responses (50/month)", included: true },
      { icon: Phone, text: "WhatsApp integration", included: false },
      { icon: Shield, text: "Priority support", included: false },
      { icon: Sparkles, text: "AI autonomous mode", included: false },
      { icon: Crown, text: "Custom branding", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    period: "month",
    description: "Best for growing businesses",
    cta: "Upgrade to Pro",
    highlighted: true,
    features: [
      { icon: Users, text: "Up to 1,000 customers", included: true },
      { icon: MessageSquare, text: "Unlimited messages", included: true },
      { icon: BarChart3, text: "Advanced analytics & reports", included: true },
      { icon: Zap, text: "Unlimited AI responses", included: true },
      { icon: Phone, text: "WhatsApp + SMS integration", included: true },
      { icon: Shield, text: "Priority support", included: true },
      { icon: Sparkles, text: "AI autonomous mode", included: true },
      { icon: Crown, text: "Custom branding", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 2999,
    period: "month",
    description: "For large-scale operations",
    cta: "Contact Sales",
    features: [
      { icon: Users, text: "Unlimited customers", included: true },
      { icon: MessageSquare, text: "Unlimited messages", included: true },
      { icon: BarChart3, text: "Custom reports & API access", included: true },
      { icon: Zap, text: "Custom AI training", included: true },
      { icon: Phone, text: "All channels (WhatsApp/SMS/Email/Voice)", included: true },
      { icon: Shield, text: "Dedicated account manager", included: true },
      { icon: Sparkles, text: "AI autonomous mode + custom flows", included: true },
      { icon: Crown, text: "White-label + custom branding", included: true },
    ],
  },
];

interface SubscriptionState {
  plan: "free" | "pro" | "enterprise";
  status: "active" | "cancelled" | "expired" | "trial";
  startedAt: string;
  expiresAt: string | null;
  autoRenew: boolean;
  paymentMethod: string | null;
  amount: number;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { agent } = useAuthStore();
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = () => {
    try {
      const saved = localStorage.getItem("amplizo_subscription");
      if (saved) {
        setSubscription(JSON.parse(saved));
      } else {
        // Default subscription based on role
        const isEnterprise = agent?.email?.includes("enterprise") || agent?.email?.includes("admin");
        const defaultSub: SubscriptionState = isEnterprise
          ? { plan: "enterprise", status: "active", startedAt: new Date().toISOString(), expiresAt: null, autoRenew: true, paymentMethod: "Invoice", amount: 2999 }
          : { plan: "free", status: "active", startedAt: new Date().toISOString(), expiresAt: null, autoRenew: false, paymentMethod: null, amount: 0 };
        setSubscription(defaultSub);
        localStorage.setItem("amplizo_subscription", JSON.stringify(defaultSub));
      }
    } catch {}
    setLoading(false);
  };

  const saveSubscription = (sub: SubscriptionState) => {
    setSubscription(sub);
    localStorage.setItem("amplizo_subscription", JSON.stringify(sub));
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === subscription?.plan) {
      setSuccessMsg(`You are already on the ${plan.name} plan`);
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }
    if (plan.id === "free") {
      // Downgrade to free
      const newSub: SubscriptionState = { plan: "free", status: "active", startedAt: new Date().toISOString(), expiresAt: null, autoRenew: false, paymentMethod: null, amount: 0 };
      saveSubscription(newSub);
      setSuccessMsg("Downgraded to Free plan");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }
    setShowPayment(plan.id);
  };

  const handlePayment = (planId: string) => {
    setUpgrading(planId);
    setTimeout(() => {
      const plan = PLANS.find(p => p.id === planId);
      if (!plan) return;
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);
      const newSub: SubscriptionState = {
        plan: planId as any,
        status: "active",
        startedAt: new Date().toISOString(),
        expiresAt: expires.toISOString(),
        autoRenew: true,
        paymentMethod: "Card ending 4242",
        amount: plan.price,
      };
      saveSubscription(newSub);
      setUpgrading(null);
      setShowPayment(null);
      setSuccessMsg(`Successfully upgraded to ${plan.name} plan!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1500);
  };

  const handleCancel = () => {
    if (!subscription) return;
    if (!confirm("Are you sure you want to cancel auto-renewal? Your plan stays active until expiry.")) return;
    saveSubscription({ ...subscription, autoRenew: false });
    setSuccessMsg("Auto-renewal cancelled. Plan stays active until expiry.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleReactivate = () => {
    if (!subscription) return;
    saveSubscription({ ...subscription, autoRenew: true });
    setSuccessMsg("Auto-renewal reactivated!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <DashboardLayout title="Subscription" subtitle="Manage your plan">
        <BackButton className="mb-3" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Subscription" subtitle="Manage your plan and billing">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton className="mb-2" fallback={agent?.role === "admin" ? "/dashboard" : "/client-dashboard"} />
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {subscription && (
          <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-white/80">Current Plan</span>
                </div>
                <h2 className="text-3xl font-bold capitalize">{subscription.plan}</h2>
                <p className="text-white/80 mt-1">
                  ₹{subscription.amount}/month • {subscription.status === "active" ? "Active" : subscription.status}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Started {formatDate(subscription.startedAt)}</span>
                  </div>
                  {subscription.expiresAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Renews {formatDate(subscription.expiresAt)}</span>
                    </div>
                  )}
                  {subscription.paymentMethod && (
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      <span>{subscription.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {subscription.autoRenew ? (
                  <button onClick={handleCancel} className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-sm font-medium transition-colors">
                    Cancel Auto-Renew
                  </button>
                ) : subscription.plan !== "free" ? (
                  <button onClick={handleReactivate} className="px-4 py-2 rounded-lg bg-white text-brand-700 hover:bg-white/95 text-sm font-medium transition-colors">
                    Reactivate
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Choose Your Plan</h2>
          <p className="text-sm text-gray-500 mb-6">Upgrade or downgrade at any time</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => {
              const isCurrent = subscription?.plan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-6 transition-all ${
                    plan.highlighted
                      ? "border-brand-500 bg-white dark:bg-gray-900 shadow-xl scale-105"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-bold">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">₹{plan.price}</span>
                      <span className="text-sm text-gray-500">/{plan.period}</span>
                    </div>
                    {plan.price > 0 && <p className="text-xs text-gray-500 mt-1">Billed monthly • Cancel anytime</p>}
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          {f.included ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                          )}
                          <span className={f.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 line-through"}>
                            {f.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent || upgrading === plan.id}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                      isCurrent
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                        : plan.highlighted
                        ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:from-brand-700 hover:to-purple-700"
                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                    }`}
                  >
                    {isCurrent ? "Current Plan" : upgrading === plan.id ? "Processing..." : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Billing History</h3>
          {subscription && subscription.plan !== "free" ? (
            <div className="space-y-2">
              {[
                { date: formatDate(subscription.startedAt), desc: `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan subscription`, amount: subscription.amount, status: "Paid" },
                ...(subscription.expiresAt ? [{ date: formatDate(subscription.expiresAt), desc: "Upcoming renewal", amount: subscription.amount, status: "Pending" }] : []),
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.desc}</p>
                    <p className="text-xs text-gray-500">{row.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">₹{row.amount}</p>
                    <p className={`text-xs ${row.status === "Paid" ? "text-green-600" : "text-yellow-600"}`}>{row.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No billing history. Upgrade to a paid plan to see invoices here.</p>
          )}
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPayment(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complete Payment</h3>
              <p className="text-sm text-gray-500 mt-1">Upgrade to {PLANS.find(p => p.id === showPayment)?.name} - ₹{PLANS.find(p => p.id === showPayment)?.price}/month</p>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Card Number</label>
                <input type="text" defaultValue="4242 4242 4242 4242" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Expiry</label>
                  <input type="text" defaultValue="12/27" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">CVV</label>
                  <input type="text" defaultValue="123" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPayment(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button onClick={() => handlePayment(showPayment)} disabled={upgrading !== null} className="flex-1 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {upgrading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing</> : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
