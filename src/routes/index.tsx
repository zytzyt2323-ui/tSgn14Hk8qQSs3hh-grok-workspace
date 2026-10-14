import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PitchField } from "@/components/pitch-field";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBoard, joinBoard, listBoards } from "@/lib/board-api";
import { FORMATION_BY_ID, slotsForSide } from "@/lib/formations";
import { parseJoinCode } from "@/lib/share";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { BoardSummary } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user } = useCurrentUserState();
  if (user) return <Dashboard />;
  return <Landing />;
}

function Landing() {
  const home = slotsForSide(FORMATION_BY_ID["4-3-3"]!, "home");
  const away = slotsForSide(FORMATION_BY_ID["4-3-3"]!, "away");
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
        <div className="max-w-lg">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
            阵型板
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] font-semibold tracking-tight sm:text-6xl">
            主队客队
            <br />
            同一块球场
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            两队对阵排阵。按住向外拉出圆形或椭圆压迫圈，直线或弧线画跑位，画完还能拖着改。把链接发给朋友，打开就能一起改。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/login" search={{}}>
                开始排阵
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/login" search={{}}>
                加入已有战术板
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[22rem]">
          <PitchField>
            {home.map((s, i) => (
              <span
                key={`h-${s.role}-${i}`}
                className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line/80 bg-kit-home font-display text-[11px] font-semibold text-kit-home-ink"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                {s.role}
              </span>
            ))}
            {away.map((s, i) => (
              <span
                key={`a-${s.role}-${i}`}
                className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line/50 bg-kit-away font-display text-[11px] font-semibold text-kit-away-ink"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                {s.role}
              </span>
            ))}
          </PitchField>
        </div>
      </main>
    </div>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState("周末友谊赛");
  const [code, setCode] = useState("");

  const boardsQuery = useQuery({
    queryKey: ["boards"],
    queryFn: () => listBoards(),
  });

  const createMut = useMutation({
    mutationFn: () => createBoard({ data: { name: name.trim() || "未命名战术板" } }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["boards"] });
      setCreateOpen(false);
      void navigate({ to: "/board/$boardId", params: { boardId: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const joinMut = useMutation({
    mutationFn: () => joinBoard({ data: { code: parseJoinCode(code) } }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["boards"] });
      setJoinOpen(false);
      void navigate({ to: "/board/$boardId", params: { boardId: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const boards = boardsQuery.data ?? [];

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">我的战术板</h1>
            <p className="mt-1 text-sm text-muted">创建新的对阵，或用链接 / 邀请码加入朋友的板。</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setJoinOpen(true)}>
              加入
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              新建
            </Button>
          </div>
        </div>

        {boardsQuery.isPending ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-2xl">还没有战术板</p>
            <p className="mt-2 text-sm text-muted">建一块，把人拉进来，主客一起排 4-3-3。</p>
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>
              创建第一块
            </Button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <BoardCard key={b.id} board={b} />
            ))}
          </ul>
        )}
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogTitle>新战术板</DialogTitle>
          <DialogDescription>先起个名字，进去再排主客两队。</DialogDescription>
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
          >
            <Label htmlFor="board-name">名称</Label>
            <Input
              id="board-name"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "创建中…" : "创建并打开"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogTitle>加入战术板</DialogTitle>
          <DialogDescription>粘贴朋友发来的链接，或输入 6 位邀请码。</DialogDescription>
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              joinMut.mutate();
            }}
          >
            <Label htmlFor="join-code">链接或邀请码</Label>
            <Input
              id="join-code"
              value={code}
              placeholder="https://…/join/7K2M9Q"
              className="font-display text-base tracking-wide"
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" disabled={joinMut.isPending || parseJoinCode(code).length < 4}>
              {joinMut.isPending ? "加入中…" : "加入"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BoardCard({ board }: { board: BoardSummary }) {
  const home = FORMATION_BY_ID[board.formation]?.slots ?? [];
  const away = slotsForSide(FORMATION_BY_ID[board.formation] ?? FORMATION_BY_ID["4-3-3"]!, "away");
  return (
    <li>
      <Link
        to="/board/$boardId"
        params={{ boardId: board.id }}
        className="block overflow-hidden rounded-xl border border-border bg-surface no-underline transition-colors duration-150 hover:border-muted"
      >
        <div className="relative h-28 overflow-hidden px-8 pt-3">
          <PitchField className="mx-auto max-h-28 border-0 shadow-none">
            {home.slice(0, 11).map((s, i) => (
              <span
                key={`h${i}`}
                className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kit-home"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              />
            ))}
            {away.slice(0, 11).map((s, i) => (
              <span
                key={`a${i}`}
                className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kit-away"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              />
            ))}
          </PitchField>
        </div>
        <div className="px-4 pt-2 pb-4">
          <p className="truncate font-medium text-fg">{board.name}</p>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span>{board.formation}</span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" />
              {board.memberCount}
            </span>
            <span>{board.playerCount} 人</span>
            {board.isOwner ? <span>我创建的</span> : <span>共用</span>}
          </p>
        </div>
      </Link>
    </li>
  );
}
