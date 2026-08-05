export const LEAD_STAGES = [
  "New",
  "Contacted",
  "Discussing",
  "Proposal Sent",
  "Confirmed",
  "Blown Out",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export function isLeadStage(v: unknown): v is LeadStage {
  return typeof v === "string" && (LEAD_STAGES as readonly string[]).includes(v);
}

export type StageKind = "open" | "won" | "lost";

export const STAGE_META: Record<LeadStage, { label: string; kind: StageKind }> = {
  New: { label: "New", kind: "open" },
  Contacted: { label: "Contacted", kind: "open" },
  Discussing: { label: "Discussing", kind: "open" },
  "Proposal Sent": { label: "Proposal Sent", kind: "open" },
  Confirmed: { label: "Confirmed", kind: "won" },
  "Blown Out": { label: "Blown Out", kind: "lost" },
};

// Markets (regions). Free-form in the DB, but the UI offers these.
export const MARKETS = ["US", "UK"] as const;
export type Market = (typeof MARKETS)[number];

export const MARKET_LABELS: Record<string, string> = {
  US: "US Market",
  UK: "UK Market",
};

/** Best-effort market from a company's country. */
export function marketFromCountry(country: string | null | undefined): string | null {
  if (!country) return null;
  const c = country.trim().toLowerCase();
  if (c === "united states" || c === "usa" || c === "us") return "US";
  if (c === "united kingdom" || c === "uk" || c === "great britain" || c === "england") return "UK";
  return null;
}
