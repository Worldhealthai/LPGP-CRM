import { NextResponse } from "next/server";
import { getReadClient } from "@/lib/supabase/server";

export type PaletteHit = {
  kind: "lead" | "account" | "company" | "contact";
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
};

/**
 * One search across everything the command palette can jump to.
 *
 * Kept separate from /api/search (which backs the intelligence-database
 * search page and returns richer company/contact shapes) because the palette
 * wants a flat, uniform, jump-to list.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // These characters have meaning in PostgREST's or() filter syntax.
  const q = (searchParams.get("q") ?? "").replace(/[,()*%]/g, " ").trim();
  if (q.length < 2) return NextResponse.json({ hits: [] as PaletteHit[] });

  const supabase = getReadClient();
  if (!supabase) return NextResponse.json({ hits: [] as PaletteHit[] });

  const like = `%${q}%`;
  const [leads, accounts, companies, contacts] = await Promise.all([
    supabase
      .from("leads")
      .select("id, company_name, contact_name, stage")
      .or(`company_name.ilike.${like},contact_name.ilike.${like}`)
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("accounts")
      .select("id, name, status, tier")
      .ilike("name", like)
      .order("name")
      .limit(5),
    supabase
      .from("companies")
      .select("id, name, category, sub_type")
      .ilike("name", like)
      .order("name")
      .limit(5),
    supabase
      .from("contacts")
      .select("id, full_name, job_title")
      .ilike("full_name", like)
      .order("full_name")
      .limit(4),
  ]);

  const hits: PaletteHit[] = [
    ...(accounts.data ?? []).map((a) => ({
      kind: "account" as const,
      id: a.id as string,
      title: a.name as string,
      subtitle: [a.status, a.tier].filter(Boolean).join(" · ") || null,
      href: `/accounts/${a.id}`,
    })),
    ...(leads.data ?? []).map((l) => ({
      kind: "lead" as const,
      id: l.id as string,
      title: (l.company_name as string | null) ?? "Untitled lead",
      subtitle: [l.contact_name, l.stage].filter(Boolean).join(" · ") || null,
      href: `/leads/${l.id}`,
    })),
    ...(companies.data ?? []).map((c) => ({
      kind: "company" as const,
      id: c.id as string,
      title: c.name as string,
      subtitle: [c.category, c.sub_type].filter(Boolean).join(" · ") || null,
      href: `/companies/${c.id}`,
    })),
    ...(contacts.data ?? []).map((c) => ({
      kind: "contact" as const,
      id: c.id as string,
      title: (c.full_name as string | null) ?? "Unnamed",
      subtitle: (c.job_title as string | null) ?? null,
      href: `/contacts/${c.id}`,
    })),
  ];

  return NextResponse.json({ hits });
}
