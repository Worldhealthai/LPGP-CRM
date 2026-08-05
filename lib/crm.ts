import { getReadClient } from "./supabase/server";
import type { Lead, LeadOwner, LeadWithRefs, Profile } from "./types";

export async function listProfiles(): Promise<Profile[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .order("full_name");
  return (data as Profile[]) ?? [];
}

async function hydrate(
  supabase: NonNullable<ReturnType<typeof getReadClient>>,
  leads: Lead[],
): Promise<LeadWithRefs[]> {
  const ownerIds = [...new Set(leads.map((l) => l.owner_id).filter(Boolean))] as string[];
  const companyIds = [...new Set(leads.map((l) => l.company_id).filter(Boolean))] as string[];

  const owners = new Map<string, LeadOwner>();
  if (ownerIds.length) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ownerIds);
    for (const o of data ?? []) owners.set(o.id, o as LeadOwner);
  }

  const companies = new Map<string, LeadWithRefs["company"]>();
  if (companyIds.length) {
    const { data } = await supabase
      .from("companies")
      .select("id, name, category, domain")
      .in("id", companyIds);
    for (const c of data ?? []) companies.set(c.id, c as LeadWithRefs["company"]);
  }

  return leads.map((l) => ({
    ...l,
    owner: l.owner_id ? owners.get(l.owner_id) ?? null : null,
    company: l.company_id ? companies.get(l.company_id) ?? null : null,
  }));
}

export async function listLeads(): Promise<LeadWithRefs[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return hydrate(supabase, data as Lead[]);
}

export async function getLead(id: string): Promise<LeadWithRefs | null> {
  const supabase = getReadClient();
  if (!supabase) return null;
  const { data } = await supabase.from("leads").select("*").eq("id", id).single();
  if (!data) return null;
  const [hydrated] = await hydrate(supabase, [data as Lead]);
  return hydrated ?? null;
}
