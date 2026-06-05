import type { Category } from "./types";

export type CategoryMeta = {
  key: Category;
  label: string; // short label, e.g. "LPs"
  singular: string; // e.g. "LP"
  name: string; // full name
  blurb: string;
  subTypes: string[];
  // Tailwind utility classes for the accent treatment of this book.
  accent: string; // text + bg chip
  dot: string; // bg dot
};

export const CATEGORIES: Record<Category, CategoryMeta> = {
  LP: {
    key: "LP",
    label: "LPs",
    singular: "LP",
    name: "Limited Partners",
    blurb:
      "Institutional investors — insurers, foundations, endowments, pension & superannuation funds, multi-family offices.",
    subTypes: [
      "Insurance company",
      "Foundation",
      "Endowment",
      "Pension fund",
      "Superannuation scheme",
      "Multi-family office",
      "Sovereign wealth fund",
      "Fund of funds",
    ],
    accent: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  GP: {
    key: "GP",
    label: "GPs",
    singular: "GP",
    name: "General Partners",
    blurb:
      "Fund managers — private equity & asset managers (BlackRock, Ares, Oaktree) and venture capital firms.",
    subTypes: [
      "Private equity",
      "Asset manager",
      "Hedge fund",
      "Venture capital",
      "Private credit",
      "Real assets",
      "Infrastructure",
    ],
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  SP: {
    key: "SP",
    label: "SPs",
    singular: "SP",
    name: "Solution Providers",
    blurb:
      "Vendors to the industry — audit & advisory (KPMG), banks (MUFG), fund administrators (Apex), law firms (Kirkland & Ellis).",
    subTypes: [
      "Audit & advisory",
      "Bank",
      "Fund administrator",
      "Law firm",
      "Placement agent",
      "Technology vendor",
      "Consulting",
    ],
    accent: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
};

export const CATEGORY_ORDER: Category[] = ["LP", "GP", "SP"];

export function isCategory(value: unknown): value is Category {
  return value === "LP" || value === "GP" || value === "SP";
}

// Sensible default Lusha job-title filters per book — senior decision-makers
// in finance. The user can override these in the import tool.
export const DEFAULT_TITLE_PRESETS: string[] = [
  "Chief Executive Officer",
  "Chief Investment Officer",
  "Chief Financial Officer",
  "Chief Operating Officer",
  "Managing Director",
  "Managing Partner",
  "General Partner",
  "Partner",
  "Head of Investments",
  "Head of Private Markets",
  "Head of Private Equity",
  "Head of Real Assets",
  "Portfolio Manager",
  "Investment Director",
];
