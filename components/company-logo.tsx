"use client";

import { useState } from "react";
import { initials } from "@/lib/utils";

/**
 * Company avatar. Tries Clearbit's logo service by domain and falls back to
 * tinted initials when the logo can't be loaded (bad/unknown domain).
 */
export function CompanyLogo({
  name,
  domain,
  size = 40,
}: {
  name: string;
  domain?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const clean = domain?.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const src = clean && !failed ? `https://logo.clearbit.com/${clean}` : null;

  return (
    <span
      className="relative inline-grid place-items-center overflow-hidden rounded-md border bg-secondary text-secondary-foreground font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      <span aria-hidden>{initials(name)}</span>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="absolute inset-0 h-full w-full object-contain bg-white"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : null}
    </span>
  );
}
