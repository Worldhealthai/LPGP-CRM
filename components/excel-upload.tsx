"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2, UploadCloud, FileSpreadsheet, Check, Download, X } from "lucide-react";
import { CATEGORIES, CATEGORY_ORDER, isCategory } from "@/lib/categories";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Field =
  | "firstName"
  | "lastName"
  | "fullName"
  | "jobTitle"
  | "email"
  | "phone"
  | "linkedinUrl"
  | "country"
  | "city"
  | "companyName"
  | "companyDomain"
  | "companyWebsite"
  | "subType"
  | "department"
  | "seniority"
  | "category";

// Header synonyms (normalized: lowercased, alphanumerics only).
const SYNONYMS: Record<Field, string[]> = {
  firstName: ["firstname", "first", "givenname", "fname"],
  lastName: ["lastname", "last", "surname", "familyname", "lname"],
  fullName: ["name", "fullname", "contact", "contactname", "person"],
  jobTitle: ["jobtitle", "title", "position", "role", "jobrole"],
  email: ["email", "emailaddress", "workemail", "mail", "emailid"],
  phone: ["phone", "phonenumber", "mobile", "directphone", "telephone", "tel", "cell"],
  linkedinUrl: ["linkedin", "linkedinurl", "linkedinprofile", "linkedinlink", "li"],
  country: ["country", "countryname"],
  city: ["city", "town", "location"],
  companyName: ["company", "companyname", "firm", "organization", "organisation", "account", "employer"],
  companyDomain: ["domain", "companydomain", "websitedomain"],
  companyWebsite: ["website", "url", "companywebsite", "weburl", "site"],
  subType: ["subtype", "firmtype", "type", "companytype"],
  department: ["department", "dept", "function"],
  seniority: ["seniority", "level", "senioritylevel"],
  category: ["category", "book", "bucket", "lpgpsp"],
};

