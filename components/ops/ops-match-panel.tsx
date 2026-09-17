"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, CalendarDays, Loader2, Radar, Receipt, X } from "lucide-react";
import { lookupOpsCompany } from "@/lib/ops-actions";
import { describeOpsMatch, formatOpsMoney, type OpsMatch } from "@/lib/ops-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Results carry the query they answer, so a stale answer is simply ignored. */
type Result = { query: string; matches: OpsMatch[] };

const MIN_QUERY = 2;
const DEBOUNCE_MS = 450;

/**
 * Tells someone creating a sponsor account that the company already exists as
 * a deal in the ops panel — what was contracted, which events, whether paid,
 * and who signed it.
 *
 * Purely informational: it never edits the form. The one thing it offers is
 * linking the account to the deal, which defaults on for an exact match and
 * off otherwise; the parent owns that choice and reads the match via
 * `onResult`, which fires from the fetch callback rather than an effect.
 */
export function OpsMatchPanel({
  companyName,
  linkOptIn,
  onLinkOptIn,
  onResult,
  className,
}: {
  companyName: string;
  /** null = follow the default (link when the match is exact). */
  linkOptIn?: boolean | null;
  onLinkOptIn?: (v: boolean) => void;
  onResult?: (best: OpsMatch | null) => void;
  className?: string;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [pickedCompany, setPickedCompany] = useState<string | null>(null);
  const query = companyName.trim();
  const requestSeq = useRef(0);

  useEffect(() => {
    if (query.length < MIN_QUERY) return;
    const seq = ++requestSeq.current;
    const timer = setTimeout(async () => {
      const res = await lookupOpsCompany(query);
      if (seq !== requestSeq.current) return;
      const matches = res.ok ? res.data.matches ?? [] : [];
      setResult({ query, matches });
      onResult?.(matches[0] ?? null);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, onResult]);

  const matches = result?.query === query ? result.matches : [];
  const checking = query.length >= MIN_QUERY && result?.query !== query;
  const selected = matches.find((m) => m.company === pickedCompany) ?? matches[0] ?? null;

  if (query.length < MIN_QUERY || dismissedFor === query) return null;
  if (!selected) {
    return checking ? (
      <p className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Loader2 className="h-3 w-3 animate-spin" /> Checking the ops panel…
      </p>
    ) : null;
  }

  const others = matches.filter((m) => m.company !== selected.company);
  const linkEffective = linkOptIn ?? selected.exact;
  const signers = [
    ...new Set(
      selected.deals
        .filter((d) => !d.cancelled && d.initials.trim())
        .map((d) => d.initials.trim().toUpperCase()),
    ),
  ];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--ops)]/40 bg-[var(--ops-soft)]/60",
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-[var(--ops)]" aria-hidden />
      <div className="px-4 py-3.5 pl-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--ops)]/15 text-[var(--ops)]">
            <Radar className="h-4.5 w-4.5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-semibold">Already in the ops panel</p>
              <Badge variant="outline" className="border-[var(--ops)]/40 text-[10px]">
                {selected.exact ? "Exact match" : `${Math.round(selected.confidence * 100)}% match`}
              </Badge>
              {selected.has_payment ? (
                <Badge className="border-transparent bg-[var(--success-soft)] text-[10px] text-[var(--success)]">
                  <BadgeCheck className="h-3 w-3" /> Paid
                </Badge>
              ) : null}
            </div>

            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{selected.company}</span> is tracked as{" "}
              {selected.deal_count === 1 ? "a deal" : `${selected.deal_count} deals`} —{" "}
              {describeOpsMatch(selected)}.
              {signers.length ? (
                <>
                  {" "}
                  Signed by <span className="font-medium text-foreground">{signers.join(", ")}</span>.
                </>
              ) : null}
            </p>

            {selected.events.length ? (
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {selected.events.map((ev) => (
                  <li
                    key={ev.event_id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ops)]/30 bg-card/70 px-2 py-1 text-[11px]"
                  >
                    <CalendarDays className="h-3 w-3 text-[var(--ops)]" />
                    <span className="font-medium">{ev.event_name}</span>
                    <span className="tabular text-muted-foreground">
                      {formatOpsMoney(ev.allocated_amount, ev.currency)}
                    </span>
                    {ev.package_labels.length ? (
                      <span className="text-muted-foreground">· {ev.package_labels.join(", ")}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {selected.deals[0]?.invoice_number ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Receipt className="h-3 w-3" />
                Invoice {selected.deals[0].invoice_number}
                {selected.deals[0].paid_date ? ` · paid ${selected.deals[0].paid_date}` : null}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {onLinkOptIn ? (
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={linkEffective}
                    onChange={(e) => onLinkOptIn(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[var(--primary)]"
                  />
                  Link this account to the ops-panel deal
                </label>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setDismissedFor(query);
                  onLinkOptIn?.(false);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Not the same company
              </button>
            </div>

            {others.length ? (
              <div className="mt-3 border-t border-[var(--ops)]/25 pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Other possible matches
                </p>
                <ul className="mt-1 space-y-0.5">
                  {others.map((m) => (
                    <li key={m.company}>
                      <button
                        type="button"
                        onClick={() => {
                          setPickedCompany(m.company);
                          onResult?.(m);
                        }}
                        className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[12px] hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <span className="font-medium">{m.company}</span>
                        <span className="text-muted-foreground">
                          · {m.event_count} event{m.event_count === 1 ? "" : "s"}
                        </span>
                        <span className="ml-auto tabular text-[10px] text-muted-foreground">
                          {Math.round(m.confidence * 100)}%
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
