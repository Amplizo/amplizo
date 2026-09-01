"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store";
import api from "@/lib/api";
import Link from "next/link";

type LoginMethod = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [method, setMethod] = useState<LoginMethod>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setIsLoading(true);
    try {
      const data = await api.login(email, password);
      setAuth(data.agent, data.token, data.refreshToken);
      router.push("/dashboard");
    } catch (err: any) { setError(err.response?.data?.message || "Invalid email or password"); }
    finally { setIsLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) { setError("Enter valid phone number"); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        if (data.devOtp) setDevOtp(data.devOtp);
      } else { setError(data.message || "Failed to send OTP"); }
    } catch { setError("Failed to send OTP"); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { setError("Enter valid 6-digit OTP"); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.token) {
        setAuth(data.agent, data.token, data.refreshToken);
        router.push("/dashboard");
      } else { setError(data.message || "Invalid OTP"); }
    } catch { setError("Failed to verify OTP"); }
    finally { setIsLoading(false); }
  };

  const handlePhoneLogin = async () => {
    if (!phone || phone.length < 10) { setError("Enter valid phone number"); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/phone/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.token) {
        setAuth(data.agent, data.token, data.refreshToken);
        router.push("/dashboard");
      } else { setError(data.message || "Login failed"); }
    } catch { setError("Login failed"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800" />
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8"><div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Zap className="w-6 h-6" /></div><span className="text-2xl font-bold">Amplizo</span></div>
          <h2 className="text-4xl font-bold leading-tight mb-4">The AI Employee Every Business Needs</h2>
          <p className="text-brand-100 text-lg leading-relaxed mb-8">Join 2,847+ businesses using AI to handle customer calls, follow-ups, sales, and retention — autonomously.</p>
          <div className="space-y-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-sm">✓</span></div><span>14-day free trial, no credit card</span></div><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-sm">✓</span></div><span>AI agents working 24/7/365</span></div><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-sm">✓</span></div><span>Your data, your infrastructure</span></div></div>
          <div className="mt-12 pt-8 border-t border-white/20"><p className="text-sm text-brand-200">Trusted by businesses across India</p><div className="flex gap-4 mt-4 opacity-70"><span className="text-xs bg-white/10 px-3 py-1 rounded-full">Salons</span><span className="text-xs bg-white/10 px-3 py-1 rounded-full">Clinics</span><span className="text-xs bg-white/10 px-3 py-1 rounded-full">E-commerce</span><span className="text-xs bg-white/10 px-3 py-1 rounded-full">Real Estate</span><span className="text-xs bg-white/10 px-3 py-1 rounded-full">Education</span></div></div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8"><div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div><span className="font-bold text-gray-900 dark:text-gray-100">Amplizo</span></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-8">Sign in to your agent dashboard</p>

          {/* Login Method Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {([["email", "Email"], ["phone", "Phone"]] as [LoginMethod, string][]).map(([m, label]) => (
              <button key={m} onClick={() => { setMethod(m); setError(""); setOtpSent(false); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${method === m ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
            ))}
          </div>

          {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}

          {method === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <Input label="Email" type="email" placeholder="agent@company.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />
              <div className="relative">
                <Input label="Password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" /><span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span></label>
                <button type="button" onClick={() => router.push("/forgot-password")} className="text-sm text-brand-600 hover:text-brand-700 font-medium">Forgot password?</button>
              </div>
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>{!isLoading && <ArrowRight className="w-4 h-4 mr-2" />}Sign In</Button>
            </form>
          )}

          {method === "phone" && (
            <div className="space-y-5">
              <Input label="Phone Number" type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone className="w-4 h-4" />} disabled={otpSent} required />
              {otpSent && (
                <>
                  <Input label="Enter OTP" type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} required />
                  {devOtp && <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-700 dark:text-yellow-400">Development OTP: <span className="font-mono font-bold">{devOtp}</span></div>}
                  <Button onClick={handleVerifyOtp} className="w-full" size="lg" isLoading={isLoading}><Zap className="w-4 h-4 mr-2" />Verify OTP</Button>
                  <button onClick={handleSendOtp} className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium">Resend OTP</button>
                </>
              )}
              {!otpSent && (
                <Button onClick={handleSendOtp} className="w-full" size="lg" isLoading={isLoading}><Phone className="w-4 h-4 mr-2" />Send OTP</Button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" /><span className="text-xs text-gray-400 uppercase">Or continue with</span><div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" /></div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <a href={`${API_URL}/auth/google`} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </a>
            <a href={`${API_URL}/auth/facebook`} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Continue with Facebook
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Don&apos;t have an account? <a href="/signup" className="text-brand-600 font-medium hover:text-brand-700">Sign up free</a></p>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6"><Link href="/help" className="hover:text-brand-600">Need help?</Link> · <Link href="/feedback" className="hover:text-brand-600">Send feedback</Link> · <Link href="/blog" className="hover:text-brand-600">Read blog</Link></p>
        </div>
      </div>
    </div>
  );
}
