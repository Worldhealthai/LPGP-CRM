import { BadgeCheck, Clock, FileWarning, Radar, Receipt } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getMyDeals } from "@/lib/my-deals";
import { isOpsConfigured, isOpsWriteEnabled, opsPanelUrl } from "@/lib/ops";
import { formatOpsMoney } from "@/lib/ops-types";
import { MyDealsTable } from "@/components/deals/my-deals-table";
import { RecordDealDialog } from "@/components/ops/record-deal-dialog";
import { Kpi } from "@/components/dashboard/panels";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";
export const metadata = { title: "My deals — LPGP Connect" };

export default async function MyDealsPage() {
  const user = await getSessionUser();
  const { deals, initials, needInvoice, awaitingSignature, totals, error } = user
    ? await getMyDeals(user.id)
    : {
        deals: [],
        initials: null,
        needInvoice: 0,
        awaitingSignature: 0,
        totals: [],
        error: null as string | null,
      };

  // The first currency is the headline; the rest are listed rather than added
  // to it, because summing GBP and USD into one figure would be a lie.
  const primary = totals[0];

  return (
    <div className="mx-auto max-w-[95rem] space-y-6 px-4 py-8 md:px-6">
      <PageHeader
        eyebrow="Sales CRM"
        title="My deals"
        description="Your deals as the ops panel holds them — nothing is copied here. Adding one checks the tracker first, so the same business never gets entered twice."
        actions={isOpsWriteEnabled() ? <RecordDealDialog /> : null}
      />

      {!isOpsConfigured() || error ? (
        <EmptyState
          icon={<Radar className="mx-auto h-8 w-8" />}
          title="Not reading the ops panel"
          description={error ?? "Connect the ops panel in Settings to see your deals."}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="My deals"
              value={String(deals.length)}
              sub={
                initials
                  ? `Stamped ${initials} in the tracker, plus any you've added`
                  : "Set your initials in Admin → Team to pick these up automatically"
              }
              tone="brand"
              icon={<Receipt className="h-4 w-4" />}
            />
            <Kpi
              label="Contracted"
              value={primary ? formatOpsMoney(primary.contracted, primary.currency) : "—"}
              sub={
                totals.length > 1
                  ? `plus ${totals
                      .slice(1)
                      .map((t) => formatOpsMoney(t.contracted, t.currency))
                      .join(", ")}`
                  : primary
                    ? `${formatOpsMoney(primary.paid, primary.currency)} received`
                    : "Nothing yet"
              }
              tone="neutral"
            />
            <Kpi
              label="Need an invoice"
              value={String(needInvoice)}
              sub={
                needInvoice
                  ? "No agreement on file — the admin has to send one"
                  : "Every deal has its agreement filed"
              }
              tone="ops"
              icon={<FileWarning className="h-4 w-4" />}
            />
            <Kpi
              label="Awaiting signature"
              value={String(awaitingSignature)}
              sub={awaitingSignature ? "Sent, waiting on the signed copy" : "Nothing outstanding"}
              tone="success"
              icon={
                awaitingSignature ? <Clock className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />
              }
            />
          </div>

          <MyDealsTable deals={deals} opsPanelUrl={opsPanelUrl()} />
        </>
      )}
    </div>
  );
}
