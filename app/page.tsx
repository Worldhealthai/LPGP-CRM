import Link from "next/link";
import { ArrowRight, Building2, Users, Upload } from "lucide-react";
import { getCategoryCounts, getContactCount } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { StatCard } from "@/components/stat-card";
import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  const [counts, contactCount] = await Promise.all([getCategoryCounts(), getContactCount()]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow">LPGP Connect</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            Relationship intelligence for private markets
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            One book for the people and firms that matter — limited partners, fund managers and the
            providers that serve them.
          </p>
        </div>
        <Button asChild>
          <Link href="/import">
            <Upload className="h-4 w-4" /> Import leads
          </Link>
        </Button>
      </div>

      {!configured ? <SetupNotice /> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="All firms" value={counts.total} sublabel="companies tracked" href="/companies" />
        {CATEGORY_ORDER.map((k) => (
          <StatCard
            key={k}
            label={CATEGORIES[k].name}
            value={counts[k]}
            sublabel={CATEGORIES[k].label}
            href={`/companies?category=${k}`}
            dot={CATEGORIES[k].dot}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ORDER.map((k) => {
          const meta = CATEGORIES[k];
          return (
            <Link
              key={k}
              href={`/companies?category=${k}`}
              className="lift rounded-xl border bg-card p-5 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${meta.accent}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {meta.singular}
                </span>
                <span className="tabular text-2xl font-semibold">{counts[k]}</span>
              </div>
              <h3 className="mt-3 font-semibold">{meta.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground flex-1">{meta.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">
                View book <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/companies" className="lift rounded-xl border bg-card p-5 flex items-center gap-4">
          <span className="grid place-items-center h-11 w-11 rounded-lg bg-accent text-accent-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="font-semibold">Companies</h3>
            <p className="text-sm text-muted-foreground">{counts.total} firm profiles</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link href="/contacts" className="lift rounded-xl border bg-card p-5 flex items-center gap-4">
          <span className="grid place-items-center h-11 w-11 rounded-lg bg-accent text-accent-foreground">
            <Users className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="font-semibold">Contacts</h3>
            <p className="text-sm text-muted-foreground">{contactCount} people</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
