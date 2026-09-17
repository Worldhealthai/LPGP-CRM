"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Link2,
  Loader2,
  Radar,
  Receipt,
  X,
} from "lucide-react";
import { lookupOpsCompany } from "@/lib/ops-actions";
import {
  describeOpsMatch,
  formatOpsMoney,
  type OpsMatch,
} from "@/lib/ops-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "idle" | "checking" | "none" | "found" | "error";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 450;

/**
 * Watches a company-name field and, when the name already exists as a deal in
 * the ops panel, surfaces it: how much was contracted, which events the money
 * was allocated to, and whether it's been paid.
 *
 * `onAdopt` is how the parent form pre-fills itself; `onPendingLink` tells the
 * parent which ops company to link once the record is actually saved.
 */
export function OpsMatchPanel({
  companyName,
  onAdopt,
  onPendingLink,
  className,
}: {
  companyName: string;
  onAdopt?: (match: OpsMatch) => void;
  onPendingLink?: (match: OpsMatch | null) => void;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [matches, setMatches] = useState<OpsMatch[]>([]);
  const [selected, setSelected] = useState<OpsMatch | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [adopted, setAdopted] = useState(false);

  // Guards against a slow lookup for an old name overwriting a newer one.
  const requestSeq = useRef(0);
  const query = companyName.trim();

  const notifyLink = useCallback(
    (match: OpsMatch | null) => onPendingLink?.(match),
    [onPendingLink],
  );

  useEffect(() => {
    if (query.length < MIN_QUERY) {
      setStatus("idle");
      setMatches([]);
      setSelected(null);
      setAdopted(false);
      notifyLink(null);
      return;
    }

    // A fresh name means the previous verdict no longer applies.
    setDismissed(false);
    setAdopted(false);
    notifyLink(null);

    const seq = ++requestSeq.current;
    const timer = setTimeout(async () => {
      setStatus("checking");
      const res = await lookupOpsCompany(query);
      if (seq !== requestSeq.current) return; // superseded

      if (!res.ok) {
        // Not configured is the normal state before the bridge is wired up —
        // stay silent rather than nagging on every keystroke.
        setStatus(res.configured ? "error" : "idle");
        setMatches([]);
        return;
      }
      const found = res.data.matches ?? [];
      setMatches(found);
      setSelected(found[0] ?? null);
      setStatus(found.length ? "found" : "none");
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, notifyLink]);

  if (dismissed || status === "idle" || status === "none" || status === "error") {
    return status === "checking" ? <CheckingRow className={className} /> : null;
  }
  if (status === "checking") return <CheckingRow className={className} />;
  if (!selected) return null;

  const others = matches.filter((m) => m.company !== selected.company);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-amber-500/40 bg-amber-500/[0.06]",
        "dark:border-amber-400/30 dark:bg-amber-400/[0.07]",
        className,
      )}
    >
      {/* Attention stripe */}
      <span className="absolute inset-y-0 left-0 w-1 bg-amber-500 dark:bg-amber-400" />

      <div className="px-4 py-3.5 pl-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <Radar className="h-4.5 w-4.5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Already in the ops panel
              </p>
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-800 dark:text-amber-200"
              >
                {selected.exact ? "Exact match" : `${Math.round(selected.confidence * 100)}% match`}
              </Badge>
              {selected.has_payment ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300"
                >
                  <BadgeCheck className="h-3 w-3" /> Paid
                </Badge>
              ) : null}
            </div>

            <p className="mt-1 text-[13px] leading-relaxed text-amber-900/85 dark:text-amber-100/80">
              <span className="font-semibold">{selected.company}</span> is already tracked as{" "}
              {selected.deal_count === 1 ? "a deal" : `${selected.deal_count} deals`} in the ops
              panel — {describeOpsMatch(selected)}.
            </p>

            {/* Event allocations — the thing the notice exists to show */}
            {selected.events.length ? (
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {selected.events.map((ev) => (
                  <li
                    key={ev.event_id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-card/70 px-2 py-1 text-[11px]"
                  >
                    <CalendarDays className="h-3 w-3 text-amber-600 dark:text-amber-400" />
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
            ) : (
              <p className="mt-2 text-[12px] text-muted-foreground">
                No event allocation recorded against it yet.
              </p>
            )}

            {/* Invoice line */}
            {selected.deals[0]?.invoice_number ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Receipt className="h-3 w-3" />
                Invoice {selected.deals[0].invoice_number}
                {selected.deals[0].paid_date ? ` · paid ${selected.deals[0].paid_date}` : null}
              </p>
            ) : null}

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onAdopt?.(selected);
                  notifyLink(selected);
                  setAdopted(true);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  adopted
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950",
                )}
              >
                {adopted ? (
                  <>
                    <BadgeCheck className="h-3.5 w-3.5" /> Will link on save
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" /> Use this deal
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDismissed(true);
                  notifyLink(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              >
                <X className="h-3.5 w-3.5" /> Different company
              </button>
            </div>

            {/* Other candidates */}
            {others.length ? (
              <div className="mt-3 border-t border-amber-500/20 pt-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Other possible matches
                </p>
                <ul className="mt-1 space-y-0.5">
                  {others.map((m) => (
                    <li key={m.company}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(m);
                          setAdopted(false);
                          notifyLink(null);
                        }}
                        className="group flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[12px] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
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

function CheckingRow({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      Checking the ops panel…
    </p>
  );
}
