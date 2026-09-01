"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Plus, Search, Filter, MoreVertical, Eye, Trash2, Calendar, IndianRupee, Target, TrendingUp, Award, Crown, Medal, Star, X } from "lucide-react";

const mockEmployees = [
  { id: "1", name: "Sarah Johnson", role: "Sales Manager", department: "Sales", email: "sarah@amplizo.com", phone: "+91 98765 43210", attendance: "Present", salary: 65000, commission: 12500, target: 500000, achieved: 620000, performance: 92, avatar: "SJ" },
  { id: "2", name: "Mike Chen", role: "Senior Sales Rep", department: "Sales", email: "mike@amplizo.com", phone: "+91 87654 32109", attendance: "Present", salary: 45000, commission: 8900, target: 300000, achieved: 340000, performance: 88, avatar: "MC" },
  { id: "3", name: "Emily Davis", role: "Sales Rep", department: "Sales", email: "emily@amplizo.com", phone: "+91 76543 21098", attendance: "On Leave", salary: 35000, commission: 5600, target: 200000, achieved: 180000, performance: 78, avatar: "ED" },
  { id: "4", name: "James Wilson", role: "Sales Rep", department: "Sales", email: "james@amplizo.com", phone: "+91 65432 10987", attendance: "Present", salary: 35000, commission: 7200, target: 200000, achieved: 240000, performance: 85, avatar: "JW" },
  { id: "5", name: "Priya Singh", role: "Team Lead", department: "Support", email: "priya@amplizo.com", phone: "+91 54321 09876", attendance: "Present", salary: 55000, commission: 9800, target: 400000, achieved: 380000, performance: 90, avatar: "PS" },
  { id: "6", name: "Raj Kumar", role: "Support Executive", department: "Support", email: "raj@amplizo.com", phone: "+91 43210 98765", attendance: "Present", salary: 28000, commission: 3200, target: 150000, achieved: 165000, performance: 82, avatar: "RK" },
];

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "list" | "leaderboard">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredEmployees = mockEmployees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.role.toLowerCase().includes(searchQuery.toLowerCase()) || e.department.toLowerCase().includes(searchQuery.toLowerCase()));

  const sortedByPerformance = [...mockEmployees].sort((a, b) => b.performance - a.performance);
  const sortedByAchieved = [...mockEmployees].sort((a, b) => b.achieved - a.achieved);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getLeaderboardIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs text-gray-500">{index + 1}</span>;
  };

  return (
    <DashboardLayout title="Employee Management" subtitle="Manage attendance, salary, commission, and performance">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockEmployees.length}</p>
            <p className="text-sm text-gray-500">Total Employees</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockEmployees.filter(e => e.attendance === "Present").length}</p>
            <p className="text-sm text-gray-500">Present Today</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(mockEmployees.reduce((acc, e) => acc + e.achieved, 0) / 100000).toFixed(1)}L</p>
            <p className="text-sm text-gray-500">Total Achieved</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(mockEmployees.reduce((acc, e) => acc + e.performance, 0) / mockEmployees.length)}%</p>
            <p className="text-sm text-gray-500">Avg Performance</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {([["overview", "Overview"], ["list", "Employee List"], ["leaderboard", "Leaderboard"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-brand-600" />Attendance Today</h3>
              <div className="space-y-3">
                {mockEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{emp.avatar}</div>
                      <div><p className="font-medium text-gray-900 dark:text-gray-100">{emp.name}</p><p className="text-xs text-gray-500">{emp.role}</p></div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${emp.attendance === "Present" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{emp.attendance}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-600" />Performance Overview</h3>
              <div className="space-y-3">
                {sortedByPerformance.slice(0, 5).map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{emp.avatar}</div>
                      <div><p className="font-medium text-gray-900 dark:text-gray-100">{emp.name}</p><p className="text-xs text-gray-500">Target: ₹{emp.target.toLocaleString("en-IN")}</p></div>
                    </div>
                    <span className={`text-lg font-bold ${getPerformanceColor(emp.performance)}`}>{emp.performance}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Employee List Tab */}
        {activeTab === "list" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
              </div>
              <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />Add Employee</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{emp.avatar}</div><div><p className="font-medium text-gray-900 dark:text-gray-100">{emp.name}</p><p className="text-xs text-gray-500">{emp.email}</p></div></div></td>
                      <td className="px-4 py-3"><div><p className="text-gray-900 dark:text-gray-100">{emp.role}</p><p className="text-xs text-gray-500">{emp.department}</p></div></td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${emp.attendance === "Present" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{emp.attendance}</span></td>
                      <td className="px-4 py-3 text-gray-600">₹{emp.salary.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">+₹{emp.commission.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className={`font-medium ${getPerformanceColor(emp.performance)}`}>{emp.performance}%</span><div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${emp.performance >= 90 ? "bg-green-500" : emp.performance >= 80 ? "bg-blue-500" : emp.performance >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${emp.performance}%` }} /></div></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h3 className="font-semibold text-gray-900 dark:text-gray-100">Performance Leaderboard</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Achieved</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Achieved</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedByAchieved.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">{getLeaderboardIcon(index)}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">{emp.avatar}</div><div><p className="font-medium text-gray-900 dark:text-gray-100">{emp.name}</p><p className="text-xs text-gray-500">{emp.role}</p></div></div></td>
                      <td className="px-4 py-3 text-gray-600">₹{emp.target.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">₹{emp.achieved.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-gray-600">{Math.round((emp.achieved / emp.target) * 100)}%</td>
                      <td className="px-4 py-3"><span className={`font-medium ${getPerformanceColor(emp.performance)}`}>{emp.performance}%</span></td>
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
