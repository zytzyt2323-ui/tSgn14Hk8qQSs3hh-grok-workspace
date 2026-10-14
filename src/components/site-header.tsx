import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function SiteHeader({ trailing }: { trailing?: ReactNode }) {
  const { user, isPending } = useCurrentUserState();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <Link to="/" className="flex items-baseline gap-2 text-fg no-underline">
        <span className="font-display text-xl font-semibold tracking-wide">
          Pitchboard
        </span>
        <span className="hidden text-xs text-muted sm:inline">阵型板</span>
      </Link>
      <div className="ml-auto flex items-center gap-3">
        {trailing}
        {isPending ? (
          <div className="size-8 animate-pulse rounded-full bg-elevated" />
        ) : user ? (
          <div className="text-fg [&_button]:text-muted [&_span]:text-sm">
            <UserButton />
          </div>
        ) : (
          <Link
            to="/login"
            search={{}}
            className="inline-flex h-9 items-center rounded-sm bg-primary px-3 text-sm font-medium text-primary-fg no-underline"
          >
            登录
          </Link>
        )}
      </div>
    </header>
  );
}
