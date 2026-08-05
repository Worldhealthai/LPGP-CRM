import "server-only";
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

/**
 * The signed-in user (with profile role), or null when signed out / not
 * configured. Admin is granted by profiles.role='admin' OR an email listed in
 * the ADMIN_EMAILS env var (handy for bootstrapping the first admin).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const email = user.email ?? "";
  let name = email ? email.split("@")[0] : "User";
  let role: Role = "member";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();
  if (profile) {
    if (profile.full_name) name = profile.full_name;
    if (profile.role === "admin") role = "admin";
  }
  if (email && adminEmails().includes(email.toLowerCase())) role = "admin";

  return { id: user.id, email, name, role };
}
