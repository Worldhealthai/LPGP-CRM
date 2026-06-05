import { NextResponse } from "next/server";
import { getReadClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export type SearchCompany = {
  id: string;
  name: string;
  category: Category;
  sub_type: string | null;
  domain: string | null;
  country: string | null;
};

export type SearchContact = {
  id: string;
  full_name: string | null;
  job_title: string | null;
  email: string | null;
  country: string | null;
  company: { id: string; name: string; category: Category } | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Strip characters that have meaning in PostgREST's or() filter syntax.
  const q = (searchParams.get("q") ?? "").replace(/[,()*%]/g, " ").trim();
  if (q.length < 2) {
    return NextResponse.json({ companies: [], contacts: [], q });
  }

  const supabase = getReadClient();
  if (!supabase) {
    return NextResponse.json({ companies: [], contacts: [], q, configured: false });
  }

  const like = `%${q}%`;
  const [companiesRes, contactsRes] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, category, sub_type, domain, country")
      .or(`name.ilike.${like},sub_type.ilike.${like},country.ilike.${like}`)
      .order("name")
      .limit(8),
    supabase
      .from("contacts")
      .select("id, full_name, job_title, email, country, company:companies(id, name, category)")
      .or(`full_name.ilike.${like},job_title.ilike.${like},email.ilike.${like}`)
      .order("full_name")
      .limit(8),
  ]);

  return NextResponse.json({
    q,
    companies: (companiesRes.data as SearchCompany[]) ?? [],
    contacts: (contactsRes.data as unknown as SearchContact[]) ?? [],
  });
}
