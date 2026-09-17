"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Handshake, Loader2 } from "lucide-react";
import { convertLeadToAccount } from "@/lib/account-actions";
import { Button } from "@/components/ui/button";

/**
 * Promote a won lead into a sponsor account. Carries the contact across as the
 * first point of contact and moves any ops-panel links with it, so the new
 * account opens with its event allocations already in place.
 */
export function ConvertLeadButton({
  leadId,
  accountId,
}: {
  leadId: string;
  accountId: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (accountId) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/accounts/${accountId}`}>
          <Handshake className="h-3.5 w-3.5" /> Open account
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const res = await convertLeadToAccount(leadId);
          setBusy(false);
          if (!res.ok || !res.id) {
            setError(res.error ?? "Could not convert");
            return;
          }
          router.push(`/accounts/${res.id}`);
        }}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
        Convert to account
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
