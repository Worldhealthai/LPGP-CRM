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
    <div className={cn("rounded-xl border bg-card p-5 h-full", href && "lift")}>
      <div className="flex items-center gap-2">
        {dot ? <span className={cn("h-2 w-2 rounded-full", dot)} /> : null}
        <span className="eyebrow">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tabular tracking-tight">{value}</div>
      {sublabel ? <div className="mt-1 text-sm text-muted-foreground">{sublabel}</div> : null}
      {accent ? <div className={cn("mt-4 h-1 w-10 rounded-full", accent)} /> : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
