export type Category = "LP" | "GP" | "SP";

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
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  entity_type: "company" | "contact";
  entity_id: string;
  body: string;
  author: string | null;
  created_at: string;
};

export type ContactWithCompany = Contact & {
  company: Pick<Company, "id" | "name" | "category" | "logo_url"> | null;
};
