import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getReadClient } from "./supabase/server";
import { initials as deriveInitials, normalizeInitials } from "./utils";

/**
 * Who is who, across the two systems.
 *
 * The ops panel stamps each deal with the signer's initials; the CRM knows
 * people by profile. This directory resolves both ways. Explicit initials on a
 * profile always win; initials derived from a name only fill gaps and never
 * take a pair someone has explicitly claimed.
 */
export type ProfileDirectory = {
  nameFor(id: string | null | undefined): string | null;
  nameForInitials(initials: string | null | undefined): string | null;
  initialsFor(id: string | null | undefined): string | null;
};

type Row = { id: string; full_name: string | null; email: string | null; initials: string | null };

export async function loadProfileDirectory(
  client: SupabaseClient | null = getReadClient(),
): Promise<ProfileDirectory> {
  const rows: Row[] = client
    ? (((await client.from("profiles").select("id, full_name, email, initials")).data as Row[]) ?? [])
    : [];

  const byId = new Map<string, Row>();
  const byInitials = new Map<string, Row>();
  for (const r of rows) {
    byId.set(r.id, r);
    const explicit = normalizeInitials(r.initials);
    if (explicit) byInitials.set(explicit, r);
  }
  for (const r of rows) {
    if (normalizeInitials(r.initials)) continue;
    const derived = r.full_name ? normalizeInitials(deriveInitials(r.full_name)) : "";
    if (derived && !byInitials.has(derived)) byInitials.set(derived, r);
  }

  const display = (r: Row | undefined) =>
    r ? r.full_name || r.email || null : null;

  return {
    nameFor: (id) => (id ? display(byId.get(id)) : null),
    nameForInitials: (v) => {
      const key = normalizeInitials(v);
      return key ? display(byInitials.get(key)) : null;
    },
    initialsFor: (id) => {
      const r = id ? byId.get(id) : undefined;
      if (!r) return null;
      return normalizeInitials(r.initials) || (r.full_name ? normalizeInitials(deriveInitials(r.full_name)) : null) || null;
    },
  };
}
