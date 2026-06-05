import { initials } from "@/lib/utils";

/**
 * Company avatar. Uses Clearbit's logo service by domain when available,
 * with a tinted initials fallback (plain <img> so a 404 doesn't break SSR).
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
  const src = domain ? `https://logo.clearbit.com/${domain}` : null;
  return (
    <span
      className="relative inline-grid place-items-center overflow-hidden rounded-md border bg-secondary text-secondary-foreground font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      aria-hidden
    >
      <span>{initials(name)}</span>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="absolute inset-0 h-full w-full object-contain bg-white"
          loading="lazy"
        />
      ) : null}
    </span>
  );
}
