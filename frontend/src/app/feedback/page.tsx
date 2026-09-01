"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Send, Star, CheckCircle, MessageSquare, Bug, Lightbulb, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", type: "feedback", message: "" });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); setFormData({ name: "", email: "", type: "feedback", message: "" }); setRating(0); };

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Thank You!</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">Your feedback has been received. We appreciate your input and will use it to improve Amplizo.</p>
        <Link href="/" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors">Back to Home</Link>
      </div>
    </div>
  );

  const feedbackTypes = [{ id: "feedback", label: "General Feedback", icon: <MessageSquare className="w-5 h-5" />, description: "Share your overall experience" }, { id: "bug", label: "Bug Report", icon: <Bug className="w-5 h-5" />, description: "Report a problem you encountered" }, { id: "feature", label: "Feature Request", icon: <Lightbulb className="w-5 h-5" />, description: "Suggest a new feature" }, { id: "support", label: "Support Ticket", icon: <HelpCircle className="w-5 h-5" />, description: "Get help with an issue" }];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16"><Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center"><span className="text-white font-bold text-sm">R</span></div><span className="font-bold text-gray-900 dark:text-gray-100">Amplizo</span></Link><Link href="/login" className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Sign In</Link></div></div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-medium mb-4"><MessageSquare className="w-4 h-4" />We value your feedback</div><h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Send Feedback</h1><p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Help us improve Amplizo with your valuable input</p></div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">How would you rate your experience?</label><div className="flex gap-2 items-center">{[1, 2, 3, 4, 5].map((star) => (<button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}><Star className={`w-10 h-10 transition-all duration-150 ${star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400 scale-110" : "text-gray-300 dark:text-gray-600"}`} /></button>))}<span className="ml-4 text-sm text-gray-500">{rating === 0 ? "Select a rating" : rating <= 2 ? "Poor" : rating <= 3 ? "Average" : rating <= 4 ? "Good" : "Excellent"}</span></div></div>

          {/* Type Selection */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">What type of feedback is this?</label><div className="grid grid-cols-2 gap-3">{feedbackTypes.map((type) => (<button key={type.id} type="button" onClick={() => setFormData({ ...formData, type: type.id })} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${formData.type === type.id ? "border-brand-600 bg-brand-50 dark:bg-brand-900/10" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}><div className={`p-2 rounded-lg ${formData.type === type.id ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>{type.icon}</div><div><p className={`text-sm font-medium ${formData.type === type.id ? "text-brand-700 dark:text-brand-400" : "text-gray-900 dark:text-gray-100"}`}>{type.label}</p><p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p></div></button>))}</div></div>

          {/* Personal Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" placeholder="Your name" required /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" placeholder="your@email.com" required /></div></div></div>

          {/* Message */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Message</label><textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5} className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none" placeholder="Tell us what you think, what went wrong, or what we can improve..." required /><p className="text-xs text-gray-400 mt-2">{formData.message.length}/500 characters</p></div>

          <Button type="submit" className="w-full" size="lg"><Send className="w-4 h-4 mr-2" />Submit Feedback</Button>
        </form>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-12"><div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">© 2026 Amplizo. All rights reserved.</div></footer>
    </div>
  );
}
