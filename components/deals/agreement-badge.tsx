import { BadgeCheck, Clock, FileWarning } from "lucide-react";
import { AGREEMENT_LABEL, type AgreementStatus } from "@/lib/ops-types";
import { cn } from "@/lib/utils";

const STYLE: Record<AgreementStatus, { cls: string; icon: typeof BadgeCheck }> = {
  // Warm and solid — this one is a job to do, not a field left blank.
  need_invoice: {
    cls: "bg-[var(--ops-soft)] text-[var(--ops)] border-[var(--ops)]/40",
    icon: FileWarning,
  },
  awaiting_signature: {
    cls: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  },
  signed: {
    cls: "bg-[var(--success-soft)] text-[var(--success)] border-transparent",
    icon: BadgeCheck,
  },
};

/** Where a deal stands on paperwork, as the tracker sees it. */
export function AgreementBadge({
  status,
  className,
  detail,
}: {
  status: AgreementStatus;
  className?: string;
  /** File name or similar, shown on hover. */
  detail?: string | null;
}) {
  const { cls, icon: Icon } = STYLE[status];
  return (
    <span
      title={detail || AGREEMENT_LABEL[status]}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        cls,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {AGREEMENT_LABEL[status]}
    </span>
  );
}
