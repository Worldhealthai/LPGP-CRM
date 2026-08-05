"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCompany, deleteContact } from "@/lib/actions";
import { ConfirmModal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function DeleteButton({ kind, id }: { kind: "company" | "contact"; id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    setError(null);
    start(async () => {
      const res = kind === "company" ? await deleteCompany(id) : await deleteContact(id);
      if (res.ok) {
        router.push(kind === "company" ? "/companies" : "/contacts");
        router.refresh();
      } else {
        setError(res.error ?? "Could not delete");
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" /> Delete {kind}
      </Button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        pending={pending}
        error={error}
        title={`Delete this ${kind}?`}
        description={
          kind === "company"
            ? "The company and all of its contacts will be permanently removed. This can't be undone."
            : "This contact will be permanently removed. This can't be undone."
        }
      />
    </>
  );
}
