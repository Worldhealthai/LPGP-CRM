import { NextResponse } from "next/server";
import { lushaConfigured, lushaContactSearch, LushaError } from "@/lib/lusha";

// People lookup against Lusha for the dashboard search box. Triggered
// explicitly (not on every keystroke) so it doesn't burn Lusha credits.
export async function GET(req: Request) {
  if (!lushaConfigured()) {
    return NextResponse.json(
      { error: "LUSHA_API_KEY is not configured on the server.", configured: false },
      { status: 503 },
    );
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ requestId: null, contacts: [], q });
  }

  try {
    const result = await lushaContactSearch({ names: [q], size: 10 });
    return NextResponse.json({
      requestId: result.requestId,
      total: result.total,
      contacts: result.contacts,
      q,
    });
  } catch (err) {
    const status = err instanceof LushaError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Lusha search failed";
    return NextResponse.json({ error: message }, { status });
  }
}
