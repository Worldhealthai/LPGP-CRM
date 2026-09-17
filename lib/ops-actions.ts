"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "./supabase/admin";
import { getSessionUser } from "./auth";
import {
  clearOpsMatchCache,
  getOpsDeal,
  isOpsConfigured,
  matchOpsCompany,
  type OpsCompany,
  type OpsMatchResponse,
} from "./ops";
import type { OpsLinkEntity } from "./types";

export type OpsLookupResult =
  | { ok: true; configured: boolean; data: OpsMatchResponse }
  | { ok: false; configured: boolean; error: string };

/**
 * "Is this company already a deal in the ops panel?"
 *
 * Called from the pipeline / lead forms as soon as a company name is entered.
 * A failure here is never fatal — the caller just doesn't show the notice.
 */
export async function lookupOpsCompany(name: string): Promise<OpsLookupResult> {
  const configured = isOpsConfigured();
  if (!configured) return { ok: false, configured, error: "Ops panel not connected" };
  const user = await getSessionUser();
  if (!user) return { ok: false, configured, error: "Not signed in" };

  const result = await matchOpsCompany(name);
  if (!result.ok) return { ok: false, configured, error: result.error };
  return { ok: true, configured, data: result.data };
}

export type OpsLinkResult = { ok: boolean; linked?: number; error?: string };

/**
 * Confirm that a CRM record is the same company as an ops-panel deal.
 *
 * One company in the tracker can carry several deals (one per event cycle), so
 * this writes a link row per deal and snapshots each payload — the account page
 * then renders allocations even if the bridge is later unreachable.
 */
export async function linkOpsCompany(
  entityType: OpsLinkEntity,
  entityId: string,
  company: OpsCompany,
): Promise<OpsLinkResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const deals = company.deals ?? [];
  if (!deals.length) return { ok: false, error: "That ops company has no deals to link." };

  const rows = deals.map((deal) => ({
    entity_type: entityType,
    entity_id: entityId,
    ops_deal_id: deal.id,
    ops_company: company.company,
    confidence: "confidence" in company ? (company as { confidence?: number }).confidence ?? null : null,
    snapshot: {
      deal,
      company_totals: company.totals,
      company_events: company.events,
    },
    synced_at: new Date().toISOString(),
    linked_by: user.id,
  }));

  const { error } = await supabase
    .from("ops_links")
    .upsert(rows, { onConflict: "entity_type,entity_id,ops_deal_id" });
  if (error) return { ok: false, error: error.message };

  // Denormalise onto the record itself so lists can badge "linked" without a
  // join. The largest deal wins when there are several.
  const primary = [...deals].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))[0];
  if (entityType === "lead") {
    await supabase
      .from("leads")
      .update({ ops_deal_id: primary.id, ops_checked_at: new Date().toISOString() })
      .eq("id", entityId);
  } else if (entityType === "account") {
    await supabase.from("accounts").update({ ops_company: company.company }).eq("id", entityId);
  }

  revalidateOpsPaths(entityType, entityId);
  return { ok: true, linked: rows.length };
}

/** Remove every ops link for a record (or just one deal when given). */
export async function unlinkOps(
  entityType: OpsLinkEntity,
  entityId: string,
  opsDealId?: number,
): Promise<OpsLinkResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  let query = supabase
    .from("ops_links")
    .delete()
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);
  if (opsDealId != null) query = query.eq("ops_deal_id", opsDealId);
  const { error } = await query;
  if (error) return { ok: false, error: error.message };

  if (entityType === "lead") {
    await supabase.from("leads").update({ ops_deal_id: null }).eq("id", entityId);
  } else if (entityType === "account") {
    await supabase.from("accounts").update({ ops_company: null }).eq("id", entityId);
  }

  revalidateOpsPaths(entityType, entityId);
  return { ok: true };
}

/** Re-pull every linked deal from the bridge and refresh the stored snapshots. */
export async function syncOpsLinks(
  entityType: OpsLinkEntity,
  entityId: string,
): Promise<OpsLinkResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  if (!isOpsConfigured()) return { ok: false, error: "Ops panel not connected" };

  const { data: links } = await supabase
    .from("ops_links")
    .select("id, ops_deal_id, snapshot")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);
  if (!links?.length) return { ok: true, linked: 0 };

  clearOpsMatchCache();
  let refreshed = 0;
  for (const link of links) {
    const result = await getOpsDeal(link.ops_deal_id as number);
    if (!result.ok) continue;
    const snapshot = (link.snapshot ?? {}) as Record<string, unknown>;
    await supabase
      .from("ops_links")
      .update({
        snapshot: { ...snapshot, deal: result.data },
        synced_at: new Date().toISOString(),
      })
      .eq("id", link.id as string);
    refreshed++;
  }

  revalidateOpsPaths(entityType, entityId);
  return { ok: true, linked: refreshed };
}

function revalidateOpsPaths(entityType: OpsLinkEntity, entityId: string) {
  revalidatePath("/");
  if (entityType === "lead") {
    revalidatePath("/leads");
    revalidatePath(`/leads/${entityId}`);
    revalidatePath("/pipeline");
  } else if (entityType === "account") {
    revalidatePath("/accounts");
    revalidatePath(`/accounts/${entityId}`);
  } else {
    revalidatePath(`/companies/${entityId}`);
  }
}
