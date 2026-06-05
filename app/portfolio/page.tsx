import Link from "next/link";
import { Star } from "lucide-react";
import { listPortfolioCompanies } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { CompaniesBrowser } from "@/components/companies-browser";
import { SetupNotice } from "@/components/setup-notice";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Portfolio — LPGP Connect" };

export default async function PortfolioPage() {
  const companies = await listPortfolioCompanies();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground mt-1">
          The firms you&apos;re actively tracking — added with{" "}
          <span className="font-medium text-foreground">Add to Portfolio</span> on any company.
        </p>
      </div>

      {!isSupabaseConfigured() ? <SetupNotice /> : null}

      {companies.length === 0 ? (
        <EmptyState
          icon={<Star className="h-6 w-6" />}
          title="No firms in your portfolio yet"
          description="Open any company profile and click “Add to Portfolio” to pin it here for quick access and reporting."
          action={
            <Button asChild>
              <Link href="/companies">Browse companies</Link>
            </Button>
          }
        />
      ) : (
        <CompaniesBrowser companies={companies} />
      )}
    </div>
  );
}
