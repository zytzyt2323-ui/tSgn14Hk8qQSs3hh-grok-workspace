import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { joinBoard } from "@/lib/board-api";
import { parseJoinCode } from "@/lib/share";

export const Route = createFileRoute("/join/$code")({
  component: JoinPage,
});

function JoinPage() {
  const { code: raw } = Route.useParams();
  const code = parseJoinCode(raw);
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !code) return;
    let cancelled = false;
    void joinBoard({ data: { code } })
      .then((res) => {
        if (!cancelled) {
          void navigate({ to: "/board/$boardId", params: { boardId: res.id } });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "加入失败");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, code, navigate]);

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <SiteHeader />
        <div className="grid flex-1 place-items-center text-sm text-muted">正在打开战术板…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        search={{ redirect: `/join/${code || raw}` }}
      />
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <SiteHeader />
        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <p className="font-display text-2xl">加入失败</p>
            <p className="mt-2 text-sm text-muted">{error}</p>
            <Button asChild className="mt-6">
              <Link to="/">返回列表</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader />
      <div className="grid flex-1 place-items-center text-sm text-muted">正在加入战术板…</div>
    </div>
  );
}
