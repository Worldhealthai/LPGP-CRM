import "server-only";
import { cache } from "react";
import { createSupabaseServerClient, authConfigured } from "./supabase/auth-server";

export type Role = "admin" | "member";
export type SessionUser = { id: string; email: string; name: string; role: Role };

export function isAuthConfigured(): boolean {
  return authConfigured();
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// Short-lived per-instance cache of profile name/role so warm navigations skip
// the profiles query. Role changes propagate within a minute.
const profileCache = new Map<string, { name: string | null; role: Role; at: number }>();
const PROFILE_TTL_MS = 60_000;

type ClaimsFn = () => Promise<{
  data: { claims: Record<string, unknown> } | null;
  error: unknown;
}>;

/**
 * The signed-in user (with profile role), or null when signed out / not
 * configured. Admin is granted by profiles.role='admin' OR an email listed in
 * the ADMIN_EMAILS env var (handy for bootstrapping the first admin).
 *
 * Perf: wrapped in React cache() (one lookup per request across layout, page
 * and actions), prefers locally-verified JWT claims over a network getUser()
 * where the SDK supports it, and caches the profile row for 60s.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  let userId: string | null = null;
  let email = "";

  // Fast path: JWT claims verified against the project's public signing keys —
  // no auth-server round-trip on projects with asymmetric keys.
  try {
    const getClaims = (supabase.auth as unknown as { getClaims?: ClaimsFn }).getClaims;
    if (typeof getClaims === "function") {
      const { data, error } = await getClaims.call(supabase.auth);
      const claims = data?.claims;
      if (!error && claims && typeof claims.sub === "string") {
        userId = claims.sub;
        if (typeof claims.email === "string") email = claims.email;
      }
    }
  } catch {
    /* fall through to getUser */
  }

  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    userId = user.id;
    email = user.email ?? "";
  }

  let name = email ? email.split("@")[0] : "User";
  let role: Role = "member";

  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.at < PROFILE_TTL_MS) {
    if (cached.name) name = cached.name;
    role = cached.role;
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userId)
      .single();
    const pName = (profile?.full_name as string | null) ?? null;
    const pRole: Role = profile?.role === "admin" ? "admin" : "member";
    profileCache.set(userId, { name: pName, role: pRole, at: Date.now() });
    if (pName) name = pName;
    role = pRole;
  }

  if (email && adminEmails().includes(email.toLowerCase())) role = "admin";

  return { id: userId, email, name, role };
});
