import "server-only";
import { getReadClient } from "./supabase/server";
import { loadProfileDirectory } from "./initials";
import { isOpsConfigured, listOpsDeals } from "./ops";
import type { AgreementStatus, OpsDeal } from "./ops-types";
import { normalizeInitials } from "./utils";

/**
 * "My deals" — the deals in the ops panel that belong to one salesperson.
 *
 * Two ways a deal becomes theirs, and the distinction matters:
 *   stamped   the tracker has their initials on it — the system of record says
 *             they signed it
 *   claimed   they added it here, via an ops_links row owned by their profile
 *
 * A deal can be both. Nothing is duplicated into Supabase: the tracker stays
 * the source of truth and this is a view onto it.
 */

export type DealOwnership = "stamped" | "claimed" | "both";

export type MyDeal = {
  deal: OpsDeal;
  ownership: DealOwnership;
  /** When they claimed it here, if they did. */
  claimedAt: string | null;
};

export type MyDealsResult = {
  deals: MyDeal[];
  initials: string | null;
  /** Deals needing paperwork, counted once so the page doesn't recount. */
  needInvoice: number;
  awaitingSignature: number;
  /** Per-currency, never cross-summed. */
  totals: { currency: string; contracted: number; paid: number }[];
  error: string | null;
};

const EMPTY: MyDealsResult = {
  deals: [],
  initials: null,
  needInvoice: 0,
  awaitingSignature: 0,
  totals: [],
  error: null,
};

/** Deal ids this person has claimed, with when. */
async function claimedDealIds(profileId: string): Promise<Map<number, string>> {
  const supabase = getReadClient();
  if (!supabase) return new Map();
  const { data } = await supabase
    .from("ops_links")
    .select("ops_deal_id, created_at")
    .eq("entity_type", "user")
    .eq("entity_id", profileId);
  return new Map((data ?? []).map((r) => [r.ops_deal_id as number, r.created_at as string]));
}

export async function getMyDeals(profileId: string): Promise<MyDealsResult> {
  if (!isOpsConfigured()) {
    return { ...EMPTY, error: "Connect the ops panel in Settings to see your deals." };
  }

  const [directory, claimed] = await Promise.all([
    loadProfileDirectory(),
    claimedDealIds(profileId),
  ]);
  const initials = directory.initialsFor(profileId);

  // One unfiltered fetch, then split locally — two filtered round-trips would
  // still need de-duplicating, and a deal can be both stamped and claimed.
  const res = await listOpsDeals({ limit: 500 });
  if (!res.ok) return { ...EMPTY, initials, error: res.error };

  const want = normalizeInitials(initials);
  const mine: MyDeal[] = [];
  for (const deal of res.data) {
    const stamped = Boolean(want) && normalizeInitials(deal.initials) === want;
    const claimedAt = claimed.get(deal.id) ?? null;
    if (!stamped && !claimedAt) continue;
    mine.push({
      deal,
      ownership: stamped && claimedAt ? "both" : stamped ? "stamped" : "claimed",
      claimedAt,
    });
  }

  // Paperwork first — a deal needing an invoice is the one that needs a person.
  const rank = (s: AgreementStatus) =>
    s === "need_invoice" ? 0 : s === "awaiting_signature" ? 1 : 2;
  mine.sort(
    (a, b) =>
      rank(a.deal.agreement_status) - rank(b.deal.agreement_status) ||
      b.deal.created_at.localeCompare(a.deal.created_at),
  );

  const byCurrency = new Map<string, { currency: string; contracted: number; paid: number }>();
  for (const { deal } of mine) {
    const row = byCurrency.get(deal.currency) ?? {
      currency: deal.currency,
      contracted: 0,
      paid: 0,
    };
    row.contracted += deal.amount ?? 0;
    row.paid += deal.paid_inc_vat ?? 0;
    byCurrency.set(deal.currency, row);
  }

  return {
    deals: mine,
    initials,
    needInvoice: mine.filter((d) => d.deal.agreement_status === "need_invoice").length,
    awaitingSignature: mine.filter((d) => d.deal.agreement_status === "awaiting_signature").length,
    totals: [...byCurrency.values()],
    error: null,
  };
}
