"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "./supabase/admin";
import { getSessionUser } from "./auth";
import { normalizeInitials } from "./utils";

export type ProfileResult = { ok: boolean; error?: string; initials?: string | null };

/**
 * Set the initials a person signs deals with in the ops panel.
 *
 * Admins can set anyone's; everyone can set their own. Uniqueness is enforced
 * by the database (case-insensitive), so two people can never share a pair —
 * "who signed this?" must have one answer.
 */
export async function setProfileInitials(
  profileId: string,
  initials: string,
): Promise<ProfileResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (user.role !== "admin" && user.id !== profileId) {
    return { ok: false, error: "Only admins can set someone else's initials." };
  }
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Supabase service role not configured" };

  const clean = normalizeInitials(initials);
  if (clean.length > 4) return { ok: false, error: "Initials are at most four letters." };

  const { error } = await supabase
    .from("profiles")
    .update({ initials: clean || null })
    .eq("id", profileId);
  if (error) {
    // 23505 is the unique-index violation.
    if (error.code === "23505") {
      return { ok: false, error: `${clean} is already taken by someone else.` };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/events");
  return { ok: true, initials: clean || null };
}
