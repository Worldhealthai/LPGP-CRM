/**
 * Column mapping for spreadsheet lead imports.
 *
 * Pure and dependency-free so the mapping UI and the server importer agree on
 * exactly one definition of what a column means.
 */

export type LeadField = {
  key: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** Lowercased header spellings seen in the wild. */
  aliases: string[];
};

export const LEAD_IMPORT_FIELDS: LeadField[] = [
  {
    key: "company_name",
    label: "Company",
    required: true,
    aliases: ["company", "company name", "organisation", "organization", "firm", "account", "employer", "business"],
  },
  {
    key: "contact_name",
    label: "Contact name",
    aliases: ["name", "contact", "contact name", "full name", "person", "lead name", "prospect"],
  },
  {
    key: "first_name",
    label: "First name",
    hint: "Combined with Last name when there's no single Contact name column",
    aliases: ["first name", "firstname", "given name", "forename"],
  },
  {
    key: "last_name",
    label: "Last name",
    aliases: ["last name", "lastname", "surname", "family name"],
  },
  {
    key: "contact_title",
    label: "Job title",
    aliases: ["title", "job title", "position", "role", "designation"],
  },
  {
    key: "contact_email",
    label: "Email",
    aliases: ["email", "e-mail", "email address", "work email", "mail"],
  },
  {
    key: "contact_phone",
    label: "Phone",
    aliases: ["phone", "telephone", "tel", "mobile", "phone number", "direct dial", "contact number"],
  },
  {
    key: "linkedin_url",
    label: "LinkedIn",
    aliases: ["linkedin", "linkedin url", "linkedin profile", "li url"],
  },
  { key: "website", label: "Website", aliases: ["website", "url", "web", "domain", "company website"] },
  { key: "country", label: "Country", aliases: ["country", "location", "region", "geo"] },
  { key: "market", label: "Market", hint: "US / UK", aliases: ["market", "territory", "book"] },
  {
    key: "category",
    label: "Category",
    hint: "LP, GP or SP",
    aliases: ["category", "type", "firm type", "lp/gp/sp", "segment"],
  },
  {
    key: "value_usd",
    label: "Deal value (USD)",
    aliases: ["value", "deal value", "amount", "budget", "potential", "value usd", "opportunity"],
  },
  { key: "source", label: "Source", aliases: ["source", "lead source", "origin", "channel", "campaign"] },
  {
    key: "priority",
    label: "Priority",
    hint: "High / Normal / Low",
    aliases: ["priority", "rating", "tier", "grade"],
  },
  {
    key: "next_step",
    label: "Next step",
    aliases: ["next step", "next action", "follow up", "action", "todo"],
  },
  {
    key: "notes",
    label: "Notes",
    hint: "Saved as the lead's first note",
    aliases: ["notes", "note", "comment", "comments", "remarks", "description", "details"],
  },
];

export const LEAD_FIELD_MAP: Record<string, LeadField> = Object.fromEntries(
  LEAD_IMPORT_FIELDS.map((f) => [f.key, f]),
);

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[_\-.]+/g, " ")
    .replace(/[^a-z0-9/ ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Guess which lead field each spreadsheet column holds.
 *
 * Exact alias hits are taken first across all columns, so a sheet with both
 * "Name" and "Company Name" doesn't let the looser match steal the column the
 * exact one wanted. Returns header → field key; unmapped headers are absent.
 */
export function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const claimed = new Set<string>();
  const normalized = headers.map((h) => ({ header: h, norm: normalizeHeader(h) }));

  for (const { header, norm } of normalized) {
    if (!norm) continue;
    const field = LEAD_IMPORT_FIELDS.find((f) => f.aliases.includes(norm) || normalizeHeader(f.label) === norm);
    if (field && !claimed.has(field.key)) {
      mapping[header] = field.key;
      claimed.add(field.key);
    }
  }

  // Second pass: substring matches for anything still unclaimed.
  for (const { header, norm } of normalized) {
    if (mapping[header] || !norm) continue;
    const field = LEAD_IMPORT_FIELDS.find(
      (f) => !claimed.has(f.key) && f.aliases.some((a) => norm.includes(a) || a.includes(norm)),
    );
    if (field) {
      mapping[header] = field.key;
      claimed.add(field.key);
    }
  }

  return mapping;
}

/** A sheet row reduced to lead fields, via the chosen header → field mapping. */
export type MappedLeadRow = Record<string, string>;

export function applyMapping(
  row: Record<string, unknown>,
  mapping: Record<string, string>,
): MappedLeadRow {
  const out: MappedLeadRow = {};
  for (const [header, field] of Object.entries(mapping)) {
    if (!field) continue;
    const raw = row[header];
    if (raw == null) continue;
    const value = String(raw).trim();
    if (!value) continue;
    // Two headers can legitimately map to one field (e.g. "Mobile" and
    // "Phone"); keep the first non-empty rather than overwriting with a blank.
    if (!out[field]) out[field] = value;
  }

  // Compose a contact name when the sheet splits it in two.
  if (!out.contact_name && (out.first_name || out.last_name)) {
    out.contact_name = [out.first_name, out.last_name].filter(Boolean).join(" ");
  }
  delete out.first_name;
  delete out.last_name;

  return out;
}

export function mappedRowIsUsable(row: MappedLeadRow): boolean {
  return Boolean(row.company_name);
}
