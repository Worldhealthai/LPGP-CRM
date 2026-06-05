"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "./supabase/admin";

export type ActionResult = { ok: boolean; error?: string };

// --- Deletes ---------------------------------------------------------------

async function deleteCompanyIds(ids: string[]): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  if (ids.length === 0) return { ok: true };

  // Remove notes attached to this company's contacts, then the contacts,
  // then notes on the companies, then the companies themselves.
  const { data: kids } = await supabase.from("contacts").select("id").in("company_id", ids);
  const contactIds = (kids ?? []).map((c) => c.id as string);
  if (contactIds.length) {
    await supabase.from("notes").delete().eq("entity_type", "contact").in("entity_id", contactIds);
  }
  await supabase.from("notes").delete().eq("entity_type", "company").in("entity_id", ids);
  await supabase.from("contacts").delete().in("company_id", ids);
  const { error } = await supabase.from("companies").delete().in("id", ids);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/companies");
  revalidatePath("/contacts");
  revalidatePath("/portfolio");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  return deleteCompanyIds([id]);
}

export async function deleteCompanies(ids: string[]): Promise<ActionResult> {
  return deleteCompanyIds(Array.isArray(ids) ? ids.filter(Boolean) : []);
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  await supabase.from("notes").delete().eq("entity_type", "contact").eq("entity_id", id);
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/contacts");
  revalidatePath("/");
  return { ok: true };
}

const CONTACT_FIELDS = new Set([
  "first_name",
  "last_name",
  "job_title",
  "seniority",
  "department",
  "email",
  "phone",
  "linkedin_url",
  "country",
  "city",
  "priority",
  "status",
  "last_contacted",
]);

const COMPANY_FIELDS = new Set([
  "name",
  "sub_type",
  "domain",
  "website",
  "linkedin_url",
  "description",
  "country",
  "city",
  "hq_location",
  "employee_range",
  "aum",
  "region",
  "status",
  "investment_thesis",
  "check_size",
  "preferred_stages",
  "geographic_focus",
]);

const COMPANY_NUMERIC_FIELDS = new Set(["aum_usd", "active_funds"]);

function sanitize(patch: Record<string, unknown>, allowed: Set<string>) {
  const out: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (!allowed.has(key)) continue;
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    out[key] = trimmed === "" ? null : trimmed;
  }
  return out;
}

export async function updateContact(
  id: string,
  patch: Record<string, unknown>,
): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const update = sanitize(patch, CONTACT_FIELDS);
  if (Object.keys(update).length === 0) return { ok: true };
  const { error } = await supabase.from("contacts").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/contacts/${id}`);
  revalidatePath("/contacts");
  return { ok: true };
}

export async function setContactRating(id: string, value: number): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const v = Number.isFinite(value) ? Math.max(0, Math.min(5, Math.round(value))) : 0;
  const { error } = await supabase
    .from("contacts")
    .update({ relationship_strength: v === 0 ? null : v })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/contacts/${id}`);
  return { ok: true };
}

export async function updateCompany(
  id: string,
  patch: Record<string, unknown>,
): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const update: Record<string, string | number | null> = sanitize(patch, COMPANY_FIELDS);
  // Numeric fields: strip currency symbols / commas, parse, null when empty/NaN.
  for (const [key, value] of Object.entries(patch)) {
    if (!COMPANY_NUMERIC_FIELDS.has(key) || typeof value !== "string") continue;
    const raw = value.replace(/[$,\s]/g, "").trim();
    if (raw === "") {
      update[key] = null;
    } else {
      const num = Number(raw);
      if (!Number.isNaN(num)) update[key] = key === "active_funds" ? Math.round(num) : num;
    }
  }

  if (Object.keys(update).length === 0) return { ok: true };
  const { error } = await supabase.from("companies").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/companies/${id}`);
  revalidatePath("/companies");
  return { ok: true };
}

export async function updateCompanyAllocations(
  id: string,
  allocations: { label: string; value: number }[],
): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const clean = (Array.isArray(allocations) ? allocations : [])
    .map((a) => ({
      label: typeof a.label === "string" ? a.label.trim() : "",
      value: Math.max(0, Math.min(100, Number(a.value) || 0)),
    }))
    .filter((a) => a.label !== "");
  const { error } = await supabase.from("companies").update({ allocations: clean }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/companies/${id}`);
  return { ok: true };
}

export async function setPortfolio(id: string, value: boolean): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const { error } = await supabase.from("companies").update({ in_portfolio: value }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/companies/${id}`);
  revalidatePath("/companies");
  return { ok: true };
}

export async function addNote(
  entityType: "company" | "contact",
  entityId: string,
  body: string,
  author?: string,
): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const text = body.trim();
  if (!text) return { ok: false, error: "Note is empty" };
  const { error } = await supabase.from("notes").insert({
    entity_type: entityType,
    entity_id: entityId,
    body: text,
    author: author?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${entityType === "company" ? "companies" : "contacts"}/${entityId}`);
  return { ok: true };
}

export async function deleteNote(
  id: string,
  entityType: "company" | "contact",
  entityId: string,
): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${entityType === "company" ? "companies" : "contacts"}/${entityId}`);
  return { ok: true };
}
