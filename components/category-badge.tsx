import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  category,
  showName = false,
  className,
}: {
  category: Category;
  showName?: boolean;
  className?: string;
}) {
  const meta = CATEGORIES[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold",
        meta.accent,
        className,
      )}
      title={meta.name}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {showName ? meta.name : meta.singular}
    </span>
  );
}
