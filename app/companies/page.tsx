import { listCompanies } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isCategory } from "@/lib/categories";
import { CompaniesBrowser } from "@/components/companies-browser";
import { SetupNotice } from "@/components/setup-notice";
import type { Category } from "@/lib/types";

export const metadata = { title: "Companies — LPGP Connect" };

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const initial: Category | "ALL" = isCategory(category) ? category : "ALL";
  const companies = await listCompanies();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
        <p className="text-muted-foreground mt-1">
          Every firm in the book, split across LPs, GPs and Solution Providers.
        </p>
      </div>
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <CompaniesBrowser companies={companies} initialFilter={initial} />
    </div>
  );
}
