import { NextResponse } from "next/server";
import { lushaConfigured, lushaContactEnrich, LushaError, type LushaEnriched } from "@/lib/lusha";
import { getAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { isCategory } from "@/lib/categories";
import { importContactRows, type ImportRow } from "@/lib/import";

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

  const rows: ImportRow[] = enriched.map((p) => ({
    firstName: p.firstName,
    lastName: p.lastName,
    jobTitle: p.jobTitle,
    seniority: p.seniority,
    department: p.department,
    email: p.email,
    phone: p.phone,
    linkedinUrl: p.linkedinUrl,
    country: p.country,
    city: p.city,
    companyName: p.companyName,
    companyDomain: p.companyDomain,
    lushaContactId: p.contactId || null,
  }));

  const result = await importContactRows(supabase, rows, category);
  return NextResponse.json(result);
}
