"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "./supabase/admin";
import { getSessionUser } from "./auth";
import { isCategory } from "./categories";

export type AccountResult = { ok: boolean; id?: string; error?: string };

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function num(v: unknown): number | null {
  if (v === "" || v == null) return null;
  const n = Number(typeof v === "string" ? v.replace(/[^0-9.-]/g, "") : v);
  return Number.isFinite(n) ? n : null;
}

const ACCOUNT_TEXT = new Set([
  "name",
  "status",
  "tier",
  "health",
  "domain",
  "website",
  "linkedin_url",
  "hq_location",
  "country",
  "ops_company",
  "renewal_date",
  "notes",
]);

function accountPatch(input: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (ACCOUNT_TEXT.has(k)) patch[k] = clean(v);
  }
  if ("category" in input) {
    const c = clean(input.category);
    patch.category = c && isCategory(c) ? c : null;
  }
  if ("first_sponsored_year" in input) patch.first_sponsored_year = num(input.first_sponsored_year);
  if ("owner_id" in input) patch.owner_id = clean(input.owner_id);
  if ("company_id" in input) patch.company_id = clean(input.company_id);
  // status is NOT NULL — never let a blank wipe it.
  if (patch.status == null) delete patch.status;
  return patch;
}

export async function createAccount(input: Record<string, unknown>): Promise<AccountResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const patch = accountPatch(input);
  if (!patch.name) return { ok: false, error: "An account name is required." };

  const ownerId =
    user.role === "admin" && clean(input.owner_id) ? clean(input.owner_id) : user.id;

  const { data, error } = await supabase
    .from("accounts")
    .insert({ ...patch, owner_id: ownerId })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not create account" };

  revalidatePath("/accounts");
  return { ok: true, id: data.id };
}

export async function updateAccount(
  id: string,
  input: Record<string, unknown>,
): Promise<AccountResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const patch = accountPatch(input);
  if (!Object.keys(patch).length) return { ok: true, id };
  const { error } = await supabase.from("accounts").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/accounts");
  revalidatePath(`/accounts/${id}`);
  return { ok: true, id };
}

export async function deleteAccount(id: string): Promise<AccountResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (user.role !== "admin") return { ok: false, error: "Only admins can delete accounts." };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  // account_contacts and activities cascade; notes and links are keyed by
  // entity id so they have to go explicitly.
  await supabase.from("notes").delete().eq("entity_type", "account").eq("entity_id", id);
  await supabase.from("ops_links").delete().eq("entity_type", "account").eq("entity_id", id);
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/accounts");
  return { ok: true };
}

/** Promote a won lead into a sponsor account, carrying its ops links over. */
export async function convertLeadToAccount(leadId: string): Promise<AccountResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const { data: lead } = await supabase
    .from("leads")
    .select(
      "id, company_id, company_name, category, owner_id, country, website, account_id, contact_name, contact_title, contact_email, contact_phone, linkedin_url",
    )
    .eq("id", leadId)
    .single();
  if (!lead) return { ok: false, error: "Lead not found" };
  if (lead.account_id) return { ok: true, id: lead.account_id as string };

  const { data: account, error } = await supabase
    .from("accounts")
    .insert({
      company_id: lead.company_id,
      name: lead.company_name ?? "Untitled account",
      category: lead.category,
      owner_id: lead.owner_id ?? user.id,
      status: "Active",
      country: lead.country,
      website: lead.website,
      first_sponsored_year: new Date().getFullYear(),
    })
    .select("id")
    .single();
  if (error || !account) return { ok: false, error: error?.message ?? "Could not create account" };

  // The lead's contact becomes the account's first point of contact.
  if (lead.contact_name) {
    await supabase.from("account_contacts").insert({
      account_id: account.id,
      full_name: lead.contact_name,
      job_title: lead.contact_title,
      email: lead.contact_email,
      phone: lead.contact_phone,
      linkedin_url: lead.linkedin_url,
      role: "Primary",
      is_primary: true,
    });
  }

  // Carry the ops-panel links across so allocations show up immediately.
  const { data: links } = await supabase
    .from("ops_links")
    .select("ops_deal_id, ops_company, confidence, snapshot")
    .eq("entity_type", "lead")
    .eq("entity_id", leadId);
  if (links?.length) {
    await supabase.from("ops_links").upsert(
      links.map((l) => ({
        entity_type: "account" as const,
        entity_id: account.id as string,
        ops_deal_id: l.ops_deal_id,
        ops_company: l.ops_company,
        confidence: l.confidence,
        snapshot: l.snapshot,
        linked_by: user.id,
      })),
      { onConflict: "entity_type,entity_id,ops_deal_id" },
    );
    const opsCompany = links.find((l) => l.ops_company)?.ops_company ?? null;
    if (opsCompany) {
      await supabase.from("accounts").update({ ops_company: opsCompany }).eq("id", account.id);
    }
  }

  await supabase.from("leads").update({ account_id: account.id }).eq("id", leadId);
  await supabase
    .from("activities")
    .update({ account_id: account.id })
    .eq("lead_id", leadId)
    .is("account_id", null);

  revalidatePath("/accounts");
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return { ok: true, id: account.id };
}

// --- Points of contact -----------------------------------------------------

const CONTACT_TEXT = new Set([
  "full_name",
  "job_title",
  "email",
  "phone",
  "mobile",
  "linkedin_url",
  "role",
  "last_contacted",
  "notes",
]);

function contactPatch(input: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (CONTACT_TEXT.has(k)) patch[k] = clean(v);
  }
  if ("is_primary" in input) patch.is_primary = Boolean(input.is_primary);
  if ("contact_id" in input) patch.contact_id = clean(input.contact_id);
  return patch;
}

/**
 * A unique partial index enforces one primary per account, so demote the
 * incumbent before promoting a new one or the insert trips the constraint.
 */
async function clearOtherPrimaries(
  supabase: NonNullable<ReturnType<typeof getAdminClient>>,
  accountId: string,
  exceptId?: string,
) {
  let q = supabase
    .from("account_contacts")
    .update({ is_primary: false })
    .eq("account_id", accountId)
    .eq("is_primary", true);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
}

export async function createAccountContact(
  accountId: string,
  input: Record<string, unknown>,
): Promise<AccountResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const patch = contactPatch(input);
  if (!patch.full_name) return { ok: false, error: "A contact name is required." };
  if (patch.is_primary) await clearOtherPrimaries(supabase, accountId);

  const { data, error } = await supabase
    .from("account_contacts")
    .insert({ ...patch, account_id: accountId })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not add contact" };

  revalidatePath(`/accounts/${accountId}`);
  return { ok: true, id: data.id };
}

export async function updateAccountContact(
  id: string,
  accountId: string,
  input: Record<string, unknown>,
): Promise<AccountResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const patch = contactPatch(input);
  if (!Object.keys(patch).length) return { ok: true, id };
  if (patch.is_primary) await clearOtherPrimaries(supabase, accountId, id);

  const { error } = await supabase.from("account_contacts").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/accounts/${accountId}`);
  return { ok: true, id };
}

export async function deleteAccountContact(
  id: string,
  accountId: string,
): Promise<AccountResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const { error } = await supabase.from("account_contacts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/accounts/${accountId}`);
  return { ok: true };
}
