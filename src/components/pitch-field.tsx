import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PitchField({
  className,
  children,
  markings = true,
}: {
  className?: string;
  children?: ReactNode;
  markings?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg border border-line/25 shadow-panel",
        "aspect-[68/105] w-full max-h-full",
        className,
      )}
    >
      <div className="pitch-grass absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.35)_100%)]" />
      {markings ? (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 68 105"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect
            x="1.2"
            y="1.2"
            width="65.6"
            height="102.6"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.35"
            opacity="0.85"
          />
          <line
            x1="1.2"
            y1="52.5"
            x2="66.8"
            y2="52.5"
            stroke="var(--color-line)"
            strokeWidth="0.28"
            opacity="0.8"
          />
          <circle
            cx="34"
            cy="52.5"
            r="9.15"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
            opacity="0.8"
          />
          <circle cx="34" cy="52.5" r="0.55" fill="var(--color-line)" opacity="0.9" />
          <rect
            x="13.84"
            y="1.2"
            width="40.32"
            height="16.5"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
            opacity="0.85"
          />
          <rect
            x="24.84"
            y="1.2"
            width="18.32"
            height="5.5"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
            opacity="0.85"
          />
          <circle cx="34" cy="12.2" r="0.45" fill="var(--color-line)" />
          <path
            d="M 25.8 17.7 A 9.15 9.15 0 0 0 42.2 17.7"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
            opacity="0.8"
          />
          <rect
            x="13.84"
            y="87.3"
            width="40.32"
            height="16.5"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
            opacity="0.85"
          />
          <rect
            x="24.84"
            y="98.3"
            width="18.32"
            height="5.5"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
            opacity="0.85"
          />
          <circle cx="34" cy="92.8" r="0.45" fill="var(--color-line)" />
          <path
            d="M 25.8 87.3 A 9.15 9.15 0 0 1 42.2 87.3"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
            opacity="0.8"
          />
          <path
            d="M 1.2 2.2 A 1 1 0 0 1 2.2 1.2"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
          />
          <path
            d="M 65.8 1.2 A 1 1 0 0 1 66.8 2.2"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
          />
          <path
            d="M 1.2 102.8 A 1 1 0 0 0 2.2 103.8"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
          />
          <path
            d="M 65.8 103.8 A 1 1 0 0 0 66.8 102.8"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.28"
          />
          <rect
            x="30.34"
            y="0.2"
            width="7.32"
            height="1"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.35"
          />
          <rect
            x="30.34"
            y="103.8"
            width="7.32"
            height="1"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="0.35"
          />
        </svg>
      ) : null}
      {children}
    </div>
  );
}
