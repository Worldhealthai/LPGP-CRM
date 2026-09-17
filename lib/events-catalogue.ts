/**
 * The LPGP Connect 2027 programme — 7 series, 20 events.
 *
 * Taken from the published events schedule. Pure data, so both the Event
 * Performance page and the server can use it.
 *
 * The ops panel is still the source of truth for which events actually exist
 * and what they've earned; this catalogue supplies the canonical names and the
 * series ("portfolio") each event belongs to.
 */

export type SeriesId =
  | "private-debt"
  | "cfo-private-markets"
  | "cfo-pe-debt"
  | "cfo-pe"
  | "operating-partners"
  | "data-tech"
  | "operational-fund";

export type Series = {
  id: SeriesId;
  /** Programme number as printed in the brochure. */
  code: string;
  name: string;
  short: string;
  eventCount: number;
};

export const SERIES: Series[] = [
  { id: "private-debt", code: "01", name: "Private Debt Fundraising Series", short: "Private Debt", eventCount: 7 },
  { id: "cfo-private-markets", code: "02", name: "CFO / COO Private Markets Series", short: "CFO Private Markets", eventCount: 3 },
  { id: "cfo-pe-debt", code: "03", name: "CFO / COO Private Equity & Debt Conference Series", short: "CFO PE & Debt", eventCount: 3 },
  { id: "cfo-pe", code: "04", name: "CFO / COO Private Equity", short: "CFO Private Equity", eventCount: 1 },
  { id: "operating-partners", code: "05", name: "Operating Partners Conference Series", short: "Operating Partners", eventCount: 3 },
  { id: "data-tech", code: "06", name: "Data & Technology Forum Series", short: "Data & Technology", eventCount: 2 },
  { id: "operational-fund", code: "07", name: "Operational Fund Summit Series", short: "Operational Fund", eventCount: 1 },
];

export const SERIES_MAP: Record<string, Series> = Object.fromEntries(
  SERIES.map((s) => [s.id, s]),
);

export type CatalogueEvent = {
  series: SeriesId;
  name: string;
  location: string;
  month: string;
  /** Month index (1–12) for ordering; the day is TBC in the brochure. */
  monthIndex: number;
};

export const CATALOGUE_2027: CatalogueEvent[] = [
  // 01 — Private Debt Fundraising Series
  { series: "private-debt", name: "11th Annual Private Debt Europe", location: "Berlin, Germany", month: "March 2027", monthIndex: 3 },
  { series: "private-debt", name: "13th Annual Private Debt — In Partnership with Women in Private Debt", location: "New York, USA", month: "April 2027", monthIndex: 4 },
  { series: "private-debt", name: "13th Annual Private Debt — In Partnership with Women in Private Debt", location: "London, UK", month: "September 2027", monthIndex: 9 },
  { series: "private-debt", name: "2nd Annual Sports Investing Forum", location: "London, UK", month: "October 2027", monthIndex: 10 },
  { series: "private-debt", name: "12th Annual Private Debt", location: "Chicago, USA", month: "October 2027", monthIndex: 10 },
  { series: "private-debt", name: "4th Annual Private Debt", location: "Los Angeles, USA", month: "October 2027", monthIndex: 10 },
  { series: "private-debt", name: "Sports Investing Forum", location: "New York, USA", month: "November 2027", monthIndex: 11 },

  // 02 — CFO / COO Private Markets Series
  { series: "cfo-private-markets", name: "4th Annual CFO/COO Private Markets", location: "Switzerland", month: "March 2027", monthIndex: 3 },
  { series: "cfo-private-markets", name: "4th Annual CFO/COO Private Markets", location: "Miami, USA", month: "May 2027", monthIndex: 5 },
  { series: "cfo-private-markets", name: "4th Annual CFO/COO Private Markets", location: "Los Angeles, USA", month: "October 2027", monthIndex: 10 },

  // 03 — CFO / COO Private Equity & Debt Conference Series
  { series: "cfo-pe-debt", name: "9th Annual CFO–COO Private Equity & Debt Conference", location: "London, UK", month: "July 2027", monthIndex: 7 },
  { series: "cfo-pe-debt", name: "9th Annual CFO/COO Private Equity & Debt Conference", location: "Chicago, USA", month: "October 2027", monthIndex: 10 },
  { series: "cfo-pe-debt", name: "8th Annual CFO–COO Private Equity & Debt Conference", location: "New York, USA", month: "November 2027", monthIndex: 11 },

  // 04 — CFO / COO Private Equity
  { series: "cfo-pe", name: "5th Annual CFO/COO Private Equity", location: "San Francisco, USA", month: "June 2027", monthIndex: 6 },

  // 05 — Operating Partners Conference Series
  { series: "operating-partners", name: "2nd Annual Operating Partners Summit", location: "Miami, USA", month: "February 2027", monthIndex: 2 },
  { series: "operating-partners", name: "3rd Annual Operating Partners Summit", location: "New York, USA", month: "May 2027", monthIndex: 5 },
  { series: "operating-partners", name: "3rd Annual Operating Partners Summit", location: "West Coast, USA", month: "November 2027", monthIndex: 11 },

  // 06 — Data & Technology Forum Series
  { series: "data-tech", name: "3rd Annual AI, Data & Tech in Private Markets", location: "New York, USA", month: "May 2027", monthIndex: 5 },
  { series: "data-tech", name: "3rd Annual AI, Data & Tech in Private Markets", location: "London, UK", month: "October 2027", monthIndex: 10 },

  // 07 — Operational Fund Summit Series
  { series: "operational-fund", name: "5th Annual Operational Fund Summit", location: "Luxembourg", month: "November 2027", monthIndex: 11 },
];

