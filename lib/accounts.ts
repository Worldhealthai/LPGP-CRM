import { getReadClient } from "./supabase/server";
import type {
  Account,
  AccountContact,
  AccountWithRefs,
  LeadOwner,
} from "./types";

/**
 * Accounts are sponsors we've won — the record a points-of-contact list, an
 * activity history and the ops-panel event allocations all hang off.
 */

async function hydrateAccounts(
  supabase: NonNullable<ReturnType<typeof getReadClient>>,
  accounts: Account[],
): Promise<AccountWithRefs[]> {
  if (!accounts.length) return [];
  const ownerIds = [...new Set(accounts.map((a) => a.owner_id).filter(Boolean))] as string[];
  const ids = accounts.map((a) => a.id);

  const [ownersRes, contactsRes] = await Promise.all([
    ownerIds.length
      ? supabase.from("profiles").select("id, full_name, email").in("id", ownerIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
    supabase.from("account_contacts").select("*").in("account_id", ids),
  ]);

  const owners = new Map<string, LeadOwner>();
  for (const o of ownersRes.data ?? []) owners.set(o.id, o as LeadOwner);

  const counts = new Map<string, number>();
  const primaries = new Map<string, AccountContact>();
  for (const c of (contactsRes.data ?? []) as AccountContact[]) {
    counts.set(c.account_id, (counts.get(c.account_id) ?? 0) + 1);
    // Fall back to the first contact when nobody is flagged primary, so the
    // list always has someone to call.
    const held = primaries.get(c.account_id);
    if (!held || (c.is_primary && !held.is_primary)) primaries.set(c.account_id, c);
  }

  return accounts.map((a) => ({
    ...a,
    owner: a.owner_id ? owners.get(a.owner_id) ?? null : null,
    contact_count: counts.get(a.id) ?? 0,
    primary_contact: primaries.get(a.id) ?? null,
  }));
}

export async function listAccounts(): Promise<AccountWithRefs[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data } = await supabase.from("accounts").select("*").order("name");
  return hydrateAccounts(supabase, (data as Account[]) ?? []);
}

export async function getAccount(id: string): Promise<AccountWithRefs | null> {
  const supabase = getReadClient();
  if (!supabase) return null;
  const { data } = await supabase.from("accounts").select("*").eq("id", id).single();
  if (!data) return null;
  const [hydrated] = await hydrateAccounts(supabase, [data as Account]);
  return hydrated ?? null;
}

export async function listAccountContacts(accountId: string): Promise<AccountContact[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("account_contacts")
    .select("*")
    .eq("account_id", accountId)
    // Primary first, then alphabetical — the person to call is always on top.
    .order("is_primary", { ascending: false })
    .order("full_name");
  return (data as AccountContact[]) ?? [];
}

/** Lightweight list for pickers ("attach this lead to an account"). */
export async function listAccountsLite(): Promise<{ id: string; name: string }[]> {
  const supabase = getReadClient();
  if (!supabase) return [];
  const { data } = await supabase.from("accounts").select("id, name").order("name");
  return (data as { id: string; name: string }[]) ?? [];
}

export const ACCOUNT_STATUSES = ["Active", "Renewal due", "Prospect", "Churned"] as const;
export const ACCOUNT_TIERS = ["Platinum", "Gold", "Silver", "Bronze"] as const;
export const ACCOUNT_HEALTH = ["Healthy", "At risk", "Critical"] as const;
export const CONTACT_ROLES = [
  "Primary",
  "Billing",
  "Marketing",
  "Speaker liaison",
  "Legal",
  "Assistant",
  "Other",
] as const;
