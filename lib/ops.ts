import "server-only";

import type {
  OpsCompanySlim,
  OpsDeal,
  OpsEvent,
  OpsMatchResponse,
  OpsPing,
  OpsResult,
  OpsSponsor,
} from "./ops-types";

/**
 * Client for the TrackerLPGP ops-panel bridge.
 *
 * The ops panel is the source of truth for signed deals and which events each
 * sponsor's money is allocated to. The sales CRM reads it — never writes.
 *
 * Every call returns a tagged result instead of throwing: the ops panel being
 * down must degrade a page, not break it.
 */

const BASE = (process.env.OPS_PANEL_URL ?? "").replace(/\/+$/, "");
const KEY = process.env.OPS_BRIDGE_KEY ?? "";
const TIMEOUT_MS = 8000;

export function isOpsConfigured(): boolean {
  return Boolean(BASE && KEY);
}

/** Public base URL for deep links back into the ops panel (no secret). */
export function opsPanelUrl(): string {
  return BASE;
}

export type {
  OpsEventAllocation,
  OpsDeal,
  OpsCurrencyTotal,
  OpsCompanyEvent,
  OpsCompany,
  OpsCompanySlim,
  OpsMatch,
  OpsMatchResponse,
  OpsEvent,
  OpsSponsor,
  OpsPing,
  OpsFailure,
  OpsResult,
} from "./ops-types";
export { formatOpsMoney, describeOpsMatch, listEventNames, currencySymbol } from "./ops-types";

// --- Transport --------------------------------------------------------------

async function opsFetch<T>(path: string, revalidate = 60): Promise<OpsResult<T>> {
  if (!isOpsConfigured()) {
    return {
      ok: false,
      reason: "not_configured",
      error: "Set OPS_PANEL_URL and OPS_BRIDGE_KEY to connect the ops panel.",
    };
  }

  // AbortSignal.timeout keeps a cold Neon branch from hanging a page render.
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "x-ops-key": KEY, accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: revalidate > 0 ? { revalidate } : undefined,
      cache: revalidate > 0 ? undefined : "no-store",
    });

    if (res.status === 401) {
      return { ok: false, reason: "unauthorized", error: "The ops bridge key was rejected." };
    }
    if (res.status === 503) {
      return {
        ok: false,
        reason: "not_configured",
        error: "The ops panel has no OPS_BRIDGE_KEY set.",
      };
    }
    if (!res.ok) {
      return { ok: false, reason: "bad_response", error: `Ops panel returned ${res.status}.` };
    }

    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const timedOut = /timeout|abort/i.test(msg);
    return {
      ok: false,
      reason: "unreachable",
      error: timedOut ? "The ops panel did not respond in time." : `Could not reach the ops panel: ${msg}`,
    };
  }
}

// --- Cached lookups ---------------------------------------------------------

// Match results are keyed by the lowercased query. The pipeline form asks for
// the same handful of names repeatedly while someone is typing, and a company's
// deal set does not change minute to minute.
type CacheEntry<T> = { at: number; value: T };
const MATCH_TTL_MS = 120_000;
const matchCache = new Map<string, CacheEntry<OpsResult<OpsMatchResponse>>>();

function cacheKey(name: string) {
  return name.trim().toLowerCase();
}

/**
 * Does this company already exist as a deal in the ops panel? Returns every
 * plausible match with a confidence score; `best` is the top one.
 */
export async function matchOpsCompany(name: string): Promise<OpsResult<OpsMatchResponse>> {
  const key = cacheKey(name);
  if (!key) {
    return {
      ok: true,
      data: { query: name, normalized: "", match_count: 0, best: null, matches: [] },
    };
  }

  const hit = matchCache.get(key);
  if (hit && Date.now() - hit.at < MATCH_TTL_MS) return hit.value;

  const result = await opsFetch<OpsMatchResponse>(
    `/api/bridge/match?name=${encodeURIComponent(name)}&limit=6`,
    0,
  );
  // Only cache answers, never transport failures — a blip shouldn't stick
  // around for two minutes.
  if (result.ok) {
    matchCache.set(key, { at: Date.now(), value: result });
    if (matchCache.size > 500) matchCache.clear();
  }
  return result;
}

/** Drop cached matches — call after confirming a link so the UI re-reads. */
export function clearOpsMatchCache(): void {
  matchCache.clear();
}

export async function listOpsEvents(): Promise<OpsResult<OpsEvent[]>> {
  return opsFetch<OpsEvent[]>("/api/bridge/events", 120);
}

export async function listOpsEventSponsors(eventId: number): Promise<OpsResult<OpsSponsor[]>> {
  return opsFetch<OpsSponsor[]>(`/api/bridge/events/${eventId}/sponsors`, 120);
}

export async function getOpsDeal(dealId: number): Promise<OpsResult<OpsDeal>> {
  return opsFetch<OpsDeal>(`/api/bridge/deals/${dealId}`, 0);
}

export async function pingOps(): Promise<OpsResult<OpsPing>> {
  return opsFetch<OpsPing>("/api/bridge/ping", 0);
}

/** Slim company index — one fetch that answers "who is already a sponsor?". */
export async function listOpsCompanies(): Promise<OpsResult<OpsCompanySlim[]>> {
  return opsFetch<OpsCompanySlim[]>("/api/bridge/companies?slim=1", 300);
}
