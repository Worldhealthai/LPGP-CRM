import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PersonAvatar({
  name,
  size = 40,
  className,
}: {
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full bg-accent text-accent-foreground font-semibold shrink-0",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
