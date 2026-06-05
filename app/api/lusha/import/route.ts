import { NextResponse } from "next/server";
import { lushaConfigured, lushaContactEnrich, LushaError, type LushaEnriched } from "@/lib/lusha";
import { getAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { isCategory } from "@/lib/categories";
import { domainFromUrl } from "@/lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  if (!lushaConfigured()) {
    return NextResponse.json({ error: "LUSHA_API_KEY is not configured." }, { status: 503 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured — cannot write leads." },
      { status: 503 },
    );
  }
  const supabase = getAdminClient()!;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const category = body.category;
  if (!isCategory(category)) {
    return NextResponse.json({ error: "category must be LP, GP or SP" }, { status: 400 });
  }
  const contactIds = Array.isArray(body.contactIds) ? body.contactIds.map(String) : [];
  if (!contactIds.length) {
    return NextResponse.json({ error: "Select at least one contact to import." }, { status: 400 });
  }
  const requestId = typeof body.requestId === "string" ? body.requestId : null;

  let enriched: LushaEnriched[];
  try {
    enriched = await lushaContactEnrich(requestId, contactIds);
  } catch (err) {
    const status = err instanceof LushaError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Lusha enrich failed";
    return NextResponse.json({ error: message }, { status });
  }

  const companyCache = new Map<string, string>();
  let companiesCreated = 0;
  let contactsImported = 0;
  const errors: string[] = [];

  for (const person of enriched) {
    try {
      const companyId = await resolveCompany(supabase, person, category, companyCache, () => {
        companiesCreated += 1;
      });

      const payload = {
        company_id: companyId,
        first_name: person.firstName,
        last_name: person.lastName,
        job_title: person.jobTitle,
        seniority: person.seniority,
        department: person.department,
        email: person.email,
        phone: person.phone,
        linkedin_url: person.linkedinUrl,
        country: person.country,
        city: person.city,
        lusha_contact_id: person.contactId || null,
      };

      const { error } = await supabase
        .from("contacts")
        .upsert(payload, { onConflict: "lusha_contact_id", ignoreDuplicates: false });
      if (error) {
        // No lusha id (can't upsert on conflict) → plain insert.
        if (!person.contactId) {
          const ins = await supabase.from("contacts").insert(payload);
          if (ins.error) throw ins.error;
        } else {
          throw error;
        }
      }
      contactsImported += 1;
    } catch (err) {
      errors.push(person.fullName ?? person.contactId);
      void err;
    }
  }

  return NextResponse.json({
    imported: contactsImported,
    companiesCreated,
    skipped: errors.length,
    total: enriched.length,
  });
}

async function resolveCompany(
  supabase: SupabaseClient,
  person: LushaEnriched,
  category: "LP" | "GP" | "SP",
  cache: Map<string, string>,
  onCreate: () => void,
): Promise<string | null> {
  const name = person.companyName;
  const domain = person.companyDomain ?? domainFromUrl(person.companyDomain);
  const key = (domain ?? name ?? "").toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key)!;

  // Try existing match by domain, then by name.
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
      domain: domain ?? null,
      website: domain ? `https://${domain}` : null,
      country: person.country,
    })
    .select("id")
    .single();
  if (error || !created) return null;
  onCreate();
  cache.set(key, created.id);
  return created.id;
}
