"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, RefreshCw, Unlink } from "lucide-react";
import { linkOpsCompany, lookupOpsCompany, syncOpsLinks, unlinkOps } from "@/lib/ops-actions";
import { describeOpsMatch, type OpsMatch } from "@/lib/ops-types";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";

/** Re-pull the linked deals so the snapshots (and totals) are current. */
export function OpsSyncButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const res = await syncOpsLinks("account", accountId);
          setBusy(false);
          if (!res.ok) setError(res.error ?? "Sync failed");
          else router.refresh();
        }}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Sync
      </Button>
    </div>
  );
}

export function OpsUnlinkButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await unlinkOps("account", accountId);
        setBusy(false);
        router.refresh();
      }}
    >
      <Unlink className="h-3.5 w-3.5" /> Unlink
    </Button>
  );
}

/**
 * Search the ops panel for a sponsor and link it to this account — the manual
 * path for accounts created before the match notice existed, or where the
 * spelling differs too much for the fuzzy match to have caught it.
 */
export function OpsLinkSearch({
  accountId,
  accountName,
}: {
  accountId: string;
  accountName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(accountName);
  const [matches, setMatches] = useState<OpsMatch[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setBusy(true);
    setError(null);
    const res = await lookupOpsCompany(query);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      setMatches([]);
      return;
    }
    setMatches(res.data.matches ?? []);
  }

  async function choose(match: OpsMatch) {
    setBusy(true);
    const res = await linkOpsCompany("account", accountId, match);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not link");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Link2 className="h-3.5 w-3.5" /> Link ops deal
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} size="md">
        <ModalHeader
          icon={<Link2 className="h-4.5 w-4.5" />}
          title="Link to the ops panel"
          description="Find this sponsor's deal in the tracker to pull its event allocations in."
          onClose={() => setOpen(false)}
        />
        <ModalBody className="space-y-3">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void search();
                }
              }}
              placeholder="Company name in the ops panel"
              className="h-9 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            />
            <Button onClick={search} disabled={busy || !query.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Search
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {matches === null ? (
            <p className="text-sm text-muted-foreground">
              Search to see matching deals in the ops panel.
            </p>
          ) : matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing in the ops panel matches that name.
            </p>
          ) : (
            <ul className="space-y-2">
              {matches.map((m) => (
                <li key={m.company}>
                  <button
                    type="button"
                    onClick={() => choose(m)}
                    disabled={busy}
                    className="w-full rounded-xl border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-accent/50 disabled:opacity-60"
                  >
                    <p className="flex items-center justify-between gap-2 text-sm font-medium">
                      {m.company}
                      <span className="tabular text-[11px] text-muted-foreground">
                        {Math.round(m.confidence * 100)}%
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{describeOpsMatch(m)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
