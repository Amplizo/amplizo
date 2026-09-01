"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store";
import { Zap, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const agentParam = searchParams.get("agent");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));
      return;
    }

    if (token && refreshToken) {
      let agent = { id: "", name: "User", email: "", role: "agent" as const, status: "online" as const, createdAt: new Date().toISOString() };
      if (agentParam) {
        try {
          agent = JSON.parse(decodeURIComponent(agentParam));
        } catch {}
      }
      setAuth(agent, token, refreshToken);
      setStatus("success");
      setMessage("Sign in successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      setStatus("error");
      setMessage("Invalid authentication response");
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center max-w-md px-6">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${status === "loading" ? "bg-brand-100 dark:bg-brand-900/30" : status === "success" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          {status === "loading" && <div className="w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />}
          {status === "success" && <CheckCircle className="w-10 h-10 text-green-500" />}
          {status === "error" && <AlertCircle className="w-10 h-10 text-red-500" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {status === "loading" ? "Signing in..." : status === "success" ? "Success!" : "Sign in failed"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        {status === "error" && (
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors">
            <Zap className="w-4 h-4" />Back to Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" /></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
