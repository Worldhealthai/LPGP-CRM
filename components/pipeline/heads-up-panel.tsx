"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Radar,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { checkPipelineConflicts } from "@/lib/pipeline-conflict-actions";
import { formatOpsMoney, OPS_SIGNED_CONFIDENCE } from "@/lib/ops-types";
import type { LeadEvent, PipelineConflicts } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EventChips } from "@/components/pipeline/event-chips";
import { cn, initials, timeAgo } from "@/lib/utils";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 450;

/**
 * The heads-up shown while someone adds a company to their pipeline.
 *
 * It answers "is anyone already on this?" — a teammate's lead, or a deal the
 * ops panel already holds — and for which events. It never touches the form:
 * nothing is filled in, nothing is blocked. The one thing it offers is a
 * checkbox to link the new lead to the ops-panel deal, so its allocations show.
 *
 * `onResult` fires from the fetch callback (never from an effect body) so the
 * parent can hold the latest report for use at submit time.
 */
export function HeadsUpPanel({
  company,
  events,
  excludeLeadId,
  linkOptIn,
  onLinkOptIn,
  onResult,
  className,
}: {
  company: string;
  events: LeadEvent[];
  excludeLeadId?: string;
  /** null = follow the default (link when the match is confident). */
  linkOptIn?: boolean | null;
  onLinkOptIn?: (v: boolean) => void;
  onResult?: (c: PipelineConflicts | null) => void;
  className?: string;
}) {
  const query = company.trim();
  const eventKey = events.map((e) => e.event_id).join(",");
  // The result is tagged with the exact question it answers, so a stale
  // answer is ignored rather than cleared by an effect.
  const key = `${query.toLowerCase()}|${eventKey}`;
  const [result, setResult] = useState<{ key: string; data: PipelineConflicts | null } | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (query.length < MIN_QUERY) return;
    const mine = ++seq.current;
    const eventIds = eventKey ? eventKey.split(",").map(Number) : [];
    const timer = setTimeout(async () => {
      const data = await checkPipelineConflicts({ company: query, eventIds, excludeLeadId });
      if (mine !== seq.current) return;
      setResult({ key, data });
      onResult?.(data);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [key, query, eventKey, excludeLeadId, onResult]);

  if (query.length < MIN_QUERY) return null;

  const current = result?.key === key ? result.data : undefined;
  if (current === undefined) {
    return (
      <p className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Loader2 className="h-3 w-3 animate-spin" /> Checking who&apos;s on {query}…
      </p>
    );
  }
  if (!current) return null;

  const quiet = !current.hasConflict && current.teammates.length === 0 && !current.ops;
  if (quiet) {
    return (
      <p className={cn("inline-flex items-center gap-1.5 text-xs text-[var(--success)]", className)}>
        <CheckCircle2 className="h-3.5 w-3.5" /> Clear — nobody else has {current.company}.
      </p>
    );
  }

  return (
    <ConflictSummary
      conflicts={current}
      linkOptIn={linkOptIn}
      onLinkOptIn={onLinkOptIn}
      className={className}
    />
  );
}

/** The report itself — also used by the add-from-company confirm. */
export function ConflictSummary({
  conflicts,
  linkOptIn,
  onLinkOptIn,
  className,
}: {
  conflicts: PipelineConflicts;
  linkOptIn?: boolean | null;
  onLinkOptIn?: (v: boolean) => void;
  className?: string;
}) {
  const { company, teammates, ops, verdicts, signedBy } = conflicts;
  const others = teammates.filter((t) => !t.isMine);
  const mine = teammates.filter((t) => t.isMine);
  const confident = Boolean(ops && ops.confidence >= OPS_SIGNED_CONFIDENCE);
  const linkEffective = ops ? (linkOptIn ?? confident) : false;

  const headline = confident
    ? `${company} is already sponsoring with us`
    : others.length
      ? `${company} is already being worked`
      : `${company} may already be with us`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--ops)]/40 bg-[var(--ops-soft)]/60",
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-[var(--ops)]" aria-hidden />
      <div className="px-4 py-3.5 pl-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <TriangleAlert className="h-4 w-4 text-[var(--ops)]" />
          Heads up — {headline}
        </p>

        {/* Per-event verdicts, for the events this person chose */}
        {verdicts.length ? (
          <ul className="mt-2.5 space-y-1">
            {verdicts.map((v) => (
              <li key={v.event_id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
                <VerdictDot status={v.status} />
                <span className="font-medium">{v.event_name}</span>
                <span className={cn("text-muted-foreground", v.status === "clear" && "text-[var(--success)]")}>
                  {v.status === "signed" ? "already signed" : v.status === "pipeline" ? "in pipeline" : "clear"}
                  {v.status !== "clear" ? ` · ${v.detail}` : ""}
                </span>
                {v.leadId ? (
                  <Link
                    href={`/leads/${v.leadId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-[var(--brand)] hover:underline"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Teammates */}
        {others.length ? (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              In the pipeline
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {others.map((t) => (
                <li key={t.leadId} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white">
                    {initials(t.ownerName)}
                  </span>
                  <span className="font-medium">{t.ownerName}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", t.stageKind === "lost" && "text-muted-foreground line-through")}
                  >
                    {t.stage}
                  </Badge>
                  {t.events.length ? (
                    <EventChips events={t.events} max={3} />
                  ) : (
                    <span className="text-xs text-muted-foreground">no event set</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    · touched {timeAgo(t.lastActivityAt ?? t.updatedAt)}
                  </span>
                  <Link
                    href={`/leads/${t.leadId}`}
                    target="_blank"
                    className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--brand)] hover:underline"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Check with them before reaching out for the same event.
            </p>
          </div>
        ) : null}

        {mine.length ? (
          <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserRound className="h-3.5 w-3.5" />
            You already have {company} in your pipeline
            {mine[0].events.length ? <> for <EventChips events={mine[0].events} max={3} /></> : null}.
          </p>
        ) : null}

        {/* Ops panel */}
        {ops ? (
          <div className="mt-3 border-t border-[var(--ops)]/25 pt-2.5">
            <p className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Radar className="h-3 w-3 text-[var(--ops)]" />
              {confident ? "Signed, per the ops panel" : "Possibly the same firm in the ops panel"}
              {!ops.exact ? (
                <span className="normal-case tracking-normal">
                  — matched “{ops.company}” at {Math.round(ops.confidence * 100)}%
                </span>
              ) : null}
              {ops.has_payment ? (
                <Badge className="border-transparent bg-[var(--success-soft)] text-[10px] text-[var(--success)]">
                  <BadgeCheck className="h-3 w-3" /> Paid
                </Badge>
              ) : null}
            </p>
            {ops.events.length ? (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {ops.events.map((e) => (
                  <li
                    key={e.event_id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ops)]/30 bg-card/70 px-2 py-1 text-[11px]"
                  >
                    <CalendarDays className="h-3 w-3 text-[var(--ops)]" />
                    <span className="font-medium">{e.event_name}</span>
                    <span className="tabular text-muted-foreground">
                      {formatOpsMoney(e.allocated_amount, e.currency)}
                    </span>
                    {e.package_labels.length ? (
                      <span className="text-muted-foreground">· {e.package_labels.join(", ")}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                A deal exists but nothing is allocated to an event yet.
              </p>
            )}
            {signedBy.length ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Signed by <span className="font-medium text-foreground">{signedBy.join(", ")}</span>
              </p>
            ) : null}

            {onLinkOptIn ? (
              <label className="mt-2.5 flex cursor-pointer items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={linkEffective}
                  onChange={(e) => onLinkOptIn(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]"
                />
                <span>
                  Link this lead to the ops-panel deal
                  <span className="text-muted-foreground">
                    {" "}
                    — shows its allocations on the lead. Nothing else changes.
                  </span>
                </span>
              </label>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function VerdictDot({ status }: { status: "clear" | "pipeline" | "signed" }) {
  return (
    <span
      className={cn(
        "h-2 w-2 shrink-0 rounded-full",
        status === "signed"
          ? "bg-[var(--success)]"
          : status === "pipeline"
            ? "bg-[var(--ops)]"
            : "bg-[var(--success)]/40",
      )}
      aria-hidden
    />
  );
}
