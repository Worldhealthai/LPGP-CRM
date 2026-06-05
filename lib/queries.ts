import { getReadClient } from "./supabase/server";
import type { Category, Company, Contact, ContactWithCompany, Note } from "./types";

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
  let query = supabase
    .from("contacts")
    .select("*, company:companies(id, name, category, logo_url)")
    .order("full_name");
  if (opts.companyId) query = query.eq("company_id", opts.companyId);
  if (opts.search) query = query.ilike("full_name", `%${opts.search}%`);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as ContactWithCompany[];
}

export async function getContact(id: string): Promise<ContactWithCompany | null> {
  const supabase = getReadClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("contacts")
    .select("*, company:companies(id, name, category, logo_url)")
    .eq("id", id)
    .single();
  return (data as unknown as ContactWithCompany) ?? null;
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
