"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { Shield, Lock, Database, Smartphone, FileText, Users, UserCheck, Key, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle, Settings, RefreshCw, Download, Trash2, Bell } from "lucide-react";

const securityFeatures = [
  { id: "encryption", name: "Encryption", icon: Lock, description: "End-to-end encryption for all data", status: "enabled", score: 100 },
  { id: "backup", name: "Auto Backup", icon: Database, description: "Daily automated backups", status: "enabled", score: 95 },
  { id: "otp", name: "Two-Factor Auth", icon: Smartphone, description: "OTP verification for login", status: "enabled", score: 100 },
  { id: "audit", name: "Audit Logs", icon: FileText, description: "Track all user activities", status: "enabled", score: 90 },
  { id: "roles", name: "Role Permissions", icon: Users, description: "Granular access control", status: "enabled", score: 85 },
  { id: "consent", name: "Consent Management", icon: UserCheck, description: "GDPR-compliant consent tracking", status: "partial", score: 75 },
];

const mockAuditLogs = [
  { id: "1", user: "Sarah Johnson", action: "Updated customer record", target: "Rahul Verma", time: "2 min ago", ip: "192.168.1.1" },
  { id: "2", user: "Mike Chen", action: "Exported data", target: "Monthly Report", time: "15 min ago", ip: "192.168.1.2" },
  { id: "3", user: "Emily Davis", action: "Changed permissions", target: "Agent Role", time: "1 hour ago", ip: "192.168.1.3" },
  { id: "4", user: "System", action: "Backup completed", target: "Full Backup", time: "3 hours ago", ip: "System" },
  { id: "5", user: "James Wilson", action: "Logged in", target: "Dashboard", time: "5 hours ago", ip: "192.168.1.4" },
];

const mockSecuritySettings = {
  sessionTimeout: 30,
  passwordExpiry: 90,
  maxLoginAttempts: 5,
  enableNotifications: true,
};

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "audit">("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState(mockSecuritySettings);

  const securityScore = Math.round(securityFeatures.reduce((acc, f) => acc + f.score, 0) / securityFeatures.length);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <DashboardLayout title="Security" subtitle="Encryption, backups, audit logs, and access control">
      <BackButton className="mb-3" />
      <div className="space-y-6">
        {/* Security Score */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${securityScore * 2.76} 276`} className={securityScore >= 90 ? "text-green-500" : securityScore >= 75 ? "text-yellow-500" : "text-red-500"} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>{securityScore}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Security Score</h3>
              <p className={`text-lg font-medium ${getScoreColor(securityScore)}`}>{getScoreLabel(securityScore)}</p>
              <p className="text-sm text-gray-500 mt-1">Your security posture is {securityScore >= 90 ? "strong" : securityScore >= 75 ? "moderate" : "needs attention"}. {securityFeatures.filter(f => f.status === "partial").length} items need review.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["settings", "Settings"], ["audit", "Audit Logs"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Security Features</h3>
              <div className="space-y-3">
                {securityFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600"><Icon className="w-5 h-5" /></div>
                        <div><p className="font-medium text-gray-900 dark:text-gray-100">{feature.name}</p><p className="text-xs text-gray-500">{feature.description}</p></div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${feature.status === "enabled" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{feature.status === "enabled" ? "Active" : "Partial"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {mockAuditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{log.user}</p>
                      <p className="text-xs text-gray-500">{log.action} - {log.target}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label><input type="number" value={settings.sessionTimeout} onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label><input type="number" value={settings.passwordExpiry} onChange={(e) => setSettings({ ...settings, passwordExpiry: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label><input type="number" value={settings.maxLoginAttempts} onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" /></div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div><p className="font-medium text-gray-900 dark:text-gray-100">Security Notifications</p><p className="text-xs text-gray-500">Get alerts for suspicious activities</p></div>
                  <button onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableNotifications ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableNotifications ? "translate-x-6" : "translate-x-1"}`} /></button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div><p className="font-medium text-gray-900 dark:text-gray-100">Show Password</p><p className="text-xs text-gray-500">Display password in plain text</p></div>
                  <button onClick={() => setShowPassword(!showPassword)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showPassword ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPassword ? "translate-x-6" : "translate-x-1"}`} /></button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Download className="w-5 h-5" /></div>
                  <div><p className="font-medium text-gray-900 dark:text-gray-100">Export Data</p><p className="text-xs text-gray-500">Download all data</p></div>
                </button>
                <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600"><RefreshCw className="w-5 h-5" /></div>
                  <div><p className="font-medium text-gray-900 dark:text-gray-100">Backup Now</p><p className="text-xs text-gray-500">Create manual backup</p></div>
                </button>
                <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600"><Trash2 className="w-5 h-5" /></div>
                  <div><p className="font-medium text-gray-900 dark:text-gray-100">Delete Data</p><p className="text-xs text-gray-500">Permanently remove</p></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "audit" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Audit Logs</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"><Download className="w-4 h-4" />Export Logs</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{log.user}</td>
                      <td className="px-4 py-3 text-gray-600">{log.action}</td>
                      <td className="px-4 py-3 text-gray-500">{log.target}</td>
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">{log.ip}</td>
                      <td className="px-4 py-3 text-gray-500">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
