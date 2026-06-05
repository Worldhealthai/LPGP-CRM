export type CsvValue = string | number | boolean | null | undefined;

/** RFC-4180-ish CSV. Quotes fields containing commas, quotes or newlines. */
export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const esc = (v: CsvValue) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

/** A Response that downloads as a UTF-8 CSV file (BOM so Excel reads accents). */
export function csvResponse(filename: string, csv: string): Response {
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
