"use client";
import React, { useState } from "react";
import { VisitorWidget } from "@/components/chat/VisitorWidget";
import {
  Zap, MessageCircle, Shield, Globe, Smartphone, Users, BarChart3, Clock,
  CheckCircle2, ArrowRight, Star, Play, Phone, Mail, Bot, Brain, Target, Rocket,
  Menu, X, Headphones, TrendingUp, Award, ChevronRight
} from "lucide-react";

const services = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Live Chat Platform",
    description: "Real-time messaging with text, images, videos, and voice notes. Connect with visitors instantly.",
    link: "#"
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI Agents",
    description: "Deploy AI Receptionist, Sales Agent, Follow-up Agent, and more. Your team that never sleeps.",
    link: "#"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Smart Analytics",
    description: "Real-time metrics on visitors, chat volume, response times, and customer satisfaction.",
    link: "#"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Enterprise Security",
    description: "JWT authentication, Argon2 hashing, AES-256 encryption, and row-level tenant isolation.",
    link: "#"
  },
];

const stats = [
  { icon: <Users className="w-8 h-8" />, value: "2,847+", label: "Businesses Trust Us" },
  { icon: <MessageCircle className="w-8 h-8" />, value: "4.2M+", label: "Messages Delivered" },
  { icon: <TrendingUp className="w-8 h-8" />, value: "99.9%", label: "Uptime Guaranteed" },
  { icon: <Clock className="w-8 h-8" />, value: "12s", label: "Avg Response Time" },
];

const features = [
  { icon: <Globe className="w-5 h-5" />, title: "100% Independent", description: "No WhatsApp, no Telegram. Your infrastructure, your rules." },
  { icon: <Smartphone className="w-5 h-5" />, title: "Fully Responsive", description: "Works on desktop, tablet, and mobile. No app download needed." },
  { icon: <Users className="w-5 h-5" />, title: "Multi-Agent", description: "Unlimited agents with role-based access control." },
  { icon: <Phone className="w-5 h-5" />, title: "AI Voice Calls", description: "Handle calls with AI Receptionist. Books appointments automatically." },
  { icon: <Mail className="w-5 h-5" />, title: "Email Integration", description: "Send transcripts, follow-ups, and marketing campaigns." },
  { icon: <Brain className="w-5 h-5" />, title: "Custom AI Training", description: "Train AI on your business data, products, and services." },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Salon Chain Owner, Mumbai",
    quote: "Amplizo helped us increase repeat customers by 40%. The AI Receptionist handles all our calls — we never miss a booking anymore.",
    rating: 5
  },
  {
    name: "Rajesh Kumar",
    role: "E-commerce Entrepreneur, Delhi",
    quote: "We switched from WhatsApp to Amplizo and satisfaction jumped from 72% to 94%. We own the customer relationship completely.",
    rating: 5
  },
  {
    name: "Anita Patel",
    role: "Clinic Manager, Bangalore",
    quote: "The AI Follow-up Agent automatically reminds patients about appointments. Our no-show rate dropped by 60%.",
    rating: 5
  },
];

