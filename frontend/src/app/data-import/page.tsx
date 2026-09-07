"use client";
import React, { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { FileUp, Upload, Download, CheckCircle2, AlertCircle, X, FileSpreadsheet, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function DataImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; skipped: number; message: string } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setResult(null);
    setFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    setError("");
    try {
      const data = await api.importCustomers(file);
      setResult({
        success: data.successCount || 0,
        failed: data.failedCount || 0,
        skipped: data.skippedCount || 0,
        message: data.message || "Import completed",
      });
      if (data.failedCount === 0) {
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      }
      if (data.errors?.length) {
        setError(data.errors.join("; "));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <DashboardLayout title="Data Import" subtitle="Bulk import customers from Excel/CSV">
      <BackButton className="mb-3" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                Upload Customer File
              </h2>
              <p className="text-sm text-gray-500 mt-1">CSV or Excel file with customer details. First row should be column headers.</p>
            </div>
            <button
              onClick={() => {
                const csv = "Name,Phone,Email,City,Source,Notes\nRahul Verma,9876543210,rahul@example.com,Mumbai,Website,VIP customer\nPriya Sharma,9876543211,priya@example.com,Delhi,Referral,Follow up next week\nAmit Kumar,9876543212,amit@example.com,Bangalore,Google,Hot lead\n";
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "customer-import-template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            {!file ? (
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">CSV, XLS, XLSX up to 10MB</p>
              </label>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={clearFile} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm whitespace-pre-line">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>{error}</div>
              </div>
            </div>
          )}

          {file && !result && !error && (
            <div className="mt-4">
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                {importing ? "Importing..." : "Import Customers"}
              </button>
            </div>
          )}
        </div>

        {result && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${result.failed === 0 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"}`}>
            {result.failed === 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">{result.message}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}