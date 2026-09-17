import "server-only";
import { matchOpsCompany } from "./ops";
import { formatOpsMoney, type OpsDeal } from "./ops-types";

/**
 * "A deal like that already exists — is it this one?"
 *
 * Before the CRM creates a deal in the tracker, it looks for one that already
 * describes the same business. Company similarity comes from the bridge (one
 * scoring implementation); this adds the two things that distinguish deals
 * *within* a company: the events the money is allocated to, and the amount.
 *
 * It only ever asks. Adopting or creating is the person's call.
 */

/** Below this the candidate isn't worth interrupting someone over. */
const ASK_THRESHOLD = 0.62;

/** Amounts within this fraction of each other count as "the same figure". */
const AMOUNT_TOLERANCE = 0.02;

export type DealCandidate = {
  deal: OpsDeal;
  /** 0–1. How confident we are this is the deal being entered. */
  score: number;
  /** Plain-English reasons, for the person deciding. */
  reasons: string[];
  sharedEvents: { event_id: number; event_name: string }[];
};

export type DuplicateQuery = {
  company: string;
  eventIds?: number[];
  amount?: number | null;
  currency?: string;
};

export type DuplicateReport = {
  company: string;
  candidates: DealCandidate[];
  /** True when the ops panel was asked and answered. */
  checked: boolean;
  error: string | null;
};

export async function findSimilarDeals(query: DuplicateQuery): Promise<DuplicateReport> {
  const company = query.company.trim();
  if (!company) return { company, candidates: [], checked: false, error: null };

  const match = await matchOpsCompany(company);
  if (!match.ok) {
    return { company, candidates: [], checked: false, error: match.error };
  }

  const wantEvents = new Set(query.eventIds ?? []);
  const amount = typeof query.amount === "number" && query.amount > 0 ? query.amount : null;

  const candidates: DealCandidate[] = [];
  for (const m of match.data.matches) {
    for (const deal of m.deals) {
      if (deal.cancelled) continue;

      const shared = deal.events
        .filter((e) => wantEvents.has(e.event_id))
        .map((e) => ({ event_id: e.event_id, event_name: e.event_name }));

      // Start from how sure we are it's the same firm, then adjust on the
      // things that separate one deal from another within it.
      let score = m.confidence;
      const reasons: string[] = [
        m.exact ? `Same company (${deal.company})` : `Similar company name (${deal.company})`,
      ];

      if (shared.length) {
        score += 0.25;
        reasons.push(
          `Already allocated to ${shared.map((e) => e.event_name).join(", ")}`,
        );
      } else if (wantEvents.size && deal.events.length) {
        // Same firm, different events — most likely a separate deal, so say so
        // rather than quietly scoring it the same as a match.
        score -= 0.18;
        reasons.push(`Different events (${deal.events.map((e) => e.event_name).join(", ")})`);
      }

      if (amount != null && deal.amount > 0) {
        const delta = Math.abs(deal.amount - amount) / Math.max(deal.amount, amount);
        if (delta <= AMOUNT_TOLERANCE) {
          score += 0.15;
          reasons.push(`Same amount (${formatOpsMoney(deal.amount, deal.currency)})`);
        } else {
          reasons.push(`Different amount (${formatOpsMoney(deal.amount, deal.currency)})`);
        }
      }

      score = Math.max(0, Math.min(1, score));
      if (score >= ASK_THRESHOLD) candidates.push({ deal, score, reasons, sharedEvents: shared });
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.deal.id - a.deal.id);
  return { company, candidates: candidates.slice(0, 5), checked: true, error: null };
}
