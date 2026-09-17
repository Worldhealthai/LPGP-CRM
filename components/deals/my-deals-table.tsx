"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  FileWarning,
  Loader2,
  Receipt,
  RefreshCw,
  Search,
  Unlink,
  UserRound,
} from "lucide-react";
import { releaseOpsDeal, refreshMyDeal } from "@/lib/my-deal-actions";
import { AGREEMENT_LABEL, formatOpsMoney, type AgreementStatus } from "@/lib/ops-types";
import type { MyDeal } from "@/lib/my-deals";
import { AgreementBadge } from "@/components/deals/agreement-badge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { EmptyState } from "@/components/empty-state";
import { cn, timeAgo } from "@/lib/utils";

const STATUSES: AgreementStatus[] = ["need_invoice", "awaiting_signature", "signed"];

export function MyDealsTable({
  deals,
  opsPanelUrl,
}: {
  deals: MyDeal[];
  opsPanelUrl: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return deals.filter((d) => {
      if (status && d.deal.agreement_status !== status) return false;
      if (!needle) return true;
      return (
        d.deal.company.toLowerCase().includes(needle) ||
        d.deal.invoice_number.toLowerCase().includes(needle) ||
        d.deal.events.some((e) => e.event_name.toLowerCase().includes(needle))
      );
    });
  }, [deals, q, status]);

  if (!deals.length) {
    return (
      <EmptyState
        icon={<Receipt className="mx-auto h-8 w-8" />}
        title="No deals yet"
        description="Record a deal and it lands here. Deals the tracker already stamps with your initials show up automatically."
      />
    );
  }

  return (
    <section className="rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search company, invoice or event…"
            className="pl-9"
          />
        </div>
        <NativeSelect
          className="w-[190px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Paperwork status"
        >
          <option value="">All paperwork</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {AGREEMENT_LABEL[s]}
            </option>
          ))}
        </NativeSelect>
        <span className="text-xs text-muted-foreground">
          {shown.length} of {deals.length}
        </span>
      </div>

      <ul className="divide-y">
        {shown.map(({ deal, ownership, claimedAt }) => (
          <li key={deal.id} className="px-4 py-3.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {deal.company}
                  <Badge variant="outline" className="text-[10px]">
                    #{deal.id}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {deal.stage}
                  </Badge>
                  <AgreementBadge
                    status={deal.agreement_status}
                    detail={deal.agreement_file || deal.signed_file || null}
                  />
                  {ownership === "claimed" ? (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                      title="Added by you here — the tracker has someone else's initials on it"
                    >
                      <UserRound className="h-3 w-3" /> added {timeAgo(claimedAt)}
                    </span>
                  ) : null}
                </p>

                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="tabular font-medium text-foreground">
                    {formatOpsMoney(deal.amount, deal.currency)}
                  </span>
                  {deal.paid_inc_vat ? (
                    <span className="tabular text-[var(--success)]">
                      {formatOpsMoney(deal.paid_inc_vat, deal.currency)} received
                    </span>
                  ) : (
                    <span>nothing received yet</span>
                  )}
                  {deal.invoice_number ? (
                    <span className="inline-flex items-center gap-1">
                      <Receipt className="h-3 w-3" /> {deal.invoice_number}
                    </span>
                  ) : null}
                  {deal.initials ? <span>· {deal.initials}</span> : null}
                </p>

                {deal.events.length ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {deal.events.map((e) => (
                      <li
                        key={e.event_id}
                        className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1 text-[11px]"
                      >
                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{e.event_name}</span>
                        <span className="tabular text-muted-foreground">
                          {formatOpsMoney(e.allocated_amount, deal.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Not allocated to an event yet.
                  </p>
                )}

                {deal.agreement_status === "need_invoice" ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--ops-soft)] px-2.5 py-1.5 text-[11px] text-[var(--ops)]">
                    <FileWarning className="h-3.5 w-3.5 shrink-0" />
                    No agreement on file
                    {deal.invoice_agreement_sent ? " despite being marked sent" : ""} — the admin
                    needs to send one and upload it in the ops panel.
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={busyId === deal.id}
                  onClick={async () => {
                    setBusyId(deal.id);
                    await refreshMyDeal(deal.id);
                    setBusyId(null);
                    router.refresh();
                  }}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  aria-label={`Refresh deal ${deal.id}`}
                  title="Re-read from the ops panel"
                >
                  {busyId === deal.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                </button>
                {ownership !== "stamped" ? (
                  <button
                    type="button"
                    disabled={busyId === deal.id}
                    onClick={async () => {
                      setBusyId(deal.id);
                      await releaseOpsDeal(deal.id);
                      setBusyId(null);
                      router.refresh();
                    }}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    aria-label={`Remove deal ${deal.id} from my deals`}
                    title="Remove from my deals — the deal itself is untouched"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                {opsPanelUrl ? (
                  <a
                    href={opsPanelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs",
                      "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    )}
                  >
                    Ops panel <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
        {shown.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-muted-foreground">
            No deals match that filter.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
