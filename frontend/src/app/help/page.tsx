"use client";
import React, { useState } from "react";
import Link from "next/link";
import { faqs, categories } from "@/lib/data";
import { ChevronDown, Search, MessageCircle, Mail, Phone, ExternalLink, HelpCircle, BookOpen, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const allCats = ["All", ...categories];
  const filtered = faqs.filter((faq) => {
    const matchesCat = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch = !searchQuery || faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoryIcons: Record<string, React.ReactNode> = { General: <HelpCircle className="w-4 h-4" />, Setup: <Zap className="w-4 h-4" />, "AI Features": <MessageCircle className="w-4 h-4" />, Features: <BookOpen className="w-4 h-4" />, Security: <Shield className="w-4 h-4" />, Pricing: <ExternalLink className="w-4 h-4" />, Reliability: <Shield className="w-4 h-4" /> };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16"><Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center"><span className="text-white font-bold text-sm">R</span></div><span className="font-bold text-gray-900 dark:text-gray-100">Amplizo</span></Link><nav className="hidden md:flex items-center gap-6"><Link href="/#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Features</Link><Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Blog</Link><Link href="/help" className="text-sm text-brand-600 font-medium">Help</Link><Link href="/feedback" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Feedback</Link></nav><Link href="/login" className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Sign In</Link></div></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-medium mb-4"><HelpCircle className="w-4 h-4" />Help & Support</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">How can we help you?</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Find answers to common questions or reach out to our support team</p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-12"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search for answers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm text-lg" /></div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 px-2">Categories</h3>
              <div className="space-y-1">{allCats.map((cat) => (<button key={cat} onClick={() => setActiveCategory(cat)} className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left", activeCategory === cat ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800")}>{categoryIcons[cat] || <HelpCircle className="w-4 h-4" />}{cat}</button>))}</div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4"><p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} {filtered.length === 1 ? "result" : "results"}{activeCategory !== "All" ? ` in ${activeCategory}` : ""}</p></div>
            <div className="space-y-3">{filtered.length === 0 ? (<div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700"><p className="text-gray-500 dark:text-gray-400">No results found.</p><button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="mt-2 text-brand-600 font-medium text-sm">Clear filters</button></div>) : filtered.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"><button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-5 text-left"><span className="font-medium text-gray-900 dark:text-gray-100 pr-4">{faq.question}</span><ChevronDown className={cn("w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200", openIndex === index && "rotate-180")} /></button>{openIndex === index && <div className="px-5 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">{faq.answer}</div>}</div>
          ))}</div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{ icon: <Mail className="w-6 h-6" />, title: "Email Support", description: "Get a response within 24 hours", action: "Email Us", href: "mailto:support@Amplizo.ai" }, { icon: <Phone className="w-6 h-6" />, title: "Phone Support", description: "Available Mon-Sat, 9AM-6PM IST", action: "Call Now", href: "tel:+919876543210" }, { icon: <MessageCircle className="w-6 h-6" />, title: "Live Chat", description: "Chat with our team instantly", action: "Start Chat", href: "/feedback" }].map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg transition-shadow"><div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 mx-auto mb-4">{item.icon}</div><h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h3><p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{item.description}</p><a href={item.href} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">{item.action}</a></div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-12"><div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">© 2026 Amplizo. All rights reserved.</div></footer>
    </div>
  );
}
