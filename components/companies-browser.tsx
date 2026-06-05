"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Company, Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { CategoryBadge } from "@/components/category-badge";
import { CompanyLogo } from "@/components/company-logo";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Filter = Category | "ALL";

export function CompaniesBrowser({
  companies,
  initialFilter = "ALL",
}: {
  companies: Company[];
  initialFilter?: Filter;
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: companies.length, LP: 0, GP: 0, SP: 0 };
    for (const co of companies) c[co.category] += 1;
    return c;
  }, [companies]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return companies.filter((co) => {
      if (filter !== "ALL" && co.category !== filter) return false;
      if (!needle) return true;
      return (
        co.name.toLowerCase().includes(needle) ||
        (co.sub_type ?? "").toLowerCase().includes(needle) ||
        (co.country ?? "").toLowerCase().includes(needle)
      );
    });
  }, [companies, filter, q]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "ALL", label: "All" },
    ...CATEGORY_ORDER.map((k) => ({ key: k as Filter, label: CATEGORIES[k].label })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border bg-card p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                filter === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className="ml-1.5 tabular text-xs opacity-70">{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies…"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">
          No companies match. Try the Import tab to pull leads from Lusha.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((co) => (
            <Link
              key={co.id}
              href={`/companies/${co.id}`}
              className="lift rounded-xl border bg-card p-4 flex gap-3"
            >
              <CompanyLogo name={co.name} domain={co.domain} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold truncate">{co.name}</span>
                  <CategoryBadge category={co.category} />
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {co.sub_type ?? CATEGORIES[co.category].name}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {[co.city, co.country].filter(Boolean).join(", ") || co.hq_location || "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
