"use client";
import React, { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { FileUp, Upload, Download, CheckCircle2, AlertCircle, X, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface ParsedRow {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  source?: string;
  notes?: string;
}

export default function DataImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; duplicates: number } | null>(null);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState<{ detectedHeaders: string[]; totalRows: number; matched: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setResult(null);
    setDebug(null);
    setFile(f);
    parseFile(f);
  };

  const parseFile = async (f: File) => {
    const name = f.name.toLowerCase();
    const isXlsx = name.endsWith(".xlsx") || name.endsWith(".xls");
    const isCSV = name.endsWith(".csv") || (!isXlsx);

    try {
      if (isXlsx) {
        const buffer = await f.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
        processRows(json);
      } else {
        let text = await f.text();
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
        const rows: string[][] = [];
        let current: string[] = [];
        let field = "";
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          const next = text[i + 1];
          if (inQuotes) {
            if (c === '"' && next === '"') { field += '"'; i++; }
            else if (c === '"') { inQuotes = false; }
            else { field += c; }
          } else {
            if (c === '"') { inQuotes = true; }
            else if (c === ",") { current.push(field); field = ""; }
            else if (c === "\n" || c === "\r") {
              if (c === "\r" && next === "\n") i++;
              current.push(field); field = "";
              if (current.some((v) => v.trim() !== "")) rows.push(current);
              current = [];
            } else { field += c; }
          }
        }
        if (field !== "" || current.length) { current.push(field); if (current.some((v) => v.trim() !== "")) rows.push(current); }
        processRows(rows);
      }
    } catch (err: any) {
      setError(`Failed to parse file: ${err?.message || "unknown error"}. Make sure it's a valid CSV or XLSX file.`);
      setParsed([]);
      setDebug(null);
    }
  };

  const processRows = (rows: string[][]) => {
    if (rows.length < 2) {
      setError("File is empty or has no data rows. Make sure first row has column headers.");
      setParsed([]);
      setDebug(null);
      return;
    }

    const rawHeaders = rows[0].map((h) => String(h).trim());
    const normHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

    const matchHeader = (h: string, patterns: string[]): boolean => {
      for (const p of patterns) {
        if (h === p) return true;
        if (h.includes(p) || p.includes(h)) return true;
      }
      return false;
    };

    const data: ParsedRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      const row: any = {};
      normHeaders.forEach((h, idx) => {
        const v = String(cells[idx] || "").trim();
        if (!v) return;
        if (matchHeader(h, ["name", "fullname", "firstname", "lastname", "customername", "contactname"])) row.name = v;
        else if (matchHeader(h, ["phone", "mobile", "contact", "tel", "cell", "whatsapp", "phonenumber", "mobilenumber", "contactnumber"])) row.phone = v;
        else if (matchHeader(h, ["email", "mail", "emailaddress"])) row.email = v;
        else if (matchHeader(h, ["city", "location", "town", "place", "address"])) row.city = v;
        else if (matchHeader(h, ["source", "origin", "channel", "leadsource", "platform", "medium"])) row.source = v;
        else if (matchHeader(h, ["note", "remark", "comment", "description", "comments", "notes"])) row.notes = v;
      });
      if (row.name && row.phone) data.push(row);
    }

    if (data.length === 0) {
      setError(
        `Found ${rows.length - 1} data row(s) but none had both Name and Phone.\n\n` +
        `Detected headers: ${rawHeaders.join(", ")}\n\n` +
        `Tips: Make sure first row contains column names like "Name", "Phone", "Mobile", "Contact", etc. ` +
        `Phone column must contain at least 10 digits.`
      );
    }
    setParsed(data);
    setDebug({ detectedHeaders: rawHeaders, totalRows: rows.length - 1, matched: data.length });
  };

  const downloadTemplate = () => {
    const csv = "Name,Phone,Email,City,Source,Notes\nRahul Verma,9876543210,rahul@example.com,Mumbai,Website,VIP customer\nPriya Sharma,9876543211,priya@example.com,Delhi,Referral,Follow up next week\nAmit Kumar,9876543212,amit@example.com,Bangalore,Google,Hot lead\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPreview = () => {
    if (parsed.length === 0) return;
    const rows = parsed.map((r, i) => ({
      "#": i + 1,
      Name: r.name || "",
      Phone: r.phone || "",
      Email: r.email || "",
      City: r.city || "",
      Source: r.source || "",
      Notes: r.notes || "",
      "Status (preview)": "Pending import",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Import Preview");
    const filename = `customer-import-preview-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setImporting(true);
    setResult(null);
    setError("");
    const errors: string[] = [];
    let success = 0;
    let failed = 0;
    let duplicates = 0;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("amplizo_token") : null;
      const API_BASE = (typeof window !== "undefined" && (window as any).__API_BASE__) || "http://localhost:4000/api";
      const res = await fetch(`${API_BASE}/customers/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customers: parsed.map((row) => ({
            name: row.name,
            phone: row.phone.replace(/[^0-9]/g, ""),
            email: row.email || undefined,
            city: row.city || undefined,
            source: row.source || undefined,
            notes: row.notes || undefined,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const results: any[] = data?.results || [];
        success = data?.success || 0;
        failed = results.length - success;
        duplicates = results.filter((r: any) => r.status === "duplicate").length;
        results
          .filter((r: any) => !r.ok)
          .slice(0, 3)
          .forEach((r: any) => errors.push(`${r.name || "Row"}: ${r.error}`));
      } else {
        failed = parsed.length;
        const body = await res.json().catch(() => ({}));
        const msg = body?.message?.message || body?.message || `HTTP ${res.status}`;
        errors.push(msg);
      }
    } catch (e: any) {
      failed = parsed.length;
      errors.push(e?.message || "Network error");
    }
    setImporting(false);
    setResult({ success, failed, duplicates } as any);
    if (errors.length > 0) {
      setError(`Import errors: ${errors.join("; ")}${failed > errors.length ? ` (and ${failed - errors.length} more)` : ""}`);
    }
    if (failed === 0) {
      setFile(null);
      setParsed([]);
      if (fileRef.current) fileRef.current.value = "";
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("amplizo:customers-updated"));
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsed([]);
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
              onClick={downloadTemplate}
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

          {debug && !error && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
              <p><strong>Detected headers:</strong> {debug.detectedHeaders.join(" | ")}</p>
              <p className="mt-1"><strong>Matched:</strong> {debug.matched} of {debug.totalRows} rows</p>
            </div>
          )}
        </div>

        {parsed.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Preview ({parsed.length} customers)</h2>
                <p className="text-sm text-gray-500 mt-1">Review the parsed data before importing</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportPreview}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  title="Download the parsed data as Excel"
                >
                  <Download className="w-4 h-4" /> Export Preview
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  <FileUp className="w-4 h-4" />
                  {importing ? `Importing... ${result ? `${result.success} done` : ""}` : `Import ${parsed.length} Customers`}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">City</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Source</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{r.name}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.phone}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.email || "—"}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.city || "—"}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.source || "—"}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-xs truncate" title={r.notes}>{r.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.length > 50 && (
                <p className="text-xs text-gray-500 mt-2 text-center">Showing first 50 of {parsed.length} rows</p>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${result.failed === 0 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"}`}>
            {result.failed === 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">
              {result.failed === 0
                ? `Successfully imported ${result.success} customers${result.duplicates ? ` (${result.duplicates} already existed, updated)` : ""}!`
                : `Imported ${result.success} customers${result.duplicates ? ` (${result.duplicates} duplicates)` : ""}. ${result.failed} failed.`}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
