import type { Allocation } from "@/lib/types";
import { allocationShade } from "./donut";

export function AllocationBars({ data }: { data: Allocation[] }) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No allocation set yet.</p>;
  }
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{d.label}</span>
            <span className="tabular font-semibold">{Math.round(d.value)}%</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, d.value))}%`,
                background: allocationShade(i),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
