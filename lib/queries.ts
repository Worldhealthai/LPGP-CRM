import { getReadClient } from "./supabase/server";
import type { Category, Company, Contact, ContactWithCompany, Fund, Note } from "./types";

export type CategoryCounts = Record<Category, number> & { total: number };

export async function getCategoryCounts(): Promise<CategoryCounts> {
  const empty: CategoryCounts = { LP: 0, GP: 0, SP: 0, total: 0 };
  const supabase = getReadClient();
  if (!supabase) return empty;
  const { data, error } = await supabase.from("companies").select("category");
  if (error || !data) return empty;
  const counts = { ...empty };
  for (const row of data as { category: Category }[]) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
    counts.total += 1;
  }
  return counts;
}

export async function getContactCount(): Promise<number> {
  const supabase = getReadClient();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function listCompanies(opts: {
  category?: Category;
  search?: string;
} = {}): Promise<Company[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  let query = supabase.from("companies").select("*").order("name");
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.search) query = query.ilike("name", `%${opts.search}%`);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Company[];
}

export async function listPortfolioCompanies(): Promise<Company[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("in_portfolio", true)
    .order("name");
  if (error || !data) return [];
  return data as Company[];
}

export async function getCompany(id: string): Promise<Company | null> {
  const supabase = getReadClient();
  if (!supabase) return null;
  const { data } = await supabase.from("companies").select("*").eq("id", id).single();
  return (data as Company) ?? null;
}

export async function listContacts(opts: {
  search?: string;
  companyId?: string;
} = {}): Promise<ContactWithCompany[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  // Fetch contacts plainly (no embed) so a join quirk can never drop rows,
  // then attach company data in JS.
  let query = supabase.from("contacts").select("*").order("full_name");
  if (opts.companyId) query = query.eq("company_id", opts.companyId);
  if (opts.search) query = query.ilike("full_name", `%${opts.search}%`);
  const { data, error } = await query;
  if (error || !data) return [];

  const contacts = data as Contact[];
  const companyIds = [...new Set(contacts.map((c) => c.company_id).filter(Boolean))] as string[];
  const companyMap = new Map<string, ContactWithCompany["company"]>();
  if (companyIds.length) {
    const { data: companies } = await supabase
      .from("companies")
      .select("id, name, category, logo_url")
      .in("id", companyIds);
    for (const co of companies ?? []) {
      companyMap.set(co.id, co as ContactWithCompany["company"]);
    }
  }

  return contacts.map((c) => ({
    ...c,
    company: c.company_id ? companyMap.get(c.company_id) ?? null : null,
  }));
}

export async function getContact(id: string): Promise<ContactWithCompany | null> {
  const supabase = getReadClient();
  if (!supabase) return null;
  const { data } = await supabase.from("contacts").select("*").eq("id", id).single();
  if (!data) return null;
  const contact = data as Contact;
  let company: ContactWithCompany["company"] = null;
  if (contact.company_id) {
    const { data: co } = await supabase
      .from("companies")
      .select("id, name, category, logo_url")
      .eq("id", contact.company_id)
      .single();
    company = (co as ContactWithCompany["company"]) ?? null;
  }
  return { ...contact, company };
}

export async function getContactsForCompany(companyId: string): Promise<Contact[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("company_id", companyId)
    .order("full_name");
  return (data as Contact[]) ?? [];
}

export async function getFundsForCompany(companyId: string): Promise<Fund[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("funds")
    .select("*")
    .eq("company_id", companyId)
    .order("vintage_year", { ascending: false, nullsFirst: false });
  if (error || !data) return [];
  return data as Fund[];
}

export async function getNotes(
  entityType: "company" | "contact",
  entityId: string,
): Promise<Note[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  return (data as Note[]) ?? [];
}
