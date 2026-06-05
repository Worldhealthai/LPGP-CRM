"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { FundWithManager } from "@/lib/types";
import { CompanyLogo } from "@/components/company-logo";
import { Input } from "@/components/ui/input";
import { formatUsd } from "@/lib/utils";

export function FundsBrowser({ funds }: { funds: FundWithManager[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return funds;
    return funds.filter(
      (f) =>
        f.name.toLowerCase().includes(needle) ||
        (f.strategy ?? "").toLowerCase().includes(needle) ||
        (f.geography ?? "").toLowerCase().includes(needle) ||
        (f.manager?.name ?? "").toLowerCase().includes(needle),
    );
  }, [funds, q]);

  const totalSize = filtered.reduce((s, f) => s + (f.fund_size_usd ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span>
            <strong className="tabular">{filtered.length}</strong>{" "}
            <span className="text-muted-foreground">funds</span>
          </span>
          <span className="text-muted-foreground">
            <strong className="tabular text-foreground">{formatUsd(totalSize)}</strong> tracked capital
          </span>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search funds, managers, strategy…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-2.5">Fund</th>
                <th className="text-left font-medium px-3 py-2.5">Manager</th>
                <th className="text-left font-medium px-3 py-2.5">Strategy</th>
                <th className="text-left font-medium px-3 py-2.5">Vintage</th>
                <th className="text-right font-medium px-3 py-2.5">Size</th>
                <th className="text-left font-medium px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No funds match. Seed funds with{" "}
                    <code className="font-mono text-xs">supabase/seed_funds.sql</code>.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/funds/${f.id}`} className="font-medium hover:text-primary">
                        {f.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      {f.manager ? (
                        <Link
                          href={`/companies/${f.manager.id}`}
                          className="inline-flex items-center gap-2 hover:text-primary"
                        >
                          <CompanyLogo name={f.manager.name} domain={f.manager.domain} size={22} />
                          <span className="truncate max-w-[150px]">{f.manager.name}</span>
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{f.strategy ?? "—"}</td>
                    <td className="px-3 py-3 tabular">{f.vintage_year ?? "—"}</td>
                    <td className="px-3 py-3 text-right tabular whitespace-nowrap font-medium">
                      {f.fund_size_usd != null
                        ? formatUsd(f.fund_size_usd)
                        : f.target_size_usd != null
                          ? `${formatUsd(f.target_size_usd)} tgt`
                          : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {f.status ? (
                        <span className="inline-flex items-center rounded-md border bg-secondary px-2 py-0.5 text-xs">
                          {f.status}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
