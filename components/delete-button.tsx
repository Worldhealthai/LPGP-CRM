"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteCompany, deleteContact } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function DeleteButton({ kind, id }: { kind: "company" | "contact"; id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
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

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" /> Delete {kind}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Delete this {kind}
        {kind === "company" ? " and its contacts" : ""}? This can&apos;t be undone.
      </span>
      <Button variant="destructive" size="sm" onClick={onDelete} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Yes, delete
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
        Cancel
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
