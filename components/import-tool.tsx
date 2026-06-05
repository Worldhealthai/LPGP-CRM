"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Search, Download, Mail, Phone, Check } from "lucide-react";
import { CATEGORIES, CATEGORY_ORDER, DEFAULT_TITLE_PRESETS } from "@/lib/categories";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Preview = {
  contactId: string;
  name: string | null;
  jobTitle: string | null;
  companyName: string | null;
  companyDomain: string | null;
  country: string | null;
  hasEmail: boolean;
  hasPhone: boolean;
};

export function ImportTool({ lushaReady, adminReady }: { lushaReady: boolean; adminReady: boolean }) {
  const [category, setCategory] = useState<Category>("LP");
  const [jobTitles, setJobTitles] = useState(DEFAULT_TITLE_PRESETS.slice(0, 8).join(", "));
  const [countries, setCountries] = useState("");
  const [companyNames, setCompanyNames] = useState("");
  const [companyDomains, setCompanyDomains] = useState("");

  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [results, setResults] = useState<Preview[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<string | null>(null);

  async function runSearch() {
    setError(null);
    setSummary(null);
    setSearching(true);
    setResults([]);
    setSelected(new Set());
    try {
      const res = await fetch("/api/lusha/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitles, countries, companyNames, companyDomains }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setRequestId(data.requestId ?? null);
      setResults(data.contacts ?? []);
      setSelected(new Set((data.contacts ?? []).map((c: Preview) => c.contactId)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function runImport() {
    setError(null);
    setSummary(null);
    setImporting(true);
    try {
      const res = await fetch("/api/lusha/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, requestId, contactIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setSummary(
        `Imported ${data.imported} contact${data.imported === 1 ? "" : "s"} · ` +
          `${data.companiesCreated} new compan${data.companiesCreated === 1 ? "y" : "ies"}` +
          (data.skipped ? ` · ${data.skipped} skipped` : ""),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected = results.length > 0 && selected.size === results.length;

  return (
    <div className="space-y-6">
      {!lushaReady ? (
        <div className="rounded-lg border bg-muted text-foreground px-4 py-3 text-sm">
          <code className="font-mono text-xs">LUSHA_API_KEY</code> isn&apos;t set — searches will
          fail until you add it to your environment.
        </div>
      ) : null}

      {/* Filters */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div>
          <Label className="mb-2">Import into book</Label>
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
          <p className="mt-2 text-xs text-muted-foreground">{CATEGORIES[category].blurb}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5">Job titles <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
            <Textarea
              value={jobTitles}
              onChange={(e) => setJobTitles(e.target.value)}
              rows={2}
              placeholder="Managing Director, Chief Investment Officer, Head of Private Markets…"
            />
          </div>
          <div>
            <Label className="mb-1.5">Countries</Label>
            <Input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="US, GB, AE" />
          </div>
          <div>
            <Label className="mb-1.5">Company names</Label>
            <Input
              value={companyNames}
              onChange={(e) => setCompanyNames(e.target.value)}
              placeholder="BlackRock, Ares Management"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5">Company domains <span className="text-muted-foreground font-normal">(optional, most precise)</span></Label>
            <Input
              value={companyDomains}
              onChange={(e) => setCompanyDomains(e.target.value)}
              placeholder="blackrock.com, aresmgmt.com"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={runSearch} disabled={searching || !lushaReady}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search Lusha
          </Button>
          <p className="text-xs text-muted-foreground">
            Search previews are light; revealing emails &amp; phones on import spends Lusha credits.
          </p>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() =>
                  setSelected(allSelected ? new Set() : new Set(results.map((r) => r.contactId)))
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
              {selected.size} of {results.length} selected
            </label>
            <Button
              onClick={runImport}
              disabled={importing || selected.size === 0 || !adminReady}
              size="sm"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Import {selected.size} as {CATEGORIES[category].label}
            </Button>
          </div>

          {!adminReady ? (
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted border-b">
              Set <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to enable importing.
            </div>
          ) : null}

          <ul className="divide-y max-h-[28rem] overflow-y-auto">
            {results.map((r) => (
              <li
                key={r.contactId}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 cursor-pointer"
                onClick={() => toggle(r.contactId)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(r.contactId)}
                  onChange={() => toggle(r.contactId)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{r.name ?? "Unknown"}</span>
                    <span className="text-muted-foreground text-sm truncate">{r.jobTitle ?? ""}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[r.companyName, r.country].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  {r.hasEmail ? <Mail className="h-3.5 w-3.5" /> : null}
                  {r.hasPhone ? <Phone className="h-3.5 w-3.5" /> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary ? (
        <div className="rounded-lg border bg-muted text-foreground px-4 py-3 text-sm flex items-center gap-2">
          <Check className="h-4 w-4" /> {summary} — see the{" "}
          <Link href="/companies" className="underline font-medium">Companies</Link> and{" "}
          <Link href="/contacts" className="underline font-medium">Contacts</Link> tabs.
        </div>
      ) : null}
    </div>
  );
}
