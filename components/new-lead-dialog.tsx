"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { createLead } from "@/lib/crm-actions";
import { LEAD_STAGES } from "@/lib/pipeline";
import { MARKETS, MARKET_LABELS } from "@/lib/pipeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CompanyLite = { id: string; name: string; category: string };
type ProfileLite = { id: string; full_name: string | null };

const inputCls =
  "flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function NewLeadDialog({
  companies,
  profiles,
  isAdmin,
  defaultStage,
}: {
  companies: CompanyLite[];
  profiles: ProfileLite[];
  isAdmin: boolean;
  defaultStage?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [market, setMarket] = useState<string>("US");
  const [stage, setStage] = useState<string>(defaultStage ?? "New");
  const [value, setValue] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [ownerId, setOwnerId] = useState("");

  function reset() {
    setCompanyName("");
    setContactName("");
    setContactTitle("");
    setContactEmail("");
    setMarket("US");
    setStage(defaultStage ?? "New");
    setValue("");
    setNextStep("");
    setOwnerId("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const match = companies.find((c) => c.name.toLowerCase() === companyName.trim().toLowerCase());
      const res = await createLead({
        company_name: companyName,
        company_id: match?.id ?? null,
        category: match?.category ?? null,
        contact_name: contactName,
        contact_title: contactTitle,
        contact_email: contactEmail,
        market,
        stage,
        value_usd: value,
        next_step: nextStep,
        owner_id: isAdmin ? ownerId : undefined,
      });
      if (!res.ok) {
        setError(res.error ?? "Could not create lead");
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New lead
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border bg-card shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h2 className="font-semibold">New lead</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <Label className="mb-1.5">Company</Label>
                <input
                  className={inputCls}
                  list="company-options"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Type a name — pick from the database to link it"
                  required
                />
                <datalist id="company-options">
                  {companies.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5">Contact name</Label>
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div>
                  <Label className="mb-1.5">Title</Label>
                  <Input value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} placeholder="Managing Director" />
                </div>
                <div>
                  <Label className="mb-1.5">Email</Label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="jane@firm.com" />
                </div>
                <div>
                  <Label className="mb-1.5">Deal value (USD)</Label>
                  <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 250000" inputMode="numeric" />
                </div>
                <div>
                  <Label className="mb-1.5">Market</Label>
                  <select className={inputCls} value={market} onChange={(e) => setMarket(e.target.value)}>
                    {MARKETS.map((m) => (
                      <option key={m} value={m}>
                        {MARKET_LABELS[m] ?? m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="mb-1.5">Stage</Label>
                  <select className={inputCls} value={stage} onChange={(e) => setStage(e.target.value)}>
                    {LEAD_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="mb-1.5">Next step</Label>
                <Input value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="e.g. Send intro email" />
              </div>

              {isAdmin ? (
                <div>
                  <Label className="mb-1.5">Owner</Label>
                  <select className={inputCls} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                    <option value="">Me</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name ?? "Unnamed"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
