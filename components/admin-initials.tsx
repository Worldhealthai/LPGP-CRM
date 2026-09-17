"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { setProfileInitials } from "@/lib/profile-actions";
import { normalizeInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Inline editor for the initials a teammate signs deals with in the ops panel.
 * Saves on blur or Enter; the server rejects a pair someone else already has.
 */
export function InitialsField({
  profileId,
  initials,
  canEdit,
}: {
  profileId: string;
  initials: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initials ?? "");
  const [saved, setSaved] = useState<string | null>(initials ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function commit() {
    const clean = normalizeInitials(value);
    setValue(clean);
    if (clean === (saved ?? "")) return;
    setError(null);
    start(async () => {
      const res = await setProfileInitials(profileId, clean);
      if (!res.ok) {
        setError(res.error ?? "Could not save");
        return;
      }
      setSaved(res.initials ?? "");
      router.refresh();
    });
  }

  if (!canEdit) {
    return (
      <span className="tabular rounded border px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
        {initials || "—"}
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end gap-0.5">
      <span className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          maxLength={4}
          placeholder="JS"
          aria-label="Ops panel initials"
          title="Initials used on deals in the ops panel"
          className={cn(
            "tabular h-7 w-16 rounded-md border bg-background px-2 text-center text-[12px] font-semibold uppercase outline-none",
            "focus-visible:ring-[3px] focus-visible:ring-ring/40",
            error && "border-destructive",
          )}
          disabled={pending}
        />
        {pending ? (
          <Loader2 className="absolute -right-5 top-1.5 h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : saved && saved === value && value ? (
          <Check className="absolute -right-5 top-1.5 h-3.5 w-3.5 text-[var(--success)]" />
        ) : null}
      </span>
      {error ? <span className="text-[10px] text-destructive">{error}</span> : null}
    </span>
  );
}
