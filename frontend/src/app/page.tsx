"use client";
import React from "react";
import { VisitorWidget } from "@/components/chat/VisitorWidget";
import { Zap, MessageCircle, Shield, Globe, Smartphone, Users, BarChart3, Clock, CheckCircle2, ArrowRight, Star, Play, Phone, Mail, Bot, Brain, Target, Rocket } from "lucide-react";

const features = [
  { icon: <MessageCircle className="w-6 h-6" />, title: "Real-Time Messaging", description: "Send text, images, videos, and audio messages instantly with delivery and read receipts. See typing indicators and online status." },
  { icon: <Shield className="w-6 h-6" />, title: "Enterprise Security", description: "JWT authentication, Argon2 hashing, AES-256 encryption, TLS 1.3, and row-level tenant isolation. Your data never leaks." },
  { icon: <Globe className="w-6 h-6" />, title: "100% Independent", description: "No reliance on WhatsApp, Telegram, or any third party. Your infrastructure, your rules, your data. Hosted on your servers." },
  { icon: <Smartphone className="w-6 h-6" />, title: "Fully Responsive", description: "Works perfectly on desktop, tablet, and mobile. No app download required for visitors — chat directly in the browser." },
  { icon: <Zap className="w-6 h-6" />, title: "Voice Messages", description: "Record and send voice notes directly from the browser using MediaRecorder API. No plugins needed." },
  { icon: <Users className="w-6 h-6" />, title: "Multi-Agent Support", description: "Add unlimited agents with role-based access control. Assign chats automatically or let agents pick their own." },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Smart Analytics", description: "Real-time metrics on visitors, chat volume, response times, agent performance, and customer satisfaction." },
  { icon: <Clock className="w-6 h-6" />, title: "Automated Follow-ups", description: "Triggered messages based on customer behavior — birthday wishes, payment reminders, and feedback requests." },
  { icon: <CheckCircle2 className="w-6 h-6" />, title: "File Sharing", description: "Share images, documents, and videos up to 50MB. All files are scanned for viruses before delivery." },
  { icon: <Phone className="w-6 h-6" />, title: "AI Voice Calls", description: "Handle incoming calls with AI Receptionist. Books appointments, answers FAQs, and routes complex calls to humans." },
  { icon: <Mail className="w-6 h-6" />, title: "Email Integration", description: "Send chat transcripts, follow-up emails, and marketing campaigns. Sync with your existing email provider." },
  { icon: <Bot className="w-6 h-6" />, title: "Custom AI Training", description: "Train your AI agent on your business data — products, services, pricing. It learns your voice and style." },
];

const plans = [
  { name: "Starter", price: "₹999", period: "/month", features: ["5 Agents", "1,000 Messages/mo", "Basic Analytics", "Email Support", "1 Branch", "Chat Widget", "File Sharing", "Mobile Responsive"], cta: "Start Free Trial", popular: false },
  { name: "Growth", price: "₹2,999", period: "/month", features: ["25 Agents", "10,000 Messages/mo", "Advanced Analytics", "Priority Support", "Custom Branding", "AI Receptionist", "Voice Messages", "5 Branches", "API Access"], cta: "Start Free Trial", popular: true },
  { name: "Business", price: "₹7,999", period: "/month", features: ["Unlimited Agents", "Unlimited Messages", "Full Analytics", "24/7 Phone Support", "API Access", "White Label", "AI Sales Agent", "Unlimited Branches", "Custom AI Models"], cta: "Contact Sales", popular: false },
];

const testimonials = [
  { name: "Priya Sharma", role: "Salon Chain Owner, Mumbai", quote: "Amplizo helped us increase repeat customers by 40%. The AI Receptionist handles all our calls — we never miss a booking anymore. Best investment for our 47 salons.", rating: 5 },
  { name: "Rajesh Kumar", role: "E-commerce Entrepreneur, Delhi", quote: "We switched from WhatsApp to Amplizo and satisfaction jumped from 72% to 94%. Having our own chat platform means we own the customer relationship completely.", rating: 5 },
  { name: "Anita Patel", role: "Clinic Manager, Bangalore", quote: "The AI Follow-up Agent automatically reminds patients about appointments. Our no-show rate dropped by 60%. The multi-branch feature lets us manage 12 clinics from one dashboard.", rating: 5 },
  { name: "Vikram Singh", role: "Real Estate Developer, Pune", quote: "AI Sales Agent qualifies leads while we sleep. It explains projects, schedules site visits, and follows up persistently. Our conversion rate improved by 35%.", rating: 5 },
  { name: "Meera Joshi", role: "Education Center, Hyderabad", quote: "Parents love the instant responses. The AI handles admission queries 24/7 and our counselors focus on serious inquiries. Enrollment doubled in 3 months.", rating: 5 },
  { name: "Suresh Reddy", role: "Car Service Center, Chennai", quote: "WhatsApp was limiting us with templates and costs. Amplizo gives us full control. The file sharing feature lets customers send photos of issues instantly.", rating: 5 },
];

