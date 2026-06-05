import { listContacts } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ContactsBrowser } from "@/components/contacts-browser";
import { SetupNotice } from "@/components/setup-notice";

export const metadata = { title: "Contacts — LPGP Connect" };

export default async function ContactsPage() {
  const contacts = await listContacts();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground mt-1">
          Senior decision-makers across every firm in the book.
        </p>
      </div>
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <ContactsBrowser contacts={contacts} />
    </div>
  );
}