// --- Classifying an ops-panel event ----------------------------------------

export type SeriesGuess = { series: SeriesId; confidence: "certain" | "likely" } | null;

/**
 * Best guess at which series an ops-panel event belongs to.
 *
 * Runs on the event's name, which in the tracker is often shorthand
 * ("PD/CFO LA", "Ops NYC", "Lux"). Rules are ordered most-specific first, and
 * only report "certain" when the name states the series outright. A guess is a
 * suggestion — the Event Performance page lets someone override it, and that
 * choice is what's stored.
 */
export function guessSeries(eventName: string): SeriesGuess {
  const n = eventName.toLowerCase();
  const has = (...words: string[]) => words.every((w) => n.includes(w));

  // Stated outright
  if (n.includes("operational fund")) return { series: "operational-fund", confidence: "certain" };
  if (n.includes("operating partners")) return { series: "operating-partners", confidence: "certain" };
  if (has("data") && (n.includes("tech") || n.includes("ai"))) {
    return { series: "data-tech", confidence: "certain" };
  }
  if (has("private equity", "debt") || /\bpe\s*[&/+]\s*debt\b/.test(n)) {
    return { series: "cfo-pe-debt", confidence: "certain" };
  }
  if (has("cfo", "private markets")) return { series: "cfo-private-markets", confidence: "certain" };
  if (has("cfo", "private equity")) return { series: "cfo-pe", confidence: "certain" };
  if (n.includes("private debt") || n.includes("sports investing")) {
    return { series: "private-debt", confidence: "certain" };
  }

  // Tracker shorthand
  if (/\bops\b/.test(n)) return { series: "operating-partners", confidence: "likely" };
  if (/\bdata\s*tech\b/.test(n)) return { series: "data-tech", confidence: "likely" };
  if (/\bpd\b/.test(n) || n.includes("fundraising") || n.includes("sports")) {
    return { series: "private-debt", confidence: "likely" };
  }

  // Locations that map to exactly one 2027 event, so the city alone is enough.
  // Chicago, London, New York and Miami each host several — never guessed.
  if (n.includes("berlin")) return { series: "private-debt", confidence: "likely" };
  if (n.includes("lux")) return { series: "operational-fund", confidence: "likely" };
  if (n.includes("switzerland") || n.includes("zurich")) {
    return { series: "cfo-private-markets", confidence: "likely" };
  }
  if (n.includes("sanfran") || n.includes("san francisco") || /\bsf\b/.test(n)) {
    return { series: "cfo-pe", confidence: "likely" };
  }

  // A bare "CFO <city>" is a CFO event, but which series depends on the city.
  if (/\bcfo\b/.test(n)) return { series: "cfo-private-markets", confidence: "likely" };

  return null;
}

/** Series display colour, used consistently across charts and badges. */
export const SERIES_COLOR: Record<SeriesId, string> = {
  "private-debt": "var(--chart-1)",
  "cfo-private-markets": "var(--chart-2)",
  "cfo-pe-debt": "var(--chart-3)",
  "cfo-pe": "var(--chart-4)",
  "operating-partners": "var(--chart-5)",
  "data-tech": "var(--chart-6)",
  "operational-fund": "var(--chart-7)",
};
