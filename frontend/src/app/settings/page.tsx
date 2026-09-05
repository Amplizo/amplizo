"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { useAuthStore } from "@/store";
import { Save, Bell, Shield, Globe, Palette, Database, Mail, Webhook } from "lucide-react";

export default function SettingsPage() {
  const { agent } = useAuthStore();
  const [activeSection, setActiveSection] = useState("general");
  const [saved, setSaved] = useState(false);

  const sections = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "integrations", label: "Integrations", icon: Webhook },
    { id: "email", label: "Email", icon: Mail },
    { id: "data", label: "Data & Storage", icon: Database },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout title="Settings" subtitle="Configure your platform preferences">
      {saved && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl bg-green-500 text-white shadow-lg">
          Settings saved successfully!
        </div>
      )}
      <div className="space-y-4">
        <BackButton fallback={agent?.role === "admin" ? "/dashboard" : "/client-dashboard"} />
        <div className="flex gap-6">
        <div className="w-56 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 sticky top-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          {activeSection === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                  <input type="text" defaultValue="Amplizo" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                  <input type="email" defaultValue="support@amplizo.com" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                    <option>America/New_York (EST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "New chat notifications", description: "Get notified when a new chat starts" },
                  { label: "Agent status changes", description: "Notify when agents go online/offline" },
                  { label: "Client signups", description: "Get notified for new client registrations" },
                  { label: "System alerts", description: "Critical system notifications" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Enable 2FA</button>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Change Password</p>
                  <p className="text-sm text-gray-500 mb-3">Update your account password</p>
                  <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Change Password</button>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Active Sessions</p>
                  <p className="text-sm text-gray-500 mb-3">Manage your active login sessions</p>
                  <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">View Sessions</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <div className="flex gap-3">
                    {["Light", "Dark", "System"].map((theme) => (
                      <button key={theme} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">{theme}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex gap-3">
                    {["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"].map((color) => (
                      <button key={color} className={`w-8 h-8 rounded-full ${color}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeSection === "integrations" || activeSection === "email" || activeSection === "data") && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{sections.find(s => s.id === activeSection)?.label}</h3>
              <div className="p-8 text-center text-gray-500">
                <p>Configuration options for {sections.find(s => s.id === activeSection)?.label.toLowerCase()} will appear here.</p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
              <Save className="w-4 h-4" />Save Changes
            </button>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
