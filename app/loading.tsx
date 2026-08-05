import { Skeleton } from "@/components/ui/skeleton";

/** Instant feedback while dynamic pages fetch — keeps navigation feeling fast. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-6">
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[420px] rounded-2xl" />
    </div>
  );
}
