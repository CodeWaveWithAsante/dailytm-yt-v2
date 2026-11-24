import Link from "next/link";
import { cn } from "@/lib/utils";

/** The DailyTM mark: a rounded tile holding a check, drawn as one SVG. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-7 shrink-0", className)}
    >
      <defs>
        <linearGradient id="dtm-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.68 0.16 277)" />
          <stop offset="1" stopColor="oklch(0.5 0.17 290)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#dtm-mark)" />
      <path
        d="M9.5 16.5l4.2 4.2L22.5 11.5"
        fill="none"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-visible:ring-ring inline-flex items-center gap-2 rounded-md font-semibold tracking-[var(--tracking-heading)] focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      <LogoMark />
      <span>DailyTM</span>
    </Link>
  );
}
