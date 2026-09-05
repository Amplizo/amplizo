"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { useAuthStore } from "@/store";
import { Save, User, Mail, Phone, MapPin, Shield, Camera } from "lucide-react";

export default function ProfilePage() {
  const { agent } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: agent?.name || "",
    email: agent?.email || "",
    phone: "+91 98765 43210",
    city: "Mumbai",
    bio: "Platform administrator with 5+ years of experience in customer support and team management.",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account information">
      {saved && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl bg-green-500 text-white shadow-lg">
          Profile updated successfully!
        </div>
      )}
      <div className="max-w-3xl space-y-6">
        <BackButton fallback={agent?.role === "admin" ? "/dashboard" : "/client-dashboard"} />
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h2>
              <p className="text-gray-500">{agent?.role === "admin" ? "Administrator" : "Agent"}</p>
              <p className="text-sm text-gray-400 mt-1">Member since {agent?.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "Aug 2026"}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none" />
            </div>
            <div className="pt-4">
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
                <Save className="w-4 h-4" />Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">156</p>
              <p className="text-sm text-gray-500">Chats Handled</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">98%</p>
              <p className="text-sm text-gray-500">Satisfaction</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2m 15s</p>
              <p className="text-sm text-gray-500">Avg Response</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">47</p>
              <p className="text-sm text-gray-500">Active Days</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
