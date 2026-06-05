"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { updateCompany, updateContact } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// `link` is a serializable descriptor (Server Components can't pass functions
// to Client Components). EditableField builds the href itself.
function toHref(link: "url" | "email" | "tel", value: string): string {
  if (link === "email") return `mailto:${value}`;
  if (link === "tel") return `tel:${value}`;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function EditableField({
  entity,
  id,
  field,
  value,
  label,
  placeholder,
  multiline = false,
  link,
}: {
  entity: "contact" | "company";
  id: string;
  field: string;
  value: string | null | undefined;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  link?: "url" | "email" | "tel";
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setError(null);
    start(async () => {
      const fn = entity === "contact" ? updateContact : updateCompany;
      const res = await fn(id, { [field]: val });
      if (res.ok) setEditing(false);
      else setError(res.error ?? "Could not save");
    });
  }

  function cancel() {
    setVal(value ?? "");
    setError(null);
    setEditing(false);
  }

  return (
    <div className="group py-2.5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      {editing ? (
        <div className="mt-1.5 space-y-1.5">
          {multiline ? (
            <Textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={placeholder}
              autoFocus
              rows={4}
            />
          ) : (
            <Input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={placeholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !multiline) save();
                if (e.key === "Escape") cancel();
              }}
            />
          )}
          <div className="flex items-center gap-1.5">
            <Button size="sm" onClick={save} disabled={pending}>
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel} disabled={pending}>
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
            {error ? <span className="text-xs text-destructive">{error}</span> : null}
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-start justify-between gap-2">
          <div className="min-w-0 text-sm">
            {value ? (
              link ? (
                <a
                  href={toHref(link, value)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {value}
                </a>
              ) : (
                <span className="break-words whitespace-pre-wrap">{value}</span>
              )
            ) : (
              <span className="text-muted-foreground italic">Not set</span>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
