import { FileSpreadsheet, Plug } from "lucide-react";
import { lushaConfigured } from "@/lib/lusha";
import { isAdminConfigured } from "@/lib/supabase/admin";
import { ExcelUpload } from "@/components/excel-upload";
import { ImportTool } from "@/components/import-tool";

export const metadata = { title: "Import — LPGP Connect" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import data</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Bring your existing book into the CRM from a spreadsheet. Companies are created and
          de-duplicated automatically; re-uploading updates matching people instead of duplicating
          them.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Upload Excel / CSV</h2>
        </div>
        <ExcelUpload adminReady={isAdminConfigured()} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Pull from Lusha</h2>
          <span className="rounded-md border bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            optional
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Already wired up — add a <code className="font-mono text-xs">LUSHA_API_KEY</code> to enrich
          and pull fresh leads by job title, country and firm.
        </p>
        <ImportTool lushaReady={lushaConfigured()} adminReady={isAdminConfigured()} />
      </section>
    </div>
  );
}