const footerLinks = {
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "/blog" },
  ],
  services: [
    { label: "Live Chat", href: "#services" },
    { label: "AI Agents", href: "#services" },
    { label: "Analytics", href: "#services" },
    { label: "Security", href: "#services" },
  ],
  company: [
    { label: "Careers", href: "/blog" },
    { label: "Contact", href: "/help" },
    { label: "Support", href: "/help" },
    { label: "Feedback", href: "/feedback" },
  ],
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Amplizo" className="h-10 w-10 object-contain" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">Amplizo</span>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              <a href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">About Us</a>
              <a href="#services" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Services</a>
              <a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Solutions</a>
              <a href="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Blog</a>
              <a href="/help" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Careers</a>
              <a href="/help" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <a href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Sign In</a>
              <a href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Get Started <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="/" className="block text-sm font-medium text-gray-700 py-2">Home</a>
              <a href="#about" className="block text-sm font-medium text-gray-700 py-2">About Us</a>
              <a href="#services" className="block text-sm font-medium text-gray-700 py-2">Services</a>
              <a href="#solutions" className="block text-sm font-medium text-gray-700 py-2">Solutions</a>
              <a href="/blog" className="block text-sm font-medium text-gray-700 py-2">Blog</a>
              <a href="/help" className="block text-sm font-medium text-gray-700 py-2">Careers</a>
              <a href="/help" className="block text-sm font-medium text-gray-700 py-2">Contact</a>
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
                <a href="/login" className="text-sm font-medium text-gray-700 py-2">Sign In</a>
                <a href="/login" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium">
                  Get Started <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50/50 via-white to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Independent Live Chat{" "}
                  <span className="text-blue-600">For Your Business</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                  Connect with your website visitors instantly. No WhatsApp, no Telegram, no external dependencies. Pure, independent, real-time communication that you fully control.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Start Free Trial
                  </a>
                  <a
                    href="#services"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <Play className="w-5 h-5" /> Watch Demo
                  </a>
                </div>
                <div className="flex flex-wrap gap-6 mt-10 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    No Credit Card Required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    14-Day Free Trial
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Cancel Anytime
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 lg:p-12">
                  <div className="absolute top-4 right-4 w-24 h-24 bg-blue-200/50 rounded-full blur-2xl" />
                  <div className="absolute bottom-4 left-4 w-32 h-32 bg-blue-300/30 rounded-full blur-3xl" />
                  <div className="relative space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 max-w-xs">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Live Chat</p>
                          <p className="text-xs text-gray-500">Real-time messaging</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-gray-100 rounded-lg p-2 text-xs text-gray-600">Hello! How can I help you today?</div>
                        <div className="bg-blue-600 rounded-lg p-2 text-xs text-white ml-8">I need help with my order</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 max-w-xs ml-auto">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">AI Agent</p>
                          <p className="text-xs text-green-600">Online 24/7</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Automated responses, appointment booking, and customer support.</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Analytics</p>
                          <p className="text-xs text-gray-500">Real-time insights</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">What We Do</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Solutions Built for Your Success</h2>
              <p className="text-lg text-gray-600">Everything you need to delight customers and grow your business with independent communication.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-100 transition-colors">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{service.description}</p>
                  <a href={service.link} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-white mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 lg:p-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                        <Headphones className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">24/7 Support</p>
                      <p className="text-xs text-gray-500 mt-1">AI agents never sleep</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">Growth</p>
                      <p className="text-xs text-gray-500 mt-1">Scale without limits</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">Quality</p>
                      <p className="text-xs text-gray-500 mt-1">Enterprise grade</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                        <Shield className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">Security</p>
                      <p className="text-xs text-gray-500 mt-1">Data protection</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">About Us</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">We Are Amplizo</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Amplizo is an AI-powered independent live chat platform built for businesses that want full control over their customer communication. No WhatsApp, no Telegram, no external dependencies.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Our mission is to help businesses build direct relationships with their customers. With AI agents that handle calls, follow-ups, and sales automatically, you can focus on what matters most — growing your business.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="solutions" className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
              <p className="text-lg text-gray-600">Production-ready features designed for modern businesses that want full control.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 p-5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Testimonials</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
              <p className="text-lg text-gray-600">Real results from real businesses across India.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed italic mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Customer Communication?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 2,847+ businesses using Amplizo. Start your free 14-day trial today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="/help"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="Amplizo" className="h-10 w-10 object-contain" />
                <span className="font-bold text-white tracking-tight">Amplizo</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI-powered independent live chat platform for businesses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {footerLinks.quickLinks.map((link, i) => (
                  <li key={i}><a href={link.href} className="hover:text-white transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {footerLinks.services.map((link, i) => (
                  <li key={i}><a href={link.href} className="hover:text-white transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {footerLinks.company.map((link, i) => (
                  <li key={i}><a href={link.href} className="hover:text-white transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-3">Stay updated with our latest features.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; 2026 Amplizo. All rights reserved. Made with love in India.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <VisitorWidget />
    </div>
  );
}
