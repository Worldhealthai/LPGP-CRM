import { NextResponse } from "next/server";
import { getReadClient } from "@/lib/supabase/server";
import { toCsv, csvResponse, type CsvValue } from "@/lib/csv";
import { isCategory } from "@/lib/categories";

type Row = {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  job_title: string | null;
  seniority: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  country: string | null;
  city: string | null;
  priority: string | null;
  status: string | null;
  last_contacted: string | null;
  relationship_strength: number | null;
  company: { name: string | null; category: string | null } | null;
};

export async function GET(req: Request) {
  const supabase = getReadClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }
  const category = new URL(req.url).searchParams.get("category");

  const { data, error } = await supabase
    .from("contacts")
    .select(
      "first_name,last_name,full_name,job_title,seniority,department,email,phone,linkedin_url,country,city,priority,status,last_contacted,relationship_strength,company:companies(name,category)",
    )
    .order("full_name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = (data ?? []) as unknown as Row[];
  if (isCategory(category)) rows = rows.filter((r) => r.company?.category === category);

  const headers = [
    "First Name",
    "Last Name",
    "Full Name",
    "Job Title",
    "Seniority",
    "Department",
    "Email",
    "Phone",
    "LinkedIn",
    "Country",
    "City",
    "Company",
    "Category",
    "Priority",
    "Status",
    "Last Contacted",
    "Relationship (0-5)",
  ];
  const out: CsvValue[][] = rows.map((r) => [
    r.first_name,
    r.last_name,
    r.full_name,
    r.job_title,
    r.seniority,
    r.department,
    r.email,
    r.phone,
    r.linkedin_url,
    r.country,
    r.city,
    r.company?.name ?? null,
    r.company?.category ?? null,
    r.priority,
    r.status,
    r.last_contacted,
    r.relationship_strength,
  ]);

  const date = new Date().toISOString().slice(0, 10);
  return csvResponse(`lpgp-contacts-${date}.csv`, toCsv(headers, out));
}
