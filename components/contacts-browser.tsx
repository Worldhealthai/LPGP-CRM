"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Mail, Phone, Link2 } from "lucide-react";
import type { ContactWithCompany, Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { CategoryBadge } from "@/components/category-badge";
import { PersonAvatar } from "@/components/person-avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Filter = Category | "ALL";

export function ContactsBrowser({ contacts }: { contacts: ContactWithCompany[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filter !== "ALL" && c.company?.category !== filter) return false;
      if (!needle) return true;
      return (
        (c.full_name ?? "").toLowerCase().includes(needle) ||
        (c.job_title ?? "").toLowerCase().includes(needle) ||
        (c.company?.name ?? "").toLowerCase().includes(needle) ||
        (c.country ?? "").toLowerCase().includes(needle)
      );
    });
  }, [contacts, filter, q]);

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
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell className="text-muted-foreground text-center py-10" colSpan={5}>
                  No contacts match.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/contacts/${c.id}`} className="flex items-center gap-2.5 font-medium hover:text-primary">
                      <PersonAvatar name={c.full_name} size={30} />
                      {c.full_name ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[220px] truncate">
                    {c.job_title ?? "—"}
                  </TableCell>
                  <TableCell>
                    {c.company ? (
                      <Link
                        href={`/companies/${c.company.id}`}
                        className="inline-flex items-center gap-2 hover:text-primary"
                      >
                        <CategoryBadge category={c.company.category} />
                        <span className="truncate max-w-[160px]">{c.company.name}</span>
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.country ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                      {c.email ? <Mail className="h-4 w-4" /> : null}
                      {c.phone ? <Phone className="h-4 w-4" /> : null}
                      {c.linkedin_url ? <Link2 className="h-4 w-4" /> : null}
                      {!c.email && !c.phone && !c.linkedin_url ? <span className="text-xs">—</span> : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {filtered.length} of {contacts.length} contacts
      </p>
    </div>
  );
}
