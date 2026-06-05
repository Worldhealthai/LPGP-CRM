import { NextResponse } from "next/server";
import { getReadClient } from "@/lib/supabase/server";
import { toCsv, csvResponse, type CsvValue } from "@/lib/csv";
import { isCategory } from "@/lib/categories";
import type { Company } from "@/lib/types";

export async function GET(req: Request) {
  const supabase = getReadClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const params = new URL(req.url).searchParams;
  const category = params.get("category");
  const portfolioOnly = params.get("portfolio") === "1";

  let query = supabase.from("companies").select("*").order("name");
  if (isCategory(category)) query = query.eq("category", category);
  if (portfolioOnly) query = query.eq("in_portfolio", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as Company[];

  const headers = [
    "Name",
    "Category",
    "Type",
    "Region",
    "Status",
    "Country",
    "City",
    "HQ",
    "Website",
    "Domain",
    "LinkedIn",
    "AUM (USD)",
    "Employees",
    "Active Funds",
    "Check Size",
    "Preferred Stages",
    "Geographic Focus",
    "Allocations",
    "In Portfolio",
  ];
  const out: CsvValue[][] = rows.map((c) => [
    c.name,
    c.category,
    c.sub_type,
    c.region,
    c.status,
    c.country,
    c.city,
    c.hq_location,
    c.website,
    c.domain,
    c.linkedin_url,
    c.aum_usd,
    c.employee_range,
    c.active_funds,
    c.check_size,
    c.preferred_stages,
    c.geographic_focus,
    Array.isArray(c.allocations)
      ? c.allocations.map((a) => `${a.label}:${a.value}%`).join("; ")
      : "",
    c.in_portfolio ? "Yes" : "No",
  ]);

  const date = new Date().toISOString().slice(0, 10);
  const name = portfolioOnly ? `lpgp-portfolio-${date}.csv` : `lpgp-companies-${date}.csv`;
  return csvResponse(name, toCsv(headers, out));
}
