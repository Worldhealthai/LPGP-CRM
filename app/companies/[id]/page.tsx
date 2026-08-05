import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Link2, MapPin, Users, PieChart, Layers, Briefcase } from "lucide-react";
import {
  getCompany,
  getContactsForCompany,
  getFundsForCompany,
  getCommitmentsForLp,
  getProvidersForClient,
  getClientsForProvider,
  getNotes,
} from "@/lib/queries";
import { CATEGORIES } from "@/lib/categories";
import { formatAumLong, formatUsd } from "@/lib/utils";
import { CategoryBadge } from "@/components/category-badge";
import { CompanyLogo } from "@/components/company-logo";
import { PersonAvatar } from "@/components/person-avatar";
import { EditableField } from "@/components/editable-field";
import { NotesPanel } from "@/components/notes-panel";
import { PortfolioButton } from "@/components/portfolio-button";
import { ReportButton } from "@/components/report-button";
import { AllocationEditor } from "@/components/allocation-editor";
import { DeleteButton } from "@/components/delete-button";
import { AddToPipelineButton } from "@/components/add-to-pipeline-button";
import { Donut, allocationShade } from "@/components/charts/donut";
import { AllocationBars } from "@/components/charts/allocation-bars";
import { Separator } from "@/components/ui/separator";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground/80">
      {children}
    </span>
  );
}

