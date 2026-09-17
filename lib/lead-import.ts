import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isCategory } from "./categories";
import { isLeadStage, marketFromCountry } from "./pipeline";
import { listOpsCompanies, isOpsConfigured } from "./ops";
import { opsMatchKey, type OpsCompanySlim } from "./ops-types";
import type { MappedLeadRow } from "./lead-import-fields";

export type LeadImportOptions = {
  ownerId: string;
  /** Applied when a row has no market of its own. */
  defaultMarket?: string | null;
  defaultSource?: string | null;
  defaultStage?: string;
  /** Skip rows whose company already has a lead. */
  skipDuplicates: boolean;
  /** Check imported companies against the ops panel and link exact matches. */
  checkOpsPanel: boolean;
  filename?: string | null;
  mapping: Record<string, string>;
};

export type LeadImportResult = {
  total: number;
  created: number;
  skipped: number;
  duplicates: number;
  opsLinked: number;
  /** Company names that matched a deal already in the ops panel. */
  opsMatches: { company: string; opsCompany: string; events: string[] }[];
  importId: string | null;
  errors: string[];
};

function clean(v: string | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function toNumber(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function normalizePriority(v: string | undefined): string {
  const t = (v ?? "").trim().toLowerCase();
  if (["high", "hot", "a", "1", "p1"].includes(t)) return "High";
  if (["low", "cold", "c", "3", "p3"].includes(t)) return "Low";
  return "Normal";
}

function normalizeMarket(v: string | undefined, country: string | null): string | null {
  const t = (v ?? "").trim();
  if (t) {
    const upper = t.toUpperCase();
    if (upper === "US" || upper === "USA" || upper === "UNITED STATES") return "US";
    if (["UK", "GB", "UNITED KINGDOM", "ENGLAND"].includes(upper)) return "UK";
    return t;
  }
  return marketFromCountry(country);
}

/**
 * Write mapped spreadsheet rows as leads.
 *
 * Rows are inserted in batches and every import gets a `lead_imports` row, so
 * a bad file can be traced (and its leads found) after the fact.
 */
export async function importLeadRows(
  supabase: SupabaseClient,
  rows: MappedLeadRow[],
  opts: LeadImportOptions,
): Promise<LeadImportResult> {
  const result: LeadImportResult = {
    total: rows.length,
    created: 0,
    skipped: 0,
    duplicates: 0,
    opsLinked: 0,
    opsMatches: [],
    importId: null,
    errors: [],
  };

  // Record the batch first so every lead can point back at it.
  const { data: batch } = await supabase
    .from("lead_imports")
    .insert({
      filename: opts.filename ?? null,
      row_count: rows.length,
      mapping: opts.mapping,
      owner_id: opts.ownerId,
    })
    .select("id")
    .single();
  const importId = (batch?.id as string) ?? null;
  result.importId = importId;

  // Existing pipeline companies, for the duplicate check. One query beats one
  // per row on a 2,000-line sheet.
  const existing = new Set<string>();
  if (opts.skipDuplicates) {
    const { data } = await supabase.from("leads").select("company_name").limit(20_000);
    for (const r of data ?? []) {
      const name = r.company_name as string | null;
      if (name) existing.add(opsMatchKey(name));
    }
  }

  // Companies already in the intelligence database, to link leads to profiles.
  const companyByKey = new Map<string, { id: string; category: string | null }>();
  {
    const { data } = await supabase.from("companies").select("id, name, category").limit(20_000);
    for (const c of data ?? []) {
      const key = opsMatchKey(c.name as string);
      if (key && !companyByKey.has(key)) {
        companyByKey.set(key, { id: c.id as string, category: (c.category as string) ?? null });
      }
    }
  }

  const stage = opts.defaultStage && isLeadStage(opts.defaultStage) ? opts.defaultStage : "New";
  const seenInFile = new Set<string>();
  const payloads: Record<string, unknown>[] = [];
  const noteByKey = new Map<string, string>();

  for (const row of rows) {
    const companyName = clean(row.company_name);
    if (!companyName) {
      result.skipped++;
      continue;
    }
    const key = opsMatchKey(companyName);

    // Duplicates within the same file are as unhelpful as duplicates against
    // the pipeline, so both are caught here.
    if (opts.skipDuplicates && (existing.has(key) || seenInFile.has(key))) {
      result.duplicates++;
      continue;
    }
    seenInFile.add(key);

    const country = clean(row.country);
    const rowCategory = clean(row.category)?.toUpperCase();
    const dbCompany = companyByKey.get(key);
    const category =
      rowCategory && isCategory(rowCategory)
        ? rowCategory
        : dbCompany?.category && isCategory(dbCompany.category)
          ? dbCompany.category
          : null;

    payloads.push({
      owner_id: opts.ownerId,
      company_id: dbCompany?.id ?? null,
      company_name: companyName,
      category,
      contact_name: clean(row.contact_name),
      contact_title: clean(row.contact_title),
      contact_email: clean(row.contact_email),
      contact_phone: clean(row.contact_phone),
      linkedin_url: clean(row.linkedin_url),
      website: clean(row.website),
      country,
      market: normalizeMarket(row.market, country) ?? opts.defaultMarket ?? null,
      stage,
      value_usd: toNumber(row.value_usd),
      source: clean(row.source) ?? opts.defaultSource ?? null,
      priority: normalizePriority(row.priority),
      next_step: clean(row.next_step),
      import_id: importId,
    });

    const note = clean(row.notes);
    if (note) noteByKey.set(companyName, note);
  }

  // Insert in chunks — one 2,000-row statement is a timeout waiting to happen.
  const CHUNK = 250;
  const inserted: { id: string; company_name: string | null }[] = [];
  for (let i = 0; i < payloads.length; i += CHUNK) {
    const slice = payloads.slice(i, i + CHUNK);
    const { data, error } = await supabase.from("leads").insert(slice).select("id, company_name");
    if (error) {
      result.errors.push(error.message);
      result.skipped += slice.length;
      continue;
    }
    inserted.push(...((data as { id: string; company_name: string | null }[]) ?? []));
  }
  result.created = inserted.length;

  // Notes ride along as the lead's first note.
  const noteRows = inserted
    .filter((l) => l.company_name && noteByKey.has(l.company_name))
    .map((l) => ({
      entity_type: "lead" as const,
      entity_id: l.id,
      body: noteByKey.get(l.company_name as string) as string,
      author: "Spreadsheet import",
    }));
  if (noteRows.length) await supabase.from("notes").insert(noteRows);

  if (opts.checkOpsPanel && inserted.length) {
    await linkExactOpsMatches(supabase, inserted, opts.ownerId, result);
  }

  await supabase
    .from("lead_imports")
    .update({ created_count: result.created, skipped_count: result.skipped + result.duplicates })
    .eq("id", importId);

  return result;
}

/**
 * Flag freshly-imported leads that are already sponsors.
 *
 * Deliberately exact-key only: a bulk run shouldn't create fuzzy links nobody
 * reviewed. Anything short of an exact match is left for the per-lead notice,
 * where a human confirms it.
 */
async function linkExactOpsMatches(
  supabase: SupabaseClient,
  leads: { id: string; company_name: string | null }[],
  ownerId: string,
  result: LeadImportResult,
): Promise<void> {
  if (!isOpsConfigured()) return;
  const index = await listOpsCompanies();
  if (!index.ok) {
    result.errors.push(`Ops panel check skipped — ${index.error}`);
    return;
  }

  const byKey = new Map<string, OpsCompanySlim>();
  for (const c of index.data) {
    const key = c.normalized || opsMatchKey(c.company);
    if (key) byKey.set(key, c);
  }

  const links: Record<string, unknown>[] = [];
  for (const lead of leads) {
    if (!lead.company_name) continue;
    const match = byKey.get(opsMatchKey(lead.company_name));
    if (!match) continue;

    result.opsMatches.push({
      company: lead.company_name,
      opsCompany: match.company,
      events: match.events.map((e) => e.event_name),
    });

    // The slim index carries no per-deal payload, so snapshot the company-level
    // rollup; a later Sync fills in full deal detail.
    for (const dealId of match.events.flatMap((e) => e.deal_ids)) {
      links.push({
        entity_type: "lead",
        entity_id: lead.id,
        ops_deal_id: dealId,
        ops_company: match.company,
        confidence: 1,
        snapshot: { company_totals: match.totals, company_events: match.events },
        linked_by: ownerId,
      });
    }
  }

  if (!links.length) return;
  const { error } = await supabase
    .from("ops_links")
    .upsert(links, { onConflict: "entity_type,entity_id,ops_deal_id" });
  if (error) result.errors.push(`Could not save ops links — ${error.message}`);
  else result.opsLinked = result.opsMatches.length;
}
