"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignLead } from "@/lib/crm-actions";

type ProfileLite = { id: string; full_name: string | null };

export function AssignSelect({
  leadId,
  ownerId,
  profiles,
}: {
  leadId: string;
  ownerId: string | null;
  profiles: ProfileLite[];
}) {
  const router = useRouter();
  const [val, setVal] = useState(ownerId ?? "");
  const [pending, start] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    setVal(v);
    start(async () => {
      await assignLead(leadId, v);
      router.refresh();
    });
  }

  return (
    <select
      value={val}
      onChange={onChange}
      disabled={pending}
      className="h-8 rounded-md border border-input bg-card px-2 text-sm shadow-xs outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-60"
    >
      <option value="">Unassigned</option>
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.full_name ?? "Unnamed"}
        </option>
      ))}
    </select>
  );
}