export default async function CompanyProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const [contacts, funds, commitments, providers, clients, notes] = await Promise.all([
    getContactsForCompany(id),
    getFundsForCompany(id),
    company.category === "LP" ? getCommitmentsForLp(id) : Promise.resolve([]),
    company.category === "SP" ? Promise.resolve([]) : getProvidersForClient(id),
    company.category === "SP" ? getClientsForProvider(id) : Promise.resolve([]),
    getNotes("company", id),
  ]);
  const meta = CATEGORIES[company.category];
  const allocations = Array.isArray(company.allocations) ? company.allocations : [];
  const aum = formatAumLong(company.aum_usd) ?? company.aum;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-6">
      <Link
        href="/companies"
        data-no-print
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Companies
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4 min-w-0">
          <CompanyLogo name={company.name} domain={company.domain} size={56} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Directory <span className="mx-1">/</span> {company.name}
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">{company.name}</h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <CategoryBadge category={company.category} showName />
              {company.sub_type ? <Chip>{company.sub_type}</Chip> : null}
              {company.region ? (
                <Chip>
                  <MapPin className="h-3 w-3" /> {company.region}
                </Chip>
              ) : null}
              {company.status ? (
                <Chip>
                  <PieChart className="h-3 w-3" /> {company.status}
                </Chip>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0" data-no-print>
          <AddToPipelineButton companyId={company.id} />
          <ReportButton />
          <PortfolioButton id={company.id} initial={company.in_portfolio} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 flex flex-col justify-center">
          <p className="eyebrow">Total AUM</p>
          <div className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight tabular">
            {aum ?? <span className="text-muted-foreground text-2xl">Not set</span>}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <p className="eyebrow">Total asset allocation</p>
          <div className="mt-3 flex items-center gap-5">
            <Donut data={allocations} size={120} thickness={18} />
            {allocations.length ? (
              <ul className="space-y-1.5 text-sm min-w-0">
                {allocations.map((a, i) => (
                  <li key={`${a.label}-${i}`} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-[3px] shrink-0" style={{ background: allocationShade(i) }} />
                    <span className="truncate text-foreground/80">{a.label}</span>
                    <span className="ml-auto tabular font-medium">{Math.round(a.value)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Set the allocation below to populate this chart.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 flex flex-col justify-center">
          <p className="eyebrow">Active funds</p>
          <div className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight tabular">
            {company.active_funds ?? 0}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Core GP relationships</p>
        </div>
      </div>

      {/* Thesis + breakdown */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border bg-secondary p-6">
          <h2 className="text-lg font-semibold">Investment Thesis Summary</h2>
          {company.investment_thesis ? (
            <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{company.investment_thesis}</p>
          ) : null}
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="eyebrow">Typical check size</p>
              <p className="mt-1.5 font-semibold">{company.check_size ?? "—"}</p>
            </div>
            <div>
              <p className="eyebrow">Preferred stages</p>
              <p className="mt-1.5 font-semibold">{company.preferred_stages ?? "—"}</p>
            </div>
            <div>
              <p className="eyebrow">Geographic focus</p>
              <p className="mt-1.5 font-semibold">{company.geographic_focus ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <p className="eyebrow mb-4">Asset allocation breakdown</p>
          <AllocationBars data={allocations} />
        </div>
      </div>

      {/* Funds */}
      {funds.length > 0 ? (
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Funds</h2>
            <span className="text-sm text-muted-foreground">({funds.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-5 py-2">Fund</th>
                  <th className="text-left font-medium px-3 py-2">Strategy</th>
                  <th className="text-left font-medium px-3 py-2">Vintage</th>
                  <th className="text-right font-medium px-3 py-2">Size</th>
                  <th className="text-left font-medium px-5 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((f) => (
                  <tr key={f.id} className="border-t">
                    <td className="px-5 py-2.5 font-medium">{f.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{f.strategy ?? "—"}</td>
                    <td className="px-3 py-2.5 tabular">{f.vintage_year ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right tabular whitespace-nowrap">
                      {f.fund_size_usd != null
                        ? formatUsd(f.fund_size_usd)
                        : f.target_size_usd != null
                          ? `${formatUsd(f.target_size_usd)} target`
                          : "—"}
                    </td>
                    <td className="px-5 py-2.5">
                      {f.status ? (
                        <span className="inline-flex items-center rounded-md border bg-secondary px-2 py-0.5 text-xs">
                          {f.status}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Fund commitments (LPs) */}
      {commitments.length > 0 ? (
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Fund commitments</h2>
            <span className="text-sm text-muted-foreground">({commitments.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-5 py-2">Fund</th>
                  <th className="text-left font-medium px-3 py-2">Manager</th>
                  <th className="text-left font-medium px-3 py-2">Date</th>
                  <th className="text-right font-medium px-5 py-2">Commitment</th>
                </tr>
              </thead>
              <tbody>
                {commitments.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-2.5 font-medium">
                      {c.fund ? (
                        <Link href={`/funds/${c.fund.id}`} className="hover:text-primary">{c.fund.name}</Link>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {c.fund?.manager ? (
                        <Link href={`/companies/${c.fund.manager.id}`} className="hover:text-primary">
                          {c.fund.manager.name}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.commitment_date ?? "—"}</td>
                    <td className="px-5 py-2.5 text-right tabular font-medium">
                      {c.amount_usd != null ? formatUsd(c.amount_usd) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Service providers (GP / LP) */}
      {providers.length > 0 ? (
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Service providers</h2>
            <span className="text-sm text-muted-foreground">({providers.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-5 py-2">Provider</th>
                  <th className="text-left font-medium px-3 py-2">Type</th>
                  <th className="text-left font-medium px-5 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-2.5">
                      {p.provider ? (
                        <Link href={`/companies/${p.provider.id}`} className="inline-flex items-center gap-2 font-medium hover:text-primary">
                          <CompanyLogo name={p.provider.name} domain={p.provider.domain} size={24} />
                          {p.provider.name}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.provider?.sub_type ?? "—"}</td>
                    <td className="px-5 py-2.5">
                      <span className="inline-flex items-center rounded-md border bg-secondary px-2 py-0.5 text-xs">
                        {p.role ?? "Provider"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Clients (SP) */}
      {clients.length > 0 ? (
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Clients</h2>
            <span className="text-sm text-muted-foreground">({clients.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-5 py-2">Client</th>
                  <th className="text-left font-medium px-5 py-2">Engaged as</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((cl) => (
                  <tr key={cl.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-2.5">
                      {cl.client ? (
                        <Link href={`/companies/${cl.client.id}`} className="inline-flex items-center gap-2 font-medium hover:text-primary">
                          <CompanyLogo name={cl.client.name} domain={cl.client.domain} size={24} />
                          <CategoryBadge category={cl.client.category} />
                          {cl.client.name}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="inline-flex items-center rounded-md border bg-secondary px-2 py-0.5 text-xs">
                        {cl.role ?? "Provider"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* People */}
      <section className="rounded-xl border bg-card">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">People</h2>
          <span className="text-sm text-muted-foreground">({contacts.length})</span>
        </div>
        {contacts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground text-center">
            No contacts yet. Use the Import tab to add people.
          </p>
        ) : (
          <ul className="divide-y">
            {contacts.map((c) => (
              <li key={c.id}>
                <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40">
                  <PersonAvatar name={c.full_name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{c.full_name ?? "—"}</div>
                    <div className="text-sm text-muted-foreground truncate">{c.job_title ?? "—"}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.country ?? ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Editable data + notes */}
      <div className="grid gap-6 lg:grid-cols-3" data-no-print>
        <aside className="rounded-xl border bg-card p-5 h-fit space-y-5">
          <div>
            <h2 className="font-semibold">Investment profile</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Drives the charts above. Hover a field to edit.</p>
            <Separator className="my-3" />
            <div className="divide-y">
              <EditableField entity="company" id={company.id} field="aum_usd" value={company.aum_usd?.toString()} label="Total AUM (USD)" placeholder="e.g. 415900000" />
              <EditableField entity="company" id={company.id} field="active_funds" value={company.active_funds?.toString()} label="Active funds" placeholder="e.g. 12" />
              <EditableField entity="company" id={company.id} field="check_size" value={company.check_size} label="Typical check size" placeholder="e.g. $5M – $20M" />
              <EditableField entity="company" id={company.id} field="preferred_stages" value={company.preferred_stages} label="Preferred stages" placeholder="e.g. Growth, Buyout" />
              <EditableField entity="company" id={company.id} field="geographic_focus" value={company.geographic_focus} label="Geographic focus" placeholder="e.g. Global (NAM, EMEA, APAC)" />
              <EditableField entity="company" id={company.id} field="investment_thesis" value={company.investment_thesis} label="Investment thesis" multiline placeholder="One-paragraph summary of how this firm allocates." />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Asset allocation</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Percentages drive the donut and the breakdown bars.</p>
            <AllocationEditor id={company.id} initial={allocations} />
          </div>

          <div>
            <h3 className="text-sm font-semibold">Firm details</h3>
            <Separator className="my-3" />
            <div className="divide-y">
              <EditableField entity="company" id={company.id} field="sub_type" value={company.sub_type} label="Type" placeholder={meta.subTypes[0]} />
              <EditableField entity="company" id={company.id} field="status" value={company.status} label="Status" placeholder="e.g. Active Allocator" />
              <EditableField entity="company" id={company.id} field="region" value={company.region} label="Region" placeholder="e.g. Brazil / Latin America & Caribbean" />
              <EditableField entity="company" id={company.id} field="website" value={company.website} label="Website" link="url" />
              <EditableField entity="company" id={company.id} field="domain" value={company.domain} label="Domain" />
              <EditableField entity="company" id={company.id} field="linkedin_url" value={company.linkedin_url} label="LinkedIn" link="url" />
              <EditableField entity="company" id={company.id} field="country" value={company.country} label="Country" />
              <EditableField entity="company" id={company.id} field="city" value={company.city} label="City" />
              <EditableField entity="company" id={company.id} field="hq_location" value={company.hq_location} label="HQ" />
              <EditableField entity="company" id={company.id} field="employee_range" value={company.employee_range} label="Employees" placeholder="e.g. 1,001–5,000" />
              <EditableField entity="company" id={company.id} field="description" value={company.description} label="Description" multiline placeholder="What does this firm do?" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              Removes this company and all of its contacts.
            </p>
            <DeleteButton kind="company" id={company.id} />
          </div>
        </aside>

        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">
                  <Globe className="h-4 w-4" /> Website
                </a>
              ) : null}
              {company.linkedin_url ? (
                <a href={company.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">
                  <Link2 className="h-4 w-4" /> LinkedIn
                </a>
              ) : null}
              {company.hq_location || company.country ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {[company.city, company.country].filter(Boolean).join(", ") || company.hq_location}
                </span>
              ) : null}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3">Notes</h2>
            <NotesPanel entityType="company" entityId={company.id} notes={notes} />
          </div>
        </section>
      </div>
    </div>
  );
}
