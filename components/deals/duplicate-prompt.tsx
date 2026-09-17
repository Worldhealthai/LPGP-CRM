"use client";

import { CalendarDays, CheckCircle2, Loader2, Plus, Receipt, Search } from "lucide-react";
import type { DuplicateReport } from "@/lib/deal-duplicates";
import { formatOpsMoney } from "@/lib/ops-types";
import { AgreementBadge } from "@/components/deals/agreement-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "A deal like that already exists — is it this one?"
 *
 * Shown after someone fills in a deal but before it's created, whenever the
 * tracker holds something that looks like the same business. Answering yes
 * adopts the existing deal; answering no creates a new one. Both are explicit
 * buttons — nothing is decided for them.
 */
export function DuplicatePrompt({
  report,
  busy,
  onAdopt,
  onCreateAnyway,
  onBack,
}: {
  report: DuplicateReport;
  busy: boolean;
  onAdopt: (dealId: number) => void;
  onCreateAnyway: () => void;
  onBack: () => void;
}) {
  const { candidates } = report;
  const multiple = candidates.length > 1;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[var(--ops)]/40 bg-[var(--ops-soft)]/60 px-4 py-3">
        <Search className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ops)]" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {multiple
              ? `${candidates.length} deals like this already exist in the ops panel`
              : "A deal like this already exists in the ops panel"}
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {multiple ? "Is it one of these?" : "Is it this one?"} Picking it adds that deal to your
            deals instead of creating a second one.
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {candidates.map((c) => (
          <li key={c.deal.id} className="rounded-xl border bg-card p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {c.deal.company}
                  <Badge variant="outline" className="text-[10px]">
                    #{c.deal.id}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {c.deal.stage}
                  </Badge>
                  <AgreementBadge
                    status={c.deal.agreement_status}
                    detail={c.deal.agreement_file || null}
                  />
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="tabular font-medium text-foreground">
                    {formatOpsMoney(c.deal.amount, c.deal.currency)}
                  </span>
                  {c.deal.paid_inc_vat ? (
                    <span className="tabular">
                      {formatOpsMoney(c.deal.paid_inc_vat, c.deal.currency)} received
                    </span>
                  ) : null}
                  {c.deal.invoice_number ? (
                    <span className="inline-flex items-center gap-1">
                      <Receipt className="h-3 w-3" /> {c.deal.invoice_number}
                    </span>
                  ) : null}
                  {c.deal.initials ? <span>{c.deal.initials}</span> : null}
                </p>
              </div>
              <span className="tabular shrink-0 text-[11px] text-muted-foreground">
                {Math.round(c.score * 100)}% match
              </span>
            </div>

            {c.deal.events.length ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {c.deal.events.map((e) => {
                  const shared = c.sharedEvents.some((s) => s.event_id === e.event_id);
                  return (
                    <li
                      key={e.event_id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]",
                        shared
                          ? "border-[var(--brand)]/40 bg-[var(--accent)]"
                          : "bg-background text-muted-foreground",
                      )}
                    >
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      <span className="font-medium">{e.event_name}</span>
                      <span className="tabular">
                        {formatOpsMoney(e.allocated_amount, c.deal.currency)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {/* Why we're asking — so the decision isn't a guess */}
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
              {c.reasons.map((r) => (
                <li key={r} className="text-[11px] text-muted-foreground">
                  · {r}
                </li>
              ))}
            </ul>

            <Button
              size="sm"
              className="mt-3"
              disabled={busy}
              onClick={() => onAdopt(c.deal.id)}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Yes — this is it
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
        <Button variant="outline" disabled={busy} onClick={onCreateAnyway}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          No — create a new deal
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onBack}>
          Back to the form
        </Button>
      </div>
    </div>
  );
}
