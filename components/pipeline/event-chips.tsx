import { CalendarDays } from "lucide-react";
import type { LeadEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The events a lead is being pursued for, as compact chips with overflow. */
export function EventChips({
  events,
  max = 2,
  className,
}: {
  events: LeadEvent[] | null | undefined;
  max?: number;
  className?: string;
}) {
  if (!events?.length) return null;
  const shown = events.slice(0, max);
  const rest = events.length - shown.length;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {shown.map((e) => (
        <span
          key={e.event_id}
          className="inline-flex max-w-[180px] items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          title={e.event_name}
        >
          <CalendarDays className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{e.event_name || `Event ${e.event_id}`}</span>
        </span>
      ))}
      {rest > 0 ? (
        <span
          className="rounded-md px-1 text-[10px] text-muted-foreground"
          title={events.slice(max).map((e) => e.event_name).join(", ")}
        >
          +{rest}
        </span>
      ) : null}
    </span>
  );
}
