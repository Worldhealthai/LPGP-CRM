import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Link2, MapPin, Users } from "lucide-react";
import { getCompany, getContactsForCompany, getNotes } from "@/lib/queries";
import { CATEGORIES } from "@/lib/categories";
import { CategoryBadge } from "@/components/category-badge";
import { CompanyLogo } from "@/components/company-logo";
import { PersonAvatar } from "@/components/person-avatar";
import { EditableField } from "@/components/editable-field";
import { NotesPanel } from "@/components/notes-panel";
import { Separator } from "@/components/ui/separator";

export default async function CompanyProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const [contacts, notes] = await Promise.all([
    getContactsForCompany(id),
    getNotes("company", id),
  ]);
  const meta = CATEGORIES[company.category];

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-6">
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Companies
      </Link>

      {/* Header card */}
      <div className="rounded-xl border bg-card p-6 flex flex-col sm:flex-row gap-5">
        <CompanyLogo name={company.name} domain={company.domain} size={64} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
            <CategoryBadge category={company.category} showName />
          </div>
          <p className="mt-1 text-muted-foreground">{company.sub_type ?? meta.name}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            {company.hq_location || company.country ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {[company.city, company.country].filter(Boolean).join(", ") || company.hq_location}
              </span>
            ) : null}
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
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {contacts.length} contact{contacts.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details + notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* People */}
          <section className="rounded-xl border bg-card">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">People</h2>
            </div>
            {contacts.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">
                No contacts yet. Use the Import tab to pull people from Lusha.
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

          {/* Notes */}
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3">Notes</h2>
            <NotesPanel entityType="company" entityId={company.id} notes={notes} />
          </section>
        </div>

        {/* Right: editable firmographics */}
        <aside className="rounded-xl border bg-card p-5 h-fit">
          <h2 className="font-semibold">Firm details</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Hover a field and click the pencil to edit.</p>
          <Separator className="my-3" />
          <div className="divide-y">
            <EditableField entity="company" id={company.id} field="sub_type" value={company.sub_type} label="Type" placeholder={meta.subTypes[0]} />
            <EditableField entity="company" id={company.id} field="website" value={company.website} label="Website" href={(v) => v} />
            <EditableField entity="company" id={company.id} field="domain" value={company.domain} label="Domain" />
            <EditableField entity="company" id={company.id} field="linkedin_url" value={company.linkedin_url} label="LinkedIn" href={(v) => v} />
            <EditableField entity="company" id={company.id} field="country" value={company.country} label="Country" />
            <EditableField entity="company" id={company.id} field="city" value={company.city} label="City" />
            <EditableField entity="company" id={company.id} field="hq_location" value={company.hq_location} label="HQ" />
            <EditableField entity="company" id={company.id} field="employee_range" value={company.employee_range} label="Employees" placeholder="e.g. 1,001–5,000" />
            <EditableField entity="company" id={company.id} field="aum" value={company.aum} label="AUM" placeholder="e.g. $500B" />
            <EditableField entity="company" id={company.id} field="description" value={company.description} label="Description" multiline placeholder="What does this firm do?" />
          </div>
        </aside>
      </div>
    </div>
  );
}
