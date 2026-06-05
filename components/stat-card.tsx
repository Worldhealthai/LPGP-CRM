import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sublabel,
  href,
  accent,
  dot,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  href?: string;
  accent?: string;
  dot?: string;
}) {
  const inner = (
    <div className={cn("rounded-2xl border bg-card p-5 h-full shadow-sm", href && "lift")}>
      <div className="flex items-center gap-2">
        {dot ? <span className={cn("h-2 w-2 rounded-full", dot)} /> : null}
        <span className="eyebrow">{label}</span>
      </div>
      <div className="mt-3 text-[2rem] leading-none font-semibold tabular tracking-tight">{value}</div>
      {sublabel ? <div className="mt-2 text-sm text-muted-foreground">{sublabel}</div> : null}
      {accent ? <div className={cn("mt-4 h-1 w-10 rounded-full", accent)} /> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
