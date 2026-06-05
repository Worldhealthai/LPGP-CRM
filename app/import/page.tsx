import { lushaConfigured } from "@/lib/lusha";
import { isAdminConfigured } from "@/lib/supabase/admin";
import { ImportTool } from "@/components/import-tool";

export const metadata = { title: "Import — LPGP Connect" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import leads from Lusha</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Search Lusha for senior finance professionals, choose a book (LP / GP / SP), and import
          the matches straight into the CRM. Companies are created automatically and de-duplicated.
        </p>
      </div>
      <ImportTool lushaReady={lushaConfigured()} adminReady={isAdminConfigured()} />
    </div>
  );
}
