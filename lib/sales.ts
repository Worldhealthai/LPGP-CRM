/**
 * Shared vocabulary for the sales layer — call outcomes, activity kinds,
 * priorities. Pure data so client components can import it freely.
 */

import type { ActivityType, LeadWithRefs } from "./types";

// --- Call dispositions ------------------------------------------------------
// What happened on the call. `advance` marks outcomes that mean the lead was
// genuinely worked, so the queue can skip it next time round.

export type DispositionKind = "reached" | "missed" | "dead";

export type Disposition = {
  value: string;
  label: string;
  kind: DispositionKind;
  /** Suggested stage after this outcome, when it clearly implies one. */
  stage?: string;
  /** Default call-back offset in hours. */
  callbackHours?: number;
  key?: string;
};

export const DISPOSITIONS: Disposition[] = [
  { value: "Connected", label: "Connected", kind: "reached", stage: "Contacted", key: "1" },
  { value: "Meeting booked", label: "Meeting booked", kind: "reached", stage: "Discussing", key: "2" },
  { value: "Callback booked", label: "Callback booked", kind: "reached", callbackHours: 24, key: "3" },
  { value: "Voicemail", label: "Voicemail", kind: "missed", callbackHours: 48, key: "4" },
  { value: "No answer", label: "No answer", kind: "missed", callbackHours: 24, key: "5" },
  { value: "Gatekeeper", label: "Gatekeeper", kind: "missed", callbackHours: 24, key: "6" },
  { value: "Wrong number", label: "Wrong number", kind: "dead", key: "7" },
  { value: "Not interested", label: "Not interested", kind: "dead", stage: "Blown Out", key: "8" },
];

export const DISPOSITION_MAP: Record<string, Disposition> = Object.fromEntries(
  DISPOSITIONS.map((d) => [d.value, d]),
);

export function dispositionKind(value: string | null | undefined): DispositionKind | null {
  if (!value) return null;
  return DISPOSITION_MAP[value]?.kind ?? null;
}

// --- Activity presentation --------------------------------------------------

export const ACTIVITY_TYPES: ActivityType[] = [
  "call",
  "email",
  "meeting",
  "linkedin",
  "note",
  "task",
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  linkedin: "LinkedIn",
  note: "Note",
  task: "Task",
};

// --- Priorities -------------------------------------------------------------

export const PRIORITIES = ["High", "Normal", "Low"] as const;
export type Priority = (typeof PRIORITIES)[number];

// --- Queue ordering ---------------------------------------------------------

export type QueueFilter =
  | "my-open"
  | "never-called"
  | "callbacks-due"
  | "all-open"
  | "high-priority";

export const QUEUE_FILTERS: { value: QueueFilter; label: string; hint: string }[] = [
  { value: "my-open", label: "My open leads", hint: "Everything you own that isn't closed" },
  { value: "never-called", label: "Never called", hint: "No call logged yet" },
  { value: "callbacks-due", label: "Callbacks due", hint: "Promised call-backs at or past due" },
  { value: "high-priority", label: "High priority", hint: "Flagged high, still open" },
  { value: "all-open", label: "Everyone's open leads", hint: "The whole team's pipeline" },
];

const CLOSED_STAGES = new Set(["Confirmed", "Blown Out"]);

export function isClosed(lead: Pick<LeadWithRefs, "stage">): boolean {
  return CLOSED_STAGES.has(lead.stage);
}

/**
 * Build the call queue. Ordering is the point: a promised call-back that's due
 * outranks anything else, then high priority, then the stalest lead — so
 * working top-to-bottom is always the right order.
 */
export function buildQueue(
  leads: LeadWithRefs[],
  filter: QueueFilter,
  currentUserId: string | null,
  now = Date.now(),
): LeadWithRefs[] {
  const mine = (l: LeadWithRefs) => !currentUserId || l.owner_id === currentUserId;
  const callbackDue = (l: LeadWithRefs) =>
    Boolean(l.callback_at && new Date(l.callback_at).getTime() <= now);

  const pool = leads.filter((l) => {
    if (l.do_not_call) return false;
    switch (filter) {
      case "my-open":
        return mine(l) && !isClosed(l);
      case "never-called":
        return mine(l) && !isClosed(l) && (l.call_count ?? 0) === 0;
      case "callbacks-due":
        return mine(l) && !isClosed(l) && callbackDue(l);
      case "high-priority":
        return mine(l) && !isClosed(l) && l.priority === "High";
      case "all-open":
        return !isClosed(l);
      default:
        return !isClosed(l);
    }
  });

  const rank = (l: LeadWithRefs) => {
    if (callbackDue(l)) return 0;
    if (l.priority === "High") return 1;
    if ((l.call_count ?? 0) === 0) return 2;
    return 3;
  };

  return [...pool].sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    // Within a band, oldest contact first — nothing rots at the bottom.
    const at = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
    const bt = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
    if (at !== bt) return at - bt;
    return (a.company_name ?? "").localeCompare(b.company_name ?? "");
  });
}

/** "4m 12s" */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/** A phone number stripped to what tel: accepts. */
export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.length >= 6 ? `tel:${cleaned}` : null;
}
