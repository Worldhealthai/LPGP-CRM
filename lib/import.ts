import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "./types";
import { domainFromUrl } from "./utils";

/** A normalized row ready to be written to the CRM, regardless of source
 *  (Excel/CSV upload, Lusha enrich, manual). */
export type ImportRow = {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  seniority?: string | null;
  department?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  country?: string | null;
  city?: string | null;
  companyName?: string | null;
  companyDomain?: string | null;
  companyWebsite?: string | null;
  companyLinkedin?: string | null;
  subType?: string | null;
  category?: Category | null;
  lushaContactId?: string | null;
};

export type ImportResult = {
  imported: number;
  companiesCreated: number;
  skipped: number;
  total: number;
};

function clean(v: string | null | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export async function importContactRows(
  supabase: SupabaseClient,
  rows: ImportRow[],
  defaultCategory: Category,
): Promise<ImportResult> {
  const companyCache = new Map<string, string>();
  let imported = 0;
  let companiesCreated = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      const firstName = clean(row.firstName);
      const lastName = clean(row.lastName);
      const email = clean(row.email);
      // A row needs at least a name or an email to be a contact.
      if (!firstName && !lastName && !email) {
        skipped += 1;
        continue;
      }

      const category = row.category ?? defaultCategory;
      const companyId = await resolveCompany(supabase, row, category, companyCache, () => {
        companiesCreated += 1;
      });

      const payload = {
        company_id: companyId,
        first_name: firstName,
        last_name: lastName,
        job_title: clean(row.jobTitle),
        seniority: clean(row.seniority),
        department: clean(row.department),
        email,
        phone: clean(row.phone),
        linkedin_url: clean(row.linkedinUrl),
        country: clean(row.country),
        city: clean(row.city),
        lusha_contact_id: clean(row.lushaContactId),
      };

      const existingId = await findExistingContact(supabase, payload.lusha_contact_id, email);
      if (existingId) {
        const { error } = await supabase.from("contacts").update(payload).eq("id", existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contacts").insert(payload);
        if (error) throw error;
      }
      imported += 1;
    } catch {
      skipped += 1;
    }
  }

  return { imported, companiesCreated, skipped, total: rows.length };
}

async function findExistingContact(
  supabase: SupabaseClient,
  lushaId: string | null,
  email: string | null,
): Promise<string | null> {
  if (lushaId) {
    const { data } = await supabase
      .from("contacts")
      .select("id")
      .eq("lusha_contact_id", lushaId)
      .limit(1);
    if (data && data.length) return data[0].id;
  }
  if (email) {
    const { data } = await supabase.from("contacts").select("id").ilike("email", email).limit(1);
    if (data && data.length) return data[0].id;
  }
  return null;
}

async function resolveCompany(
  supabase: SupabaseClient,
  row: ImportRow,
  category: Category,
  cache: Map<string, string>,
  onCreate: () => void,
): Promise<string | null> {
  const name = clean(row.companyName);
  const domain = clean(row.companyDomain) ?? domainFromUrl(row.companyWebsite ?? row.companyDomain);
  const key = (domain ?? name ?? "").toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key)!;

  if (domain) {
    const { data } = await supabase.from("companies").select("id").eq("domain", domain).limit(1);
    if (data && data.length) {
      cache.set(key, data[0].id);
      return data[0].id;
    }
  }
  if (name) {
    const { data } = await supabase.from("companies").select("id").ilike("name", name).limit(1);
    if (data && data.length) {
      cache.set(key, data[0].id);
      return data[0].id;
    }
  }

  const { data: created, error } = await supabase
    .from("companies")
    .insert({
      name: name ?? domain ?? "Unknown company",
      category,
      sub_type: clean(row.subType),
      domain: domain ?? null,
      website: clean(row.companyWebsite) ?? (domain ? `https://${domain}` : null),
      linkedin_url: clean(row.companyLinkedin),
      country: clean(row.country),
    })
    .select("id")
    .single();
  if (error || !created) return null;
  onCreate();
  cache.set(key, created.id);
  return created.id;
}
