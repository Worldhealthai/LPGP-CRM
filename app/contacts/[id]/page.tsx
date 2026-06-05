import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Link2, MapPin } from "lucide-react";
import { getContact, getNotes } from "@/lib/queries";
import { CategoryBadge } from "@/components/category-badge";
import { PersonAvatar } from "@/components/person-avatar";
import { EditableField } from "@/components/editable-field";
import { NotesPanel } from "@/components/notes-panel";
import { Separator } from "@/components/ui/separator";

export default async function ContactProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  const notes = await getNotes("contact", id);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-6">
      <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Contacts
      </Link>

      {/* Header */}
      <div className="rounded-xl border bg-card p-6 flex flex-col sm:flex-row gap-5">
        <PersonAvatar name={contact.full_name} size={64} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{contact.full_name ?? "—"}</h1>
          <p className="mt-1 text-muted-foreground">{contact.job_title ?? "—"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            {contact.company ? (
              <Link href={`/companies/${contact.company.id}`} className="inline-flex items-center gap-2 hover:text-primary">
                <CategoryBadge category={contact.company.category} />
                <span className="font-medium">{contact.company.name}</span>
              </Link>
            ) : null}
            {contact.country ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {[contact.city, contact.country].filter(Boolean).join(", ")}
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-3 py-1.5 text-sm hover:bg-accent">
                <Mail className="h-4 w-4" /> {contact.email}
              </a>
            ) : null}
            {contact.phone ? (
              <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-3 py-1.5 text-sm hover:bg-accent">
                <Phone className="h-4 w-4" /> {contact.phone}
              </a>
            ) : null}
            {contact.linkedin_url ? (
              <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-3 py-1.5 text-sm hover:bg-accent">
                <Link2 className="h-4 w-4" /> LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editable details */}
        <aside className="rounded-xl border bg-card p-5 h-fit lg:order-2">
          <h2 className="font-semibold">Contact details</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Hover a field and click the pencil to edit.</p>
          <Separator className="my-3" />
          <div className="divide-y">
            <EditableField entity="contact" id={contact.id} field="first_name" value={contact.first_name} label="First name" />
            <EditableField entity="contact" id={contact.id} field="last_name" value={contact.last_name} label="Last name" />
            <EditableField entity="contact" id={contact.id} field="job_title" value={contact.job_title} label="Job title" />
            <EditableField entity="contact" id={contact.id} field="department" value={contact.department} label="Department" />
            <EditableField entity="contact" id={contact.id} field="seniority" value={contact.seniority} label="Seniority" />
            <EditableField entity="contact" id={contact.id} field="email" value={contact.email} label="Email" href={(v) => `mailto:${v}`} />
            <EditableField entity="contact" id={contact.id} field="phone" value={contact.phone} label="Phone" href={(v) => `tel:${v}`} />
            <EditableField entity="contact" id={contact.id} field="linkedin_url" value={contact.linkedin_url} label="LinkedIn" href={(v) => v} />
            <EditableField entity="contact" id={contact.id} field="city" value={contact.city} label="City" />
            <EditableField entity="contact" id={contact.id} field="country" value={contact.country} label="Country" />
          </div>
        </aside>

        {/* Notes */}
        <section className="lg:col-span-2 lg:order-1 rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Notes</h2>
          <NotesPanel entityType="contact" entityId={contact.id} notes={notes} />
        </section>
      </div>
    </div>
  );
}