const FIELD_LABELS: Record<Field, string> = {
  firstName: "First name",
  lastName: "Last name",
  fullName: "Full name",
  jobTitle: "Job title",
  email: "Email",
  phone: "Phone",
  linkedinUrl: "LinkedIn",
  country: "Country",
  city: "City",
  companyName: "Company",
  companyDomain: "Company domain",
  companyWebsite: "Website",
  subType: "Firm type",
  department: "Department",
  seniority: "Seniority",
  category: "Book (LP/GP/SP)",
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

type MappedRow = Record<string, string | null>;

export function ExcelUpload({ adminReady }: { adminReady: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [rows, setRows] = useState<MappedRow[]>([]);
  const [mapping, setMapping] = useState<Partial<Record<Field, string>>>({});
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [category, setCategory] = useState<Category>("LP");
  const [dragging, setDragging] = useState(false);

  function reset() {
    setFileName(null);
    setRows([]);
    setMapping({});
    setUnmapped([]);
    setError(null);
    setSummary(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setError(null);
    setSummary(null);
    setParsing(true);
    setFileName(file.name);
    try {
      const mod = await import("xlsx");
      const XLSX = ("read" in mod ? mod : (mod as { default: typeof mod }).default) ?? mod;
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) throw new Error("That file has no sheets.");
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });
      if (json.length === 0) throw new Error("No rows found in the first sheet.");

      const headers = Object.keys(json[0]);
      const map: Partial<Record<Field, string>> = {};
      const usedHeaders = new Set<string>();
      for (const field of Object.keys(SYNONYMS) as Field[]) {
        const match = headers.find((h) => SYNONYMS[field].includes(norm(h)));
        if (match) {
          map[field] = match;
          usedHeaders.add(match);
        }
      }
      setMapping(map);
      setUnmapped(headers.filter((h) => !usedHeaders.has(h)));

      const mapped = json.map((r) => mapRow(r, map));
      setRows(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that file.");
      setRows([]);
    } finally {
      setParsing(false);
    }
  }

  function mapRow(r: Record<string, unknown>, map: Partial<Record<Field, string>>): MappedRow {
    const get = (f: Field): string | null => {
      const h = map[f];
      if (!h) return null;
      const v = r[h];
      const s = v == null ? "" : String(v).trim();
      return s === "" ? null : s;
    };

    let firstName = get("firstName");
    let lastName = get("lastName");
    const full = get("fullName");
    if (!firstName && !lastName && full) {
      const parts = full.split(/\s+/);
      firstName = parts[0] ?? null;
      lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
    }
    const catRaw = get("category")?.toUpperCase();
    return {
      firstName,
      lastName,
      jobTitle: get("jobTitle"),
      email: get("email"),
      phone: get("phone"),
      linkedinUrl: get("linkedinUrl"),
      country: get("country"),
      city: get("city"),
      companyName: get("companyName"),
      companyDomain: get("companyDomain"),
      companyWebsite: get("companyWebsite"),
      subType: get("subType"),
      department: get("department"),
      seniority: get("seniority"),
      category: catRaw && isCategory(catRaw) ? catRaw : null,
    };
  }

  async function runImport() {
    setError(null);
    setSummary(null);
    setImporting(true);
    try {
      const res = await fetch("/api/import/spreadsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setSummary(
        `Imported ${data.imported} contact${data.imported === 1 ? "" : "s"} · ` +
          `${data.companiesCreated} new compan${data.companiesCreated === 1 ? "y" : "ies"}` +
          (data.skipped ? ` · ${data.skipped} row${data.skipped === 1 ? "" : "s"} skipped` : ""),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const headers = [
      "First Name",
      "Last Name",
      "Company Name",
      "Job Title",
      "LinkedIn",
      "Email",
      "Phone",
      "Country",
      "Category",
    ];
    const example = [
      "Jane",
      "Doe",
      "BlackRock",
      "Managing Director",
      "https://www.linkedin.com/in/janedoe",
      "jane.doe@blackrock.com",
      "+1 212 555 0100",
      "US",
      "GP",
    ];
    const csv = [headers, example].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lpgp-crm-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const withEmail = rows.filter((r) => r.email).length;
  const withCompany = rows.filter((r) => r.companyName || r.companyDomain).length;
  const preview = rows.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed bg-card px-6 py-10 text-center transition-colors",
          dragging ? "border-primary bg-accent/50" : "border-border",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
          {parsing ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
        </div>
        <p className="font-medium">
          {fileName ? fileName : "Drop an Excel or CSV file here"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          .xlsx, .xls or .csv — columns are matched automatically.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button onClick={() => inputRef.current?.click()} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4" /> Choose file
          </Button>
          <Button onClick={downloadTemplate} variant="ghost" size="sm">
            <Download className="h-4 w-4" /> Template
          </Button>
          {fileName ? (
            <Button onClick={reset} variant="ghost" size="sm">
              <X className="h-4 w-4" /> Clear
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {rows.length > 0 ? (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          {/* Stats + detected columns */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span><strong className="tabular">{rows.length}</strong> rows</span>
            <span className="text-muted-foreground"><strong className="tabular text-foreground">{withEmail}</strong> with email</span>
            <span className="text-muted-foreground"><strong className="tabular text-foreground">{withCompany}</strong> with a company</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(mapping) as Field[]).map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-md border bg-secondary px-2 py-0.5 text-xs">
                <span className="font-medium">{FIELD_LABELS[f]}</span>
                <span className="text-muted-foreground">← {mapping[f]}</span>
              </span>
            ))}
            {unmapped.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                Ignored: {unmapped.join(", ")}
              </span>
            ) : null}
          </div>

          {/* Preview */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Name</th>
                  <th className="text-left font-medium px-3 py-2">Title</th>
                  <th className="text-left font-medium px-3 py-2">Company</th>
                  <th className="text-left font-medium px-3 py-2">Email</th>
                  <th className="text-left font-medium px-3 py-2">Country</th>
                  <th className="text-left font-medium px-3 py-2">Book</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-[180px] truncate">{r.jobTitle ?? "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.companyName ?? "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.email ?? "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.country ?? "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.category ?? <span className="text-muted-foreground">default</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > preview.length ? (
            <p className="text-xs text-muted-foreground">Showing first {preview.length} of {rows.length} rows.</p>
          ) : null}

          {/* Default book + import */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 pt-1">
            <div>
              <Label className="mb-1.5">Default book <span className="text-muted-foreground font-normal">(for rows without a Category column)</span></Label>
              <div className="inline-flex rounded-lg border bg-background p-1">
                {CATEGORY_ORDER.map((k) => (
                  <button
                    key={k}
                    onClick={() => setCategory(k)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                      category === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                    title={CATEGORIES[k].name}
                  >
                    {CATEGORIES[k].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:ml-auto">
              <Button onClick={runImport} disabled={importing || !adminReady}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Import {rows.length} row{rows.length === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
          {!adminReady ? (
            <p className="text-xs text-amber-700">
              Set <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in your environment to enable importing.
            </p>
          ) : null}
        </div>
      ) : null}

      {summary ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 px-4 py-3 text-sm flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" /> {summary} — see{" "}
          <Link href="/companies" className="underline font-medium">Companies</Link> and{" "}
          <Link href="/contacts" className="underline font-medium">Contacts</Link>.
        </div>
      ) : null}
    </div>
  );
}
