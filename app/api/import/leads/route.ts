import { NextResponse } from "next/server";
import { getAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";
import { importLeadRows } from "@/lib/lead-import";
import type { MappedLeadRow } from "@/lib/lead-import-fields";

const MAX_ROWS = 5_000;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

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

  const rows = body.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows to import." }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows (${rows.length}). Split the file into batches of ${MAX_ROWS}.` },
      { status: 413 },
    );
  }

  // Admins may import on someone else's behalf; everyone else owns what they import.
  const requestedOwner = typeof body.ownerId === "string" ? body.ownerId : null;
  const ownerId = user.role === "admin" && requestedOwner ? requestedOwner : user.id;

  const result = await importLeadRows(supabase, rows as MappedLeadRow[], {
    ownerId,
    defaultMarket: typeof body.defaultMarket === "string" ? body.defaultMarket : null,
    defaultSource: typeof body.defaultSource === "string" ? body.defaultSource : null,
    defaultStage: typeof body.defaultStage === "string" ? body.defaultStage : "New",
    skipDuplicates: body.skipDuplicates !== false,
    checkOpsPanel: body.checkOpsPanel !== false,
    filename: typeof body.filename === "string" ? body.filename : null,
    mapping: (body.mapping as Record<string, string>) ?? {},
  });

  return NextResponse.json(result);
}