const faqs = [
  { q: "How is Amplizo different from WhatsApp Business?", a: "Amplizo is fully independent — no WhatsApp, Telegram, or any third party. Chat happens on your domain with full data ownership. No message templates, no 24-hour windows, no per-message costs." },
  { q: "Do I need to install any software?", a: "No. Amplizo is web-based. Agents log in from any browser. Visitors chat directly in the browser — no app download needed." },
  { q: "Can I use my own domain?", a: "Yes. Set up chat at chat.yourdomain.com or any subdomain. SSL is handled automatically with Let's Encrypt." },
  { q: "What if I need more than 25 agents?", a: "Upgrade to Business plan for unlimited agents. You can also add AI agents that work 24/7 at no extra per-agent cost." },
  { q: "Is my data secure?", a: "Absolutely. JWT authentication with refresh token rotation, Argon2 password hashing, AES-256 encryption at rest, TLS 1.3 in transit, and row-level tenant isolation." },
  { q: "Can I customize the chat widget?", a: "Yes. Customize colors, logos, welcome messages, position on screen, and even create different widget styles for different pages." },
];

const aiAgents = [
  { name: "AI Receptionist", icon: <Phone className="w-6 h-6" />, description: "Answers calls 24/7, books appointments, detects language, and saves customer details automatically. Never misses a call." },
  { name: "AI Sales Agent", icon: <Target className="w-6 h-6" />, description: "Explains products, handles objections, creates personalized offers, and confirms orders through natural conversation." },
  { name: "AI Follow-up Agent", icon: <Clock className="w-6 h-6" />, description: "Automatically contacts customers via WhatsApp, email, or SMS at the perfect moment based on their behavior patterns." },
  { name: "AI Retention Agent", icon: <Users className="w-6 h-6" />, description: "Predicts churn risk, personalizes win-back offers, and recovers lost customers before they switch to competitors." },
  { name: "AI Marketing Manager", icon: <Rocket className="w-6 h-6" />, description: "Creates campaigns, segments audiences, generates content, schedules sends, and A/B tests messages automatically." },
  { name: "AI Business Advisor", icon: <Brain className="w-6 h-6" />, description: "Answers business questions using your data. Get insights like which customers to call today or how to increase revenue." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div><span className="font-bold text-gray-900 dark:text-gray-100">Amplizo</span></div>
            <nav className="hidden md:flex items-center gap-6"><a href="#features" className="text-sm text-gray-600 dark:text-gray-400">Features</a><a href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-400">How It Works</a><a href="#ai-agents" className="text-sm text-gray-600 dark:text-gray-400">AI Agents</a><a href="#pricing" className="text-sm text-gray-600 dark:text-gray-400">Pricing</a><a href="/blog" className="text-sm text-gray-600 dark:text-gray-400">Blog</a><a href="/help" className="text-sm text-gray-600 dark:text-gray-400">Help</a><a href="/feedback" className="text-sm text-gray-600 dark:text-gray-400">Feedback</a></nav>
            <div className="flex items-center gap-3"><a href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sign In</a><a href="/login" className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Get Started</a></div>
          </div>
        </div>
      </header>
      <main>
        {/* Hero */}
        <section className="py-20 lg:py-32 bg-gradient-to-b from-brand-50/50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-medium mb-6"><Zap className="w-4 h-4" />AI-Powered Live Chat Platform</div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 leading-tight">Independent Live Chat<br /><span className="text-brand-600">For Your Business</span></h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">Connect with your website visitors instantly. No WhatsApp, no Telegram, no external dependencies. Pure, independent, real-time communication that you fully control.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"><a href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30 text-lg">Start Free Trial</a><a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"><Play className="w-5 h-5" />Watch Demo</a></div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500"><div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" />No Credit Card Required</div><div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" />14-Day Free Trial</div><div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" />Cancel Anytime</div></div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div><div className="text-3xl sm:text-4xl font-bold text-brand-600">2,847+</div><div className="mt-1 text-sm text-gray-500">Businesses Trust Us</div></div>
              <div><div className="text-3xl sm:text-4xl font-bold text-brand-600">4.2M+</div><div className="mt-1 text-sm text-gray-500">Messages Delivered</div></div>
              <div><div className="text-3xl sm:text-4xl font-bold text-brand-600">99.9%</div><div className="mt-1 text-sm text-gray-500">Uptime Guaranteed</div></div>
              <div><div className="text-3xl sm:text-4xl font-bold text-brand-600">12s</div><div className="mt-1 text-sm text-gray-500">Avg Response Time</div></div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-medium mb-4">HOW IT WORKS</div><h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Get Started in 3 Simple Steps</h2><p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">From sign-up to your first customer conversation in under 5 minutes.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[{ step: "1", title: "Create Account", description: "Sign up free in 30 seconds. No credit card needed. Get instant access to all features and AI agents." }, { step: "2", title: "Add Widget", description: "Copy one line of code and paste it on your website. The chat widget appears instantly. Customize colors, logo, and welcome message to match your brand." }, { step: "3", title: "Start Converting", description: "Visitors see your chat widget and start conversations. Your AI agent handles common queries 24/7 while your team focuses on complex issues and closing deals." }].map((item, index) => (
                <div key={index} className="relative text-center"><div className="w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">{item.step}</div><h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{item.title}</h3><p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>{index < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-300 to-transparent dark:from-brand-700" />}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-medium mb-4">FEATURES</div><h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Everything You Need to Delight Customers</h2><p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Production-ready features designed for modern businesses that want full control.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{features.map((feature, index) => (<div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300 group"><div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3><p className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p></div>))}</div>
          </div>
        </section>

        {/* AI Agents */}
        <section id="ai-agents" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-medium mb-4">AI AGENTS</div><h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Your AI Team That Never Sleeps</h2><p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Deploy specialized AI employees that handle specific tasks autonomously — from answering calls to recovering lost customers.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{aiAgents.map((agent, index) => (<div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"><div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 mb-4">{agent.icon}</div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{agent.name}</h3><p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{agent.description}</p></div>))}</div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Loved by 2,847+ Businesses</h2><p className="mt-4 text-gray-600 dark:text-gray-400">Real results from real businesses across India.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{testimonials.map((t, index) => (<div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-200 dark:border-gray-700"><div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}</div><p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p><div className="mt-6 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-sm">{t.name[0]}</div><div><div className="font-medium text-gray-900 dark:text-gray-100">{t.name}</div><div className="text-sm text-gray-500">{t.role}</div></div></div></div>))}</div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-medium mb-4">PRICING</div><h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Simple, Transparent Pricing</h2><p className="mt-4 text-gray-600 dark:text-gray-400">Start free, scale as you grow. No hidden fees, no surprise charges.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">{plans.map((plan, index) => (<div key={index} className={`relative rounded-2xl p-8 border-2 ${plan.popular ? "border-brand-600 bg-brand-50/50 dark:bg-brand-900/10 shadow-2xl scale-105" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"} transition-all`}>{plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-xs font-semibold rounded-full">Most Popular</span>}<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h3><div className="mt-4 flex items-baseline gap-1"><span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</span><span className="text-gray-500 dark:text-gray-400">{plan.period}</span></div><ul className="mt-6 space-y-3">{plan.features.map((feature, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{feature}</li>)}</ul><a href="/login" className={`block w-full mt-8 py-3 rounded-xl font-semibold transition-colors text-center ${plan.popular ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{plan.cta}</a></div>))}</div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2><p className="mt-4 text-gray-600 dark:text-gray-400">Everything you need to know before getting started.</p></div>
            <div className="space-y-4">{faqs.map((faq, index) => (<div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700"><h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{faq.q}</h3><p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p></div>))}</div>
            <div className="text-center mt-8"><a href="/help" className="inline-flex items-center gap-2 text-brand-600 font-medium">View all FAQs <ArrowRight className="w-4 h-4" /></a></div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-brand-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Customer Communication?</h2><p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">Join 2,847+ businesses using Amplizo. Start your free 14-day trial today — no credit card required.</p><div className="flex flex-col sm:flex-row gap-4 justify-center"><a href="/login" className="px-8 py-4 rounded-xl bg-white text-brand-600 font-semibold hover:bg-gray-100 transition-colors text-lg">Start Free Trial</a><a href="/help" className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">Talk to Sales</a></div></div>
        </section>
      </main>
      <footer className="bg-gray-900 dark:bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div><h4 className="font-semibold text-white mb-4">Product</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#features" className="hover:text-white">Features</a></li><li><a href="#pricing" className="hover:text-white">Pricing</a></li><li><a href="/blog" className="hover:text-white">Blog</a></li><li><a href="/help" className="hover:text-white">Help Center</a></li></ul></div>
            <div><h4 className="font-semibold text-white mb-4">Company</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="/feedback" className="hover:text-white">Feedback</a></li><li><a href="/help" className="hover:text-white">Support</a></li><li><a href="/login" className="hover:text-white">Agent Login</a></li></ul></div>
            <div><h4 className="font-semibold text-white mb-4">Resources</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="/blog" className="hover:text-white">Documentation</a></li><li><a href="/help" className="hover:text-white">API Reference</a></li><li><a href="/feedback" className="hover:text-white">Status Page</a></li></ul></div>
            <div><h4 className="font-semibold text-white mb-4">Legal</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="/help" className="hover:text-white">Privacy Policy</a></li><li><a href="/help" className="hover:text-white">Terms of Service</a></li><li><a href="/help" className="hover:text-white">GDPR</a></li></ul></div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div><span className="font-semibold text-white">Amplizo</span></div><p className="text-sm text-gray-500">© 2026 Amplizo. All rights reserved. Made with love in India.</p></div>
        </div>
      </footer>
      <VisitorWidget />
    </div>
  );
}
