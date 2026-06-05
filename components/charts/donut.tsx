import type { Allocation } from "@/lib/types";

// Greyscale shades (percent of --foreground mixed over --background) so the
// chart reads cleanly in both light and dark themes.
const SHADES = [92, 70, 50, 34, 22, 14];

export function allocationShade(i: number): string {
  const p = SHADES[i % SHADES.length];
  return `color-mix(in oklab, var(--foreground) ${p}%, var(--background))`;
}

export function Donut({
  data,
  size = 132,
  thickness = 20,
}: {
  data: Allocation[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + (d.value > 0 ? d.value : 0), 0);
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Asset allocation">
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={thickness} />
        {total > 0 &&
          data.map((d, i) => {
            const len = ((d.value > 0 ? d.value : 0) / total) * circ;
            const seg = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={allocationShade(i)}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return seg;
          })}
      </g>
    </svg>
  );
}
