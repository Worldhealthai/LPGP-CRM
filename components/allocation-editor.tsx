"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { updateCompanyAllocations } from "@/lib/actions";
import type { Allocation } from "@/lib/types";
import { allocationShade } from "@/components/charts/donut";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TEMPLATE: Allocation[] = [
  { label: "Equities", value: 0 },
  { label: "Fixed Income", value: 0 },
  { label: "Real Assets", value: 0 },
  { label: "Private Equity", value: 0 },
];

export function AllocationEditor({ id, initial }: { id: string; initial: Allocation[] }) {
  const [rows, setRows] = useState<Allocation[]>(initial.length ? initial : TEMPLATE);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = rows.reduce((s, r) => s + (Number(r.value) || 0), 0);

  function patch(i: number, p: Partial<Allocation>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
    setSaved(false);
  }

  function save() {
    setError(null);
    start(async () => {
      const res = await updateCompanyAllocations(id, rows);
      if (res.ok) setSaved(true);
      else setError(res.error ?? "Could not save");
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-[3px] shrink-0"
              style={{ background: allocationShade(i) }}
            />
            <Input
              value={r.label}
              onChange={(e) => patch(i, { label: e.target.value })}
              placeholder="Asset class"
              className="h-8"
            />
            <div className="relative w-20 shrink-0">
              <Input
                value={String(r.value ?? "")}
                onChange={(e) => patch(i, { value: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })}
                inputMode="numeric"
                className="h-8 pr-6 text-right tabular"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
            <button
              onClick={() => {
                setRows((rs) => rs.filter((_, idx) => idx !== i));
                setSaved(false);
              }}
              className="text-muted-foreground hover:text-destructive shrink-0"
              aria-label="Remove row"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setRows((rs) => [...rs, { label: "", value: 0 }]);
            setSaved(false);
          }}
        >
          <Plus className="h-4 w-4" /> Add class
        </Button>
        <span className={cn("text-xs tabular", total === 100 ? "text-muted-foreground" : "text-foreground/80")}>
          Total {Math.round(total)}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={save} disabled={pending}>
          <Check className="h-3.5 w-3.5" /> Save allocation
        </Button>
        {saved ? <span className="text-xs text-muted-foreground">Saved</span> : null}
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    </div>
  );
}
