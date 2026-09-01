"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Search, Filter, Plus, X, Eye, Mail, Phone, MapPin, ShoppingBag, Star, MoreVertical, ChevronDown } from "lucide-react";

const mockCustomers = [
  { id: "1", name: "Rahul Verma", email: "rahul@company.com", phone: "+91 98765 43210", city: "Mumbai", status: "Active", totalSpend: 125000, visits: 24, lastVisit: "2 hours ago", segment: "VIP", satisfaction: 98 },
  { id: "2", name: "Priya Sharma", email: "priya@business.in", phone: "+91 87654 32109", city: "Delhi", status: "Active", totalSpend: 89000, visits: 18, lastVisit: "1 day ago", segment: "High Value", satisfaction: 96 },
  { id: "3", name: "Amit Kumar", email: "amit@startup.io", phone: "+91 76543 21098", city: "Bangalore", status: "Active", totalSpend: 45000, visits: 12, lastVisit: "3 days ago", segment: "Regular", satisfaction: 94 },
  { id: "4", name: "Neha Patel", email: "neha@enterprise.com", phone: "+91 65432 10987", city: "Ahmedabad", status: "Inactive", totalSpend: 23000, visits: 6, lastVisit: "2 weeks ago", segment: "Cold", satisfaction: 88 },
  { id: "5", name: "Vikram Singh", email: "vikram@corp.in", phone: "+91 54321 09876", city: "Jaipur", status: "Active", totalSpend: 156000, visits: 32, lastVisit: "5 hours ago", segment: "VIP", satisfaction: 97 },
  { id: "6", name: "Anita Desai", email: "anita@tech.co", phone: "+91 43210 98765", city: "Pune", status: "Active", totalSpend: 67000, visits: 15, lastVisit: "1 day ago", segment: "High Value", satisfaction: 95 },
  { id: "7", name: "Suresh Reddy", email: "suresh@digital.in", phone: "+91 32109 87654", city: "Hyderabad", status: "Active", totalSpend: 98000, visits: 28, lastVisit: "3 hours ago", segment: "VIP", satisfaction: 99 },
  { id: "8", name: "Meera Joshi", email: "meera@innovate.com", phone: "+91 21098 76543", city: "Chennai", status: "Inactive", totalSpend: 12000, visits: 3, lastVisit: "1 month ago", segment: "Cold", satisfaction: 82 },
];

type Customer = typeof mockCustomers[0];

export default function CRMPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterSegment, setFilterSegment] = useState<string>("All");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", city: "" });

  const filteredCustomers = mockCustomers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    const matchesSegment = filterSegment === "All" || c.segment === filterSegment;
    return matchesSearch && matchesStatus && matchesSegment;
  });

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "VIP": return "bg-purple-100 text-purple-700";
      case "High Value": return "bg-blue-100 text-blue-700";
      case "Regular": return "bg-green-100 text-green-700";
      case "Cold": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout title="Smart CRM" subtitle="Manage customer relationships and segments">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockCustomers.length}</p>
            <p className="text-sm text-gray-500">Total Customers</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockCustomers.filter(c => c.status === "Active").length}</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(mockCustomers.reduce((acc, c) => acc + c.totalSpend, 0) / 100000).toFixed(1)}L</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(mockCustomers.reduce((acc, c) => acc + c.satisfaction, 0) / mockCustomers.length)}%</p>
            <p className="text-sm text-gray-500">Avg Satisfaction</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select value={filterSegment} onChange={(e) => setFilterSegment(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
              <option value="All">All Segments</option>
              <option value="VIP">VIP</option>
              <option value="High Value">High Value</option>
              <option value="Regular">Regular</option>
              <option value="Cold">Cold</option>
            </select>
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 whitespace-nowrap"><Plus className="w-4 h-4" />Add Customer</button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spend</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-medium text-xs">
                          {customer.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Mail className="w-3 h-3" />{customer.email}</span>
                        <span className="flex items-center gap-1 text-gray-500 text-xs"><Phone className="w-3 h-3" />{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSegmentColor(customer.segment)}`}>{customer.segment}</span></td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">₹{customer.totalSpend.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.visits}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${customer.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{customer.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedCustomer(customer)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Eye className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Mail className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical className="w-4 h-4 text-gray-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customer Details</h3>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedCustomer.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSegmentColor(selectedCustomer.segment)}`}>{selectedCustomer.segment}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.phone}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Total Spend</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">₹{selectedCustomer.totalSpend.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Visits</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.visits}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Satisfaction</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.satisfaction}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Last Visit</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedCustomer.lastVisit}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Customer</h3>
                <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddForm(false); setNewCustomer({ name: "", email: "", phone: "", city: "" }); }}>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="Enter name" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="email@example.com" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="+91 98765 43210" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={newCustomer.city} onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="Enter city" /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Add Customer</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
