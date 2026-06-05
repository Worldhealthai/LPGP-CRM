import { listFunds } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { FundsBrowser } from "@/components/funds-browser";
import { SetupNotice } from "@/components/setup-notice";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Funds — LPGP Connect" };
export const dynamic = "force-dynamic";

export default async function FundsPage() {
  const funds = await listFunds();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-6">
      <PageHeader
        eyebrow="Deal data"
        title="Funds"
        description="Flagship vehicles raised by the managers in your book, with size, strategy and vintage."
      />
      {!isSupabaseConfigured() ? <SetupNotice /> : null}
      <FundsBrowser funds={funds} />
    </div>
  );
}
