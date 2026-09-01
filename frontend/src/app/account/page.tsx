"use client";
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store";
import { User, Mail, Shield, Calendar, Activity } from "lucide-react";

export default function AccountPage() {
  const { agent } = useAuthStore();

  if (!agent) {
    return (
      <DashboardLayout title="Account" subtitle="Your profile information">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please login to view your account</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Account" subtitle="Your profile and subscription details">
      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <User className="w-8 h-8 text-brand-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{agent.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{agent.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Role</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{agent.role}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Status</span>
              </div>
              <p className="font-medium text-green-600 capitalize">{agent.status || "online"}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{agent.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member Since</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "Today"}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Subscription</h3>
          <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-700 dark:text-brand-400">Free Plan</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upgrade to unlock all features</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
