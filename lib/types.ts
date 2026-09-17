import type { LeadStage } from "./pipeline";

export type Category = "LP" | "GP" | "SP";

export type Allocation = { label: string; value: number };

export type Company = {
  id: string;
  name: string;
  category: Category;
  sub_type: string | null;
  domain: string | null;
  website: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  hq_location: string | null;
  employee_range: string | null;
  aum: string | null;
  lusha_company_id: string | null;
  // Profile / visualization fields (migration 0002)
  aum_usd: number | null;
  region: string | null;
  status: string | null;
  investment_thesis: string | null;
  check_size: string | null;
  preferred_stages: string | null;
  geographic_focus: string | null;
  active_funds: number | null;
  allocations: Allocation[];
  in_portfolio: boolean;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  company_id: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  job_title: string | null;
  seniority: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  country: string | null;
  city: string | null;
  lusha_contact_id: string | null;
  // Relationship fields (migration 0003)
  relationship_strength: number | null;
  priority: string | null;
  status: string | null;
  last_contacted: string | null;
  created_at: string;
  updated_at: string;
};

export type Fund = {
  id: string;
  company_id: string | null;
  name: string;
  vintage_year: number | null;
  fund_size_usd: number | null;
  target_size_usd: number | null;
  strategy: string | null;
  geography: string | null;
  status: string | null;
  created_at: string;
};

export type FundManager = { id: string; name: string; category: Category; domain: string | null };
export type FundWithManager = Fund & { manager: FundManager | null };

export type Commitment = {
  id: string;
  lp_company_id: string | null;
  fund_id: string | null;
  amount_usd: number | null;
  commitment_date: string | null;
  created_at: string;
};

// A commitment as seen from a fund (which LP committed).
export type FundCommitment = {
  id: string;
  amount_usd: number | null;
  commitment_date: string | null;
  lp: { id: string; name: string; category: Category } | null;
};

// A commitment as seen from an LP (which fund they backed).
export type LpCommitment = {
  id: string;
  amount_usd: number | null;
  commitment_date: string | null;
  fund: FundWithManager | null;
};

// A service provider used by a client (GP/LP).
export type ProviderLink = {
  id: string;
  role: string | null;
  provider: { id: string; name: string; category: Category; sub_type: string | null; domain: string | null } | null;
};

// A client served by a provider (SP).
export type ClientLink = {
  id: string;
  role: string | null;
  client: { id: string; name: string; category: Category; domain: string | null } | null;
};

export type Note = {
  id: string;
  entity_type: "company" | "contact" | "lead";
  entity_id: string;
  body: string;
  author: string | null;
  created_at: string;
};

export type ContactWithCompany = Contact & {
  company: Pick<Company, "id" | "name" | "category" | "logo_url"> | null;
};

// --- CRM leads -------------------------------------------------------------
export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
};

export type Lead = {
  id: string;
  owner_id: string | null;
  company_id: string | null;
  company_name: string | null;
  category: Category | null;
  contact_name: string | null;
  contact_title: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  linkedin_url: string | null;
  market: string | null;
  stage: LeadStage;
  value_usd: number | null;
  source: string | null;
  next_step: string | null;
  next_step_date: string | null;
  // Sales workflow (migration 0008)
  title: string | null;
  disposition: string | null;
  callback_at: string | null;
  last_activity_at: string | null;
  call_count: number;
  do_not_call: boolean;
  priority: string;
  website: string | null;
  country: string | null;
  import_id: string | null;
  account_id: string | null;
  ops_deal_id: number | null;
  ops_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadOwner = { id: string; full_name: string | null; email: string | null };

export type LeadWithRefs = Lead & {
  owner: LeadOwner | null;
  company: { id: string; name: string; category: Category; domain: string | null } | null;
};

// --- Accounts (sponsors) ---------------------------------------------------
export type Account = {
  id: string;
  company_id: string | null;
  name: string;
  category: Category | null;
  owner_id: string | null;
  status: string;
  tier: string | null;
  health: string | null;
  domain: string | null;
  website: string | null;
  linkedin_url: string | null;
  hq_location: string | null;
  country: string | null;
  ops_company: string | null;
  first_sponsored_year: number | null;
  renewal_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AccountContact = {
  id: string;
  account_id: string;
  contact_id: string | null;
  full_name: string;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  linkedin_url: string | null;
  role: string | null;
  is_primary: boolean;
  last_contacted: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AccountWithRefs = Account & {
  owner: LeadOwner | null;
  contact_count: number;
  primary_contact: AccountContact | null;
};

// --- Activity log ----------------------------------------------------------
export type ActivityType = "call" | "email" | "meeting" | "linkedin" | "note" | "task";

export type Activity = {
  id: string;
  type: ActivityType;
  outcome: string | null;
  subject: string | null;
  body: string | null;
  duration_seconds: number | null;
  occurred_at: string;
  owner_id: string | null;
  lead_id: string | null;
  account_id: string | null;
  company_id: string | null;
  contact_id: string | null;
  account_contact_id: string | null;
  created_at: string;
};

export type ActivityWithRefs = Activity & {
  owner: LeadOwner | null;
  lead_name: string | null;
  account_name: string | null;
};

// --- Tasks -----------------------------------------------------------------
export type Task = {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  priority: string;
  done: boolean;
  done_at: string | null;
  owner_id: string | null;
  lead_id: string | null;
  account_id: string | null;
  created_at: string;
  updated_at: string;
};

// --- Ops panel link --------------------------------------------------------
export type OpsLinkEntity = "lead" | "account" | "company";

export type OpsLink = {
  id: string;
  entity_type: OpsLinkEntity;
  entity_id: string;
  ops_deal_id: number;
  ops_company: string | null;
  confidence: number | null;
  /** Last payload the bridge returned — keeps the UI useful when it's down. */
  snapshot: Record<string, unknown>;
  synced_at: string;
  linked_by: string | null;
  created_at: string;
};

export type LeadImport = {
  id: string;
  filename: string | null;
  row_count: number;
  created_count: number;
  skipped_count: number;
  mapping: Record<string, string>;
  owner_id: string | null;
  created_at: string;
};
