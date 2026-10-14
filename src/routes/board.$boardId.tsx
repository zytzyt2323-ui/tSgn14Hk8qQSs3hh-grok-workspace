import { createFileRoute } from "@tanstack/react-router";
import { BoardEditor } from "@/components/board-editor";
import { SiteHeader } from "@/components/site-header";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/board/$boardId")({
  component: BoardPage,
});

function BoardPage() {
  const { boardId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <SiteHeader />
        <div className="grid flex-1 place-items-center text-sm text-muted">加载中…</div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <BoardEditor boardId={boardId} />;
}
