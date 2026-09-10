"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, BarChart3, Users, Bot, Clock, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await api.login(email, password);
      if (data.agent.role !== "admin") {
        setError("Access denied. Admin only.");
        setIsLoading(false);
        return;
      }
      setAuth(data.agent, data.token, data.refreshToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left Panel - Admin Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02aC00djJoNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Amplizo" className="h-14 w-14 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Amplizo</h1>
              <p className="text-brand-200 text-sm">Admin Control Panel</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            Manage Your<br />
            <span className="text-brand-200">Business Empire</span>
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-md">
            Powerful admin tools to manage clients, subscriptions, AI agents, and analytics all in one place.
          </p>

          <div className="space-y-4">
            {[
              { icon: Users, title: "Client Management", desc: "Manage all your clients, view their activity, and handle subscriptions" },
              { icon: Bot, title: "AI Agent Control", desc: "Monitor AI employees, configure autonomous mode, and view performance" },
              { icon: BarChart3, title: "Real-time Analytics", desc: "Track revenue, customer growth, and satisfaction metrics live" },
              { icon: Clock, title: "24/7 Monitoring", desc: "Monitor chats, response times, and system health around the clock" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <div className="p-2 rounded-lg bg-white/20">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-brand-200">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-6 pt-8 border-t border-white/20">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-brand-200">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-sm text-brand-200">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">4.9</p>
              <div className="flex items-center gap-1 justify-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <p className="text-sm text-brand-200">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src="/logo.png" alt="Amplizo" className="h-12 w-12 object-contain" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Amplizo</h1>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-brand-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Login</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your admin credentials to continue</p>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input label="Email" type="email" placeholder="admin@amplizo.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />
            <div className="relative">
              <Input label="Password" type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>{!isLoading && <ArrowRight className="w-4 h-4 mr-2" />}Login to Admin Panel</Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Not an admin? <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">Login as Client</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
