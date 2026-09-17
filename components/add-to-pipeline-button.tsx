"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, TriangleAlert } from "lucide-react";
import { createLeadFromCompany } from "@/lib/crm-actions";
import type { PipelineConflicts } from "@/lib/types";
import { ConflictSummary } from "@/components/pipeline/heads-up-panel";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";

/**
 * One-click add from a company profile. If a teammate is already on the firm
 * or it has already signed, the add is held once and the heads-up shown; the
 * person can still go ahead.
 */
export function AddToPipelineButton({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<PipelineConflicts | null>(null);

  function add(acknowledge: boolean) {
    setError(null);
    start(async () => {
      const res = await createLeadFromCompany(companyId, { acknowledge });
      if (res.ok && res.id) {
        setConflicts(null);
        router.push(`/leads/${res.id}`);
      } else if (res.conflicts) {
        setConflicts(res.conflicts);
      } else {
        setError(res.error ?? "Could not add");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={() => add(false)} variant="outline" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add to my pipeline
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}

      <Modal open={Boolean(conflicts)} onClose={() => setConflicts(null)} size="md">
        <ModalHeader
          icon={<TriangleAlert className="h-4.5 w-4.5" />}
          title="Before you add this"
          description="Someone's already on this company, or it has already signed."
          onClose={() => setConflicts(null)}
        />
        <ModalBody>{conflicts ? <ConflictSummary conflicts={conflicts} /> : null}</ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setConflicts(null)} disabled={pending}>
            Leave it
          </Button>
          <Button onClick={() => add(true)} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add anyway
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
