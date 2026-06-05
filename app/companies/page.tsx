import { Download } from "lucide-react";
import { listCompanies } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isCategory } from "@/lib/categories";
import { CompaniesBrowser } from "@/components/companies-browser";
import { SetupNotice } from "@/components/setup-notice";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";

export const metadata = { title: "Companies — LPGP Connect" };
export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const initial: Category | "ALL" = isCategory(category) ? category : "ALL";
  const companies = await listCompanies();
  const exportHref = isCategory(category)
    ? `/api/export/companies?category=${category}`
    : "/api/export/companies";

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Companies"
        description="Every firm in the book, split across LPs, GPs and Solution Providers."
        actions={
          companies.length > 0 ? (
            <Button asChild variant="outline">
              <a href={exportHref} download>
                <Download className="h-4 w-4" /> Export CSV
              </a>
            </Button>
          ) : null
        }
      />
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <CompaniesBrowser companies={companies} initialFilter={initial} />
    </div>
  );
}
