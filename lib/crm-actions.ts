"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "./supabase/admin";
import { getSessionUser } from "./auth";
import { isCategory } from "./categories";
import { isLeadStage, marketFromCountry } from "./pipeline";
import { checkPipelineConflicts } from "./pipeline-conflicts";
import type { LeadEvent, PipelineConflicts } from "./types";

export type LeadActionResult = {
  ok: boolean;
  id?: string;
  error?: string;
  /** Set when the add was held back for a heads-up; pass acknowledge to proceed. */
  conflicts?: PipelineConflicts;
};

/** Sanitise a target_events payload down to { event_id, event_name } rows. */
function cleanEvents(v: unknown): LeadEvent[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<number>();
  const out: LeadEvent[] = [];
  for (const raw of v) {
    const id = Number((raw as { event_id?: unknown })?.event_id);
    const name = clean((raw as { event_name?: unknown })?.event_name) ?? "";
    if (!Number.isInteger(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({ event_id: id, event_name: name });
  }
  return out;
}

const TEXT_FIELDS = new Set([
  "company_name",
  "contact_name",
  "contact_title",
  "contact_email",
  "contact_phone",
  "linkedin_url",
  "market",
  "source",
  "next_step",
  "next_step_date",
]);

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function buildPatch(input: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (TEXT_FIELDS.has(k)) patch[k] = clean(v);
  }
  if ("category" in input) {
    const c = clean(input.category);
    patch.category = c && isCategory(c) ? c : null;
  }
  if ("stage" in input && isLeadStage(input.stage)) patch.stage = input.stage;
  if ("value_usd" in input) {
    const raw = typeof input.value_usd === "string" ? input.value_usd.replace(/[$,\s]/g, "") : input.value_usd;
    const num = Number(raw);
    patch.value_usd = raw === "" || raw == null || Number.isNaN(num) ? null : num;
  }
  if ("target_events" in input) patch.target_events = cleanEvents(input.target_events);
  return patch;
}

async function loadActor() {
  const user = await getSessionUser();
  const supabase = getAdminClient();
  return { user, supabase };
}

export async function createLead(input: Record<string, unknown>): Promise<LeadActionResult> {
  const { user, supabase } = await loadActor();
  if (!user) return { ok: false, error: "Not signed in" };
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const patch = buildPatch(input);
  // Admins may set an owner; everyone else owns what they create.
  const ownerId =
    user.role === "admin" && clean(input.owner_id) ? clean(input.owner_id) : user.id;
  const companyId = clean(input.company_id);
  if (!patch.company_name && !companyId) {
    return { ok: false, error: "A company name is required." };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...patch, owner_id: ownerId, company_id: companyId })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not create lead" };
  revalidatePath("/");
  revalidatePath("/leads");
  return { ok: true, id: data.id };
}

export async function createLeadFromCompany(
  companyId: string,
  opts: { acknowledge?: boolean } = {},
): Promise<LeadActionResult> {
  const { user, supabase } = await loadActor();
  if (!user) return { ok: false, error: "Not signed in" };
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, category, country")
    .eq("id", companyId)
    .single();
  if (!company) return { ok: false, error: "Company not found" };

  // Same heads-up the new-lead form gives: a teammate already on it, or a
  // signed sponsor. Held back once; the caller shows it and can proceed.
  if (!opts.acknowledge) {
    const conflicts = await checkPipelineConflicts({ company: company.name });
    if (conflicts.hasConflict) return { ok: false, conflicts };
  }

  // Avoid duplicates for the same owner + company.
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("company_id", companyId)
    .eq("owner_id", user.id)
    .limit(1);
  if (existing && existing.length) {
    return { ok: true, id: existing[0].id };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      owner_id: user.id,
      company_id: company.id,
      company_name: company.name,
      category: company.category,
      market: marketFromCountry(company.country),
      stage: "New",
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not add to pipeline" };
  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath(`/companies/${companyId}`);
  return { ok: true, id: data.id };
}

async function canMutate(supabase: NonNullable<ReturnType<typeof getAdminClient>>, id: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "Not signed in" };
  const { data: lead } = await supabase.from("leads").select("owner_id").eq("id", id).single();
  if (!lead) return { ok: false as const, error: "Lead not found" };
  if (user.role !== "admin" && lead.owner_id !== user.id) {
    return { ok: false as const, error: "This lead belongs to someone else." };
  }
  return { ok: true as const, user };
}

export async function updateLead(
  id: string,
  input: Record<string, unknown>,
): Promise<LeadActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const guard = await canMutate(supabase, id);
  if (!guard.ok) return { ok: false, error: guard.error };

  const patch = buildPatch(input);
  if (Object.keys(patch).length === 0) return { ok: true, id };
  const { error } = await supabase.from("leads").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { ok: true, id };
}

export async function moveLeadStage(id: string, stage: string): Promise<LeadActionResult> {
  if (!isLeadStage(stage)) return { ok: false, error: "Invalid stage" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const guard = await canMutate(supabase, id);
  if (!guard.ok) return { ok: false, error: guard.error };
  const { error } = await supabase.from("leads").update({ stage }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { ok: true, id };
}

export async function assignLead(id: string, ownerId: string): Promise<LeadActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (user.role !== "admin") return { ok: false, error: "Only admins can reassign leads." };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const { error } = await supabase
    .from("leads")
    .update({ owner_id: clean(ownerId) })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { ok: true, id };
}

export async function deleteLead(id: string): Promise<LeadActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const guard = await canMutate(supabase, id);
  if (!guard.ok) return { ok: false, error: guard.error };
  await supabase.from("notes").delete().eq("entity_type", "lead").eq("entity_id", id);
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/leads");
  return { ok: true };
}
