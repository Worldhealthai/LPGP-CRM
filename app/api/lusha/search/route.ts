import { NextResponse } from "next/server";
import { lushaConfigured, lushaContactSearch, LushaError } from "@/lib/lusha";

function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string")
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

export async function POST(req: Request) {
  if (!lushaConfigured()) {
    return NextResponse.json(
      { error: "LUSHA_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const jobTitles = toList(body.jobTitles);
  const departments = toList(body.departments);
  const countries = toList(body.countries);
  const companyNames = toList(body.companyNames);
  const companyDomains = toList(body.companyDomains);

  if (
    !jobTitles.length &&
    !departments.length &&
    !companyNames.length &&
    !companyDomains.length
  ) {
    return NextResponse.json(
      { error: "Add at least one job title, department, or company to search." },
      { status: 400 },
    );
  }

  try {
    const result = await lushaContactSearch({
      jobTitles,
      departments,
      countries,
      companyNames,
      companyDomains,
      page: typeof body.page === "number" ? body.page : 0,
      size: typeof body.size === "number" ? body.size : 40,
    });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof LushaError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Lusha search failed";
    return NextResponse.json({ error: message }, { status });
  }
}
