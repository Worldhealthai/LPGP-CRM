import { Download } from "lucide-react";
import { listContacts } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ContactsBrowser } from "@/components/contacts-browser";
import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Contacts — LPGP Connect" };

export default async function ContactsPage() {
  const contacts = await listContacts();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Senior decision-makers across every firm in the book.
          </p>
        </div>
        {contacts.length > 0 ? (
          <Button asChild variant="outline">
            <a href="/api/export/contacts" download>
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </Button>
        ) : null}
      </div>
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <ContactsBrowser contacts={contacts} />
    </div>
  );
}
