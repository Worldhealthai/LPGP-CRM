import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Building2 } from "lucide-react";
import { getFund, getCommitmentsForFund } from "@/lib/queries";
import { formatUsd } from "@/lib/utils";
import { CategoryBadge } from "@/components/category-badge";
import { CompanyLogo } from "@/components/company-logo";

export const dynamic = "force-dynamic";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground/80">
      {children}
    </span>
  );
}

export default async function FundProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fund = await getFund(id);
  if (!fund) notFound();

  const commitments = await getCommitmentsForFund(id);
  const totalCommitted = commitments.reduce((s, c) => s + (c.amount_usd ?? 0), 0);
  const size = fund.fund_size_usd ?? fund.target_size_usd;

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-8 space-y-6">
      <Link href="/funds" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Funds
      </Link>

      {/* Header */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fund <span className="mx-1">/</span> {fund.strategy ?? "Private markets"}
        </p>
        <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2.5">
          <Layers className="h-6 w-6 text-muted-foreground" />
          {fund.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {fund.manager ? (
            <Link href={`/companies/${fund.manager.id}`} className="inline-flex items-center gap-2 rounded-md border bg-secondary px-2.5 py-1 hover:bg-accent">
              <CompanyLogo name={fund.manager.name} domain={fund.manager.domain} size={20} />
              <span className="text-sm font-medium">{fund.manager.name}</span>
              <CategoryBadge category={fund.manager.category} />
            </Link>
          ) : null}
          {fund.vintage_year ? <Chip>Vintage {fund.vintage_year}</Chip> : null}
          {fund.geography ? <Chip>{fund.geography}</Chip> : null}
          {fund.status ? <Chip>{fund.status}</Chip> : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6">
          <p className="eyebrow">Fund size</p>
          <div className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight tabular">
            {size != null ? formatUsd(size) : <span className="text-muted-foreground text-2xl">Not set</span>}
          </div>
          {fund.fund_size_usd == null && fund.target_size_usd != null ? (
            <p className="mt-1 text-sm text-muted-foreground">Target (fundraising)</p>
          ) : null}
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <p className="eyebrow">LP commitments</p>
          <div className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight tabular">
            {commitments.length}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">tracked in your book</p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <p className="eyebrow">Committed (tracked)</p>
          <div className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight tabular">
            {totalCommitted > 0 ? formatUsd(totalCommitted) : "—"}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">across known LPs</p>
        </div>
      </div>

      {/* LP commitments */}
      <section className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">LP commitments</h2>
          <span className="text-sm text-muted-foreground">({commitments.length})</span>
        </div>
        {commitments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground text-center">
            No LP commitments recorded for this fund yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-2.5">Limited Partner</th>
                <th className="text-left font-medium px-3 py-2.5">Date</th>
                <th className="text-right font-medium px-5 py-2.5">Commitment</th>
              </tr>
            </thead>
            <tbody>
              {commitments.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    {c.lp ? (
                      <Link href={`/companies/${c.lp.id}`} className="inline-flex items-center gap-2 font-medium hover:text-primary">
                        <CategoryBadge category={c.lp.category} />
                        {c.lp.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{c.commitment_date ?? "—"}</td>
                  <td className="px-5 py-3 text-right tabular font-medium">
                    {c.amount_usd != null ? formatUsd(c.amount_usd) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
