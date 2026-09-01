"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" /></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Check your email</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">We sent a password reset link to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span></p>
            <Button onClick={() => router.push("/login")} className="w-full" size="lg">Back to Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800" />
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8"><div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Zap className="w-6 h-6" /></div><span className="text-2xl font-bold">Amplizo</span></div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Reset Your Password</h2>
          <p className="text-brand-100 text-lg leading-relaxed mb-8">Enter your email address and we will send you a link to reset your password.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8"><div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div><span className="font-bold text-gray-900 dark:text-gray-100">Amplizo</span></div>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-8"><ArrowLeft className="w-4 h-4" />Back to sign in</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot password?</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-8">Enter your email and we will send you a reset link</p>

          {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="agent@company.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}><Mail className="w-4 h-4 mr-2" />Send Reset Link</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
