export function Gauge({
  value,
  size = 116,
  thickness = 12,
}: {
  value: number;
  size?: number;
  thickness?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const len = (v / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(v)}%`}>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={thickness} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${len} ${circ - len}`}
        />
      </g>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--foreground)"
        style={{ fontSize: size * 0.24, fontWeight: 600 }}
      >
        {Math.round(v)}%
      </text>
    </svg>
  );
}
