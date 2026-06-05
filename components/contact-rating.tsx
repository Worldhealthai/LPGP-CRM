"use client";

import { useState, useTransition } from "react";
import { setContactRating } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function ContactRating({ id, initial }: { id: string; initial: number | null }) {
  const [value, setValue] = useState(initial ?? 0);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, start] = useTransition();

  function set(n: number) {
    const next = n === value ? 0 : n; // click the current level to clear it
    const prev = value;
    setValue(next);
    start(async () => {
      const res = await setContactRating(id, next);
      if (!res.ok) setValue(prev);
    });
  }

  const shown = hover ?? value;

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={pending}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => set(n)}
          aria-label={`Set relationship strength to ${n}`}
          className={cn(
            "h-5 w-5 rounded-full border transition-colors",
            n <= shown ? "bg-foreground border-foreground" : "border-foreground/30 hover:border-foreground/60",
          )}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground tabular">
        {value ? `${value}/5` : "Not rated"}
      </span>
    </div>
  );
}
