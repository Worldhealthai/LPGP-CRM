"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createLeadFromCompany } from "@/lib/crm-actions";
import { Button } from "@/components/ui/button";

export function AddToPipelineButton({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    start(async () => {
      const res = await createLeadFromCompany(companyId);
      if (res.ok && res.id) {
        router.push(`/leads/${res.id}`);
      } else {
        setError(res.error ?? "Could not add");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={add} variant="outline" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add to my pipeline
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
