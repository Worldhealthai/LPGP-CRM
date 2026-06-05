"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "./supabase/admin";

export type ActionResult = { ok: boolean; error?: string };

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
]);

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

export async function updateCompany(
  id: string,
  patch: Record<string, unknown>,
): Promise<ActionResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };
  const update = sanitize(patch, COMPANY_FIELDS);
  if (Object.keys(update).length === 0) return { ok: true };
  const { error } = await supabase.from("companies").update(update).eq("id", id);
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
