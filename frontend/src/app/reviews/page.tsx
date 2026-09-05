"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { Star, ThumbsUp, ThumbsDown, RefreshCw, Plus, Search, Filter, MoreVertical, Eye, Send, AlertTriangle, MessageSquare, Globe, Facebook, ArrowRight, CheckCircle2 } from "lucide-react";

const mockGoogleReviews = [
  { id: "1", customer: "Rahul Verma", rating: 5, comment: "Amazing service! Highly recommended.", date: "25 Aug 2026", platform: "Google", responded: true },
  { id: "2", customer: "Priya Sharma", rating: 4, comment: "Good experience overall. Could improve response time.", date: "24 Aug 2026", platform: "Google", responded: true },
  { id: "3", customer: "Amit Kumar", rating: 2, comment: "Had some issues with delivery. Not satisfied.", date: "23 Aug 2026", platform: "Google", responded: false },
  { id: "4", customer: "Neha Patel", rating: 5, comment: "Excellent! Will definitely come back.", date: "22 Aug 2026", platform: "Google", responded: true },
];

const mockFacebookReviews = [
  { id: "5", customer: "Vikram Singh", rating: 5, comment: "Best in town! Love the quality.", date: "25 Aug 2026", platform: "Facebook", responded: true },
  { id: "6", customer: "Anita Desai", rating: 3, comment: "Average experience. Nothing special.", date: "20 Aug 2026", platform: "Facebook", responded: false },
];

const mockNegativeReviews = [
  { id: "3", customer: "Amit Kumar", rating: 2, comment: "Had some issues with delivery. Not satisfied.", date: "23 Aug 2026", platform: "Google", sentiment: "Negative", topic: "Delivery" },
  { id: "6", customer: "Anita Desai", rating: 3, comment: "Average experience. Nothing special.", date: "20 Aug 2026", platform: "Facebook", sentiment: "Neutral", topic: "Service Quality" },
];

const mockReviewCampaigns = [
  { id: "RC001", name: "Post-Purchase Review Request", sent: 1250, responses: 340, avgRating: 4.2, status: "Active" },
  { id: "RC002", name: "Service Follow-up Review", sent: 890, responses: 210, avgRating: 4.5, status: "Active" },
  { id: "RC003", name: "Monthly Feedback Survey", sent: 2100, responses: 560, avgRating: 4.0, status: "Paused" },
];

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "google" | "facebook" | "recovery" | "campaigns">("overview");

  const avgGoogleRating = mockGoogleReviews.reduce((acc, r) => acc + r.rating, 0) / mockGoogleReviews.length;
  const avgFacebookRating = mockFacebookReviews.reduce((acc, r) => acc + r.rating, 0) / mockFacebookReviews.length;
  const totalReviews = mockGoogleReviews.length + mockFacebookReviews.length;

  return (
    <DashboardLayout title="Review Manager" subtitle="Monitor and manage customer reviews across platforms">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalReviews}</p>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgGoogleRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Avg Google Rating</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgFacebookRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Avg Facebook Rating</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-red-600">{mockNegativeReviews.length}</p>
            <p className="text-sm text-gray-500">Negative Reviews</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["google", "Google Reviews"], ["facebook", "Facebook Reviews"], ["recovery", "Negative Recovery"], ["campaigns", "Campaigns"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" />Recent Reviews</h3>
              <div className="space-y-3">
                {[...mockGoogleReviews, ...mockFacebookReviews].slice(0, 4).map((review) => (
                  <div key={review.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{review.customer}</span>
                      <span className="text-xs text-gray-500">{review.platform}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />Negative Review Recovery</h3>
              <div className="space-y-3">
                {mockNegativeReviews.map((review) => (
                  <div key={review.id} className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{review.customer}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{review.sentiment}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{review.comment}</p>
                    <button className="text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" />Respond Now</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Google Reviews Tab */}
        {activeTab === "google" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-semibold text-gray-900 dark:text-gray-100">Google Reviews</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockGoogleReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{review.customer}</td>
                      <td className="px-4 py-3"><div className="flex gap-0.5">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div></td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{review.comment}</td>
                      <td className="px-4 py-3 text-gray-500">{review.date}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${review.responded ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{review.responded ? "Responded" : "Pending"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Facebook Reviews Tab */}
        {activeTab === "facebook" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-semibold text-gray-900 dark:text-gray-100">Facebook Reviews</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockFacebookReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{review.customer}</td>
                      <td className="px-4 py-3"><div className="flex gap-0.5">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div></td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{review.comment}</td>
                      <td className="px-4 py-3 text-gray-500">{review.date}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${review.responded ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{review.responded ? "Responded" : "Pending"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recovery Tab */}
        {activeTab === "recovery" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Negative Review Recovery</h3>
            <div className="space-y-4">
              {mockNegativeReviews.map((review) => (
                <div key={review.id} className="p-5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{review.customer}</p>
                      <p className="text-xs text-gray-500">{review.platform} · {review.date}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">{review.sentiment}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{review.comment}</p>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Send className="w-4 h-4" />Respond Publicly</button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"><MessageSquare className="w-4 h-4" />Message Privately</button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"><Plus className="w-4 h-4" />Offer Compensation</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Review Request Campaigns</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Campaign</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responses</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Rating</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockReviewCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{campaign.name}</td>
                      <td className="px-4 py-3 text-gray-600">{campaign.sent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{campaign.responses.toLocaleString()}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="font-medium text-gray-900 dark:text-gray-100">{campaign.avgRating}</span></div></td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${campaign.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{campaign.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
