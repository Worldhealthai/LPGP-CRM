/**
 * The LPGP hexagon mark, drawn as inline SVG so it inherits `currentColor` and
 * works on the dark rail, the light content area and the favicon alike.
 *
 * To use the exact brand asset instead, drop it at `public/lpgp-logo.svg` and
 * swap this component's body for an <img src="/lpgp-logo.svg" />.
 */
export function LpgpMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      role="img"
      aria-label="LPGP"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer hexagon — flat top and bottom, angled shoulders */}
      <path
        d="M24 3.4 41.2 13.3a2.2 2.2 0 0 1 1.1 1.9v17.6a2.2 2.2 0 0 1-1.1 1.9L24 44.6a2.2 2.2 0 0 1-2.2 0L4.6 34.7a2.2 2.2 0 0 1-1.1-1.9V15.2a2.2 2.2 0 0 1 1.1-1.9L21.8 3.4a2.2 2.2 0 0 1 2.2 0Z"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      {/* Inner angular band */}
      <path
        d="M17.6 31.7V19.4a1.6 1.6 0 0 1 .8-1.4l6.4-3.7a1.6 1.6 0 0 1 2.4 1.4v12.3a1.6 1.6 0 0 1-.8 1.4l-6.4 3.7a1.6 1.6 0 0 1-2.4-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Mark + wordmark, for the rail and the login screen. */
export function LpgpLockup({ className }: { className?: string }) {
  return (
    <span className={className}>
      <LpgpMark className="h-full w-auto" />
    </span>
  );
}
