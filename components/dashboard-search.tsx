"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Loader2, Building2, X } from "lucide-react";
import type { SearchCompany, SearchContact } from "@/app/api/search/route";
import { CategoryBadge } from "@/components/category-badge";
import { CompanyLogo } from "@/components/company-logo";
import { PersonAvatar } from "@/components/person-avatar";
import { Input } from "@/components/ui/input";

export function DashboardSearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<SearchCompany[]>([]);
  const [contacts, setContacts] = useState<SearchContact[]>([]);
  const [active, setActive] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const query = q.trim();
    const id = ++reqId.current;
    const t = setTimeout(
      async () => {
        if (query.length < 2) {
          if (id === reqId.current) {
            setCompanies([]);
            setContacts([]);
            setLoading(false);
          }
          return;
        }
        if (id === reqId.current) setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (id !== reqId.current) return; // a newer query superseded this one
          setCompanies(data.companies ?? []);
          setContacts(data.contacts ?? []);
        } catch {
          if (id === reqId.current) {
            setCompanies([]);
            setContacts([]);
          }
        } finally {
          if (id === reqId.current) setLoading(false);
        }
      },
      query.length < 2 ? 0 : 200,
    );
    return () => clearTimeout(t);
  }, [q]);

  const hasQuery = q.trim().length >= 2;
  const hasResults = companies.length > 0 || contacts.length > 0;

  return (
    <div className="rounded-2xl border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="eyebrow">Search the database</span>
      </div>
      <div className="relative mt-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        {loading ? (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : q ? (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setActive(true)}
          placeholder="Search firms and people by name, title, email, country…"
          className="h-12 pl-11 pr-10 text-base"
          autoComplete="off"
        />
      </div>

      {active && hasQuery ? (
        <div className="mt-4">
          {!hasResults && !loading ? (
            <p className="text-sm text-muted-foreground py-4">
              No matches for “{q.trim()}”. Try a different term, or import data first.
            </p>
          ) : null}

          {contacts.length > 0 ? (
            <div className="mb-4">
              <p className="eyebrow mb-2">People</p>
              <ul className="divide-y rounded-lg border overflow-hidden">
                {contacts.map((c) => (
                  <li key={c.id}>
                    <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                      <PersonAvatar name={c.full_name} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{c.full_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {[c.job_title, c.company?.name].filter(Boolean).join(" · ") || c.email || "—"}
                        </div>
                      </div>
                      {c.company ? <CategoryBadge category={c.company.category} /> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {companies.length > 0 ? (
            <div>
              <p className="eyebrow mb-2">Companies</p>
              <ul className="divide-y rounded-lg border overflow-hidden">
                {companies.map((co) => (
                  <li key={co.id}>
                    <Link href={`/companies/${co.id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                      <CompanyLogo name={co.name} domain={co.domain} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{co.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {[co.sub_type, co.country].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </div>
                      <CategoryBadge category={co.category} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          Searches everything already in your CRM. Lusha lookups can be wired in here later.
        </p>
      )}
    </div>
  );
}
