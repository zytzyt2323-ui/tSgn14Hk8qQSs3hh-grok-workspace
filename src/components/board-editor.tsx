import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ChevronLeft,
  Circle,
  Copy,
  Eraser,
  Footprints,
  Link2,
  MousePointer2,
  Play,
  Plus,
  RotateCcw,
  Share2,
  Shirt,
  Spline,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { toast } from "sonner";
import { PitchField } from "@/components/pitch-field";
import { PlayerForm } from "@/components/player-form";
import { PlayerToken } from "@/components/player-token";
import { SiteHeader } from "@/components/site-header";
import { ShapeLayer, demoPosition, ghostOrigins, type DemoMove, type DemoStep } from "@/components/shape-layer";
import { TacticsLayer } from "@/components/tactics-layer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  applyFormation,
  deleteBoard,
  deletePlayer,
  getBoard,
  leaveBoard,
  movePlayer,
  movePlayers,
  addPlayer,
  renameBoard,
  saveTactics,
  seedSquad,
  setBoardMeta,
  updatePlayer,
} from "@/lib/board-api";
import { FORMATIONS, slotsForSide } from "@/lib/formations";
import type { LineBand } from "@/lib/lines";
import { joinUrl } from "@/lib/share";
import { isUsefulMark, normalizeMark } from "@/lib/tactics";
import {
  KITS,
  ROLE_LABEL,
  SIDES,
  type KitId,
  type Player,
  type Side,
  type TacticKind,
  type TacticMark,
} from "@/lib/types";
import { clamp, cn } from "@/lib/utils";

type Tool = "select" | "demo" | TacticKind;

export function BoardEditor({ boardId }: { boardId: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pitchRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<string | null>(null);
  const tacticsDragRef = useRef(false);
  const playersRef = useRef<Player[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tactics, setTactics] = useState<TacticMark[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [draft, setDraft] = useState<TacticMark | null>(null);
  const [selectedMark, setSelectedMark] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"pitch" | "squad">("pitch");
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<Side>("home");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);
  const [draftMoves, setDraftMoves] = useState<DemoMove[]>([]);
  const [links, setLinks] = useState<Record<LineBand, boolean>>({
    attack: false,
    mid: false,
    defense: false,
  });
  const [anim, setAnim] = useState<{ index: number; t: number } | null>(null);
  const animRef = useRef<number | null>(null);
  const draftRef = useRef<DemoMove[]>([]);
  const groupDragRef = useRef<{
    ids: string[];
    start: { x: number; y: number };
    origins: Record<string, { x: number; y: number }>;
  } | null>(null);

  const boardQuery = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoard({ data: { boardId } }),
    refetchInterval: () =>
      draggingRef.current || groupDragRef.current || anim != null ? false : 2800,
  });

  useEffect(() => {
    if (!boardQuery.data || draggingRef.current || tacticsDragRef.current || groupDragRef.current || anim != null)
      return;
    setPlayers(boardQuery.data.players);
    setTactics(boardQuery.data.tactics);
  }, [boardQuery.data]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    draftRef.current = draftMoves;
  }, [draftMoves]);

  useEffect(() => {
    return () => {
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["board", boardId] });

  const moveMut = useMutation({
    mutationFn: (input: { playerId: string; onPitch: boolean; x: number | null; y: number | null }) =>
      movePlayer({ data: input }),
    onSettled: invalidate,
  });
  const tacticsMut = useMutation({
    mutationFn: (next: TacticMark[]) => saveTactics({ data: { boardId, tactics: next } }),
  });
  const formationMut = useMutation({
    mutationFn: (input: { formationId: string; side: Side }) =>
      applyFormation({ data: { boardId, formationId: input.formationId, side: input.side } }),
    onSuccess: invalidate,
  });
  const kitMut = useMutation({
    mutationFn: (input: { kit?: KitId; awayKit?: KitId }) =>
      setBoardMeta({ data: { boardId, ...input } }),
    onSuccess: invalidate,
  });
  const addMut = useMutation({
    mutationFn: addPlayer,
    onSuccess: () => {
      setAddOpen(false);
      invalidate();
      toast.success("已加入名单");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateMut = useMutation({
    mutationFn: updatePlayer,
    onSuccess: () => {
      setEditPlayer(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const seedMut = useMutation({
    mutationFn: (side?: Side) => seedSquad({ data: { boardId, side } }),
    onSuccess: () => {
      invalidate();
      toast.success("已填入示例名单，可以开始拖动");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const board = boardQuery.data;
  const kitFor = (side: Side): KitId =>
    side === "away" ? (board?.awayKit ?? "away") : (board?.kit ?? "home");
  const formationFor = (side: Side) =>
    side === "away" ? (board?.awayFormation ?? "4-3-3") : (board?.formation ?? "4-3-3");
  const sidePlayers = players.filter((p) => p.side === activeSide);
  const sideOnPitch = sidePlayers.filter((p) => p.onPitch);
  const sideBench = sidePlayers.filter((p) => !p.onPitch);
  const homeCount = players.filter((p) => p.side === "home").length;
  const awayCount = players.filter((p) => p.side === "away").length;

  const persistTactics = useCallback(
    (next: TacticMark[]) => {
      setTactics(next);
      tacticsMut.mutate(next);
    },
    [tacticsMut],
  );

  const pitchPercent = useCallback((clientX: number, clientY: number) => {
    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 1.5, 98.5),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 1.5, 98.5),
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (!selectedMark) return;
      e.preventDefault();
      persistTactics(tactics.filter((m) => m.id !== selectedMark));
      setSelectedMark(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedMark, tactics, persistTactics]);

  function onTokenPointerDown(player: Player, e: ReactPointerEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (tool !== "select" && tool !== "demo") return;
    e.preventDefault();
    setSelectedMark(null);
    setActiveSide(player.side);
    setMobileTab("pitch");

    if (tool === "demo") {
      const current = selectedIds;
      const already = current.includes(player.id);
      let ids: string[];
      if (addMode) {
        ids = already ? current : [...current, player.id];
      } else if (already) {
        ids = current;
      } else {
        const draft = draftRef.current;
        if (draft.length > 0 && draft.some((move) => move.id !== player.id)) {
          setDemoSteps((prev) => [...prev, { moves: draft }]);
          draftRef.current = [];
          setDraftMoves([]);
        }
        ids = [player.id];
      }
      setSelectedIds(ids);
      const origin = pitchPercent(e.clientX, e.clientY);
      const origins: Record<string, { x: number; y: number }> = {};
      for (const id of ids) {
        const p = playersRef.current.find((row) => row.id === id);
        if (p?.x != null && p.y != null) origins[id] = { x: p.x, y: p.y };
      }
      if (player.x == null || player.y == null) {
        origins[player.id] = origin;
        setPlayers((prev) =>
          prev.map((p) => (p.id === player.id ? { ...p, onPitch: true, x: origin.x, y: origin.y } : p)),
        );
      }
      groupDragRef.current = { ids, start: origin, origins };
      draggingRef.current = player.id;
      setDraggingId(player.id);

      const move = (ev: PointerEvent) => {
        const group = groupDragRef.current;
        if (!group) return;
        const pos = pitchPercent(ev.clientX, ev.clientY);
        const dx = pos.x - group.start.x;
        const dy = pos.y - group.start.y;
        setPlayers((prev) =>
          prev.map((p) => {
            const o = group.origins[p.id];
            if (!o) return p;
            return {
              ...p,
              onPitch: true,
              x: clamp(o.x + dx, 1.5, 98.5),
              y: clamp(o.y + dy, 1.5, 98.5),
            };
          }),
        );
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        const group = groupDragRef.current;
        groupDragRef.current = null;
        draggingRef.current = null;
        setDraggingId(null);
        if (!group) return;
        const latest = playersRef.current;
        const moved = group.ids
          .map((id) => {
            const p = latest.find((row) => row.id === id);
            const from = group.origins[id];
            if (!p || !from || p.x == null || p.y == null) return null;
            return { id, fromX: from.x, fromY: from.y, toX: p.x, toY: p.y, player: p };
          })
          .filter((row): row is NonNullable<typeof row> => row !== null);
        if (moved.length === 0) return;
        const shifted = moved.some((m) => Math.hypot(m.toX - m.fromX, m.toY - m.fromY) > 1.2);
        if (shifted) {
          setDraftMoves((prev) => {
            const next = [...prev];
            for (const move of moved) {
              const existing = next.findIndex((row) => row.id === move.id);
              if (existing >= 0) {
                next[existing] = {
                  ...next[existing]!,
                  toX: move.toX,
                  toY: move.toY,
                };
              } else {
                next.push({
                  id: move.id,
                  fromX: move.fromX,
                  fromY: move.fromY,
                  toX: move.toX,
                  toY: move.toY,
                });
              }
            }
            draftRef.current = next;
            return next;
          });
          void movePlayers({
            data: {
              moves: moved.map((move) => ({
                playerId: move.id,
                onPitch: true,
                x: move.toX,
                y: move.toY,
              })),
            },
          });
        }
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      return;
    }

    draggingRef.current = player.id;
    setDraggingId(player.id);
    setSelectedPlayer(player.id);
    const { x, y } = pitchPercent(e.clientX, e.clientY);
    if (!player.onPitch) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === player.id ? { ...p, onPitch: true, x, y } : p)),
      );
    }
    const move = (ev: PointerEvent) => {
      if (draggingRef.current !== player.id) return;
      const pos = pitchPercent(ev.clientX, ev.clientY);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === player.id ? { ...p, onPitch: true, x: pos.x, y: pos.y } : p,
        ),
      );
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      onTokenPointerUp();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  function onTokenPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (groupDragRef.current) return;
    const id = draggingRef.current;
    if (!id) return;
    const { x, y } = pitchPercent(e.clientX, e.clientY);
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, onPitch: true, x, y } : p)),
    );
  }

  function onTokenPointerUp() {
    const id = draggingRef.current;
    if (!id) return;
    draggingRef.current = null;
    setDraggingId(null);
    const p = playersRef.current.find((x) => x.id === id);
    if (p) {
      moveMut.mutate({
        playerId: p.id,
        onPitch: true,
        x: p.x ?? 50,
        y: p.y ?? 50,
      });
    }
  }

  function sendToBench(playerId: string) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, onPitch: false, x: null, y: null } : p)),
    );
    moveMut.mutate({ playerId, onPitch: false, x: null, y: null });
  }

  function onPitchPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (tool === "select") {
      setSelectedMark(null);
      setSelectedPlayer(null);
      return;
    }
    if (tool === "demo") {
      setSelectedIds([]);
      setSelectedPlayer(null);
      return;
    }
    const { x, y } = pitchPercent(e.clientX, e.clientY);
    if (tool === "note") {
      const text = window.prompt("战术备注", "压迫")?.trim();
      if (!text) return;
      persistTactics([
        ...tactics,
        { id: crypto.randomUUID(), kind: "note", x1: x, y1: y, x2: x, y2: y, text },
      ]);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const mark: TacticMark = {
      id: "draft",
      kind: tool,
      x1: x,
      y1: y,
      x2: x,
      y2: y,
    };
    if (tool === "zone") {
      mark.rx = 1.6;
      mark.ry = 1.6;
    }
    setDraft(mark);
  }

  function onPitchPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draft) return;
    const { x, y } = pitchPercent(e.clientX, e.clientY);
    if (draft.kind === "zone") {
      const rx = Math.max(Math.abs(x - draft.x1), 1.6);
      const ry = Math.max(Math.abs(y - draft.y1), 1.6);
      setDraft({ ...draft, x2: draft.x1 + rx, y2: draft.y1 + ry, rx, ry });
      return;
    }
    if (draft.kind === "curve") {
      const next = { ...draft, x2: x, y2: y };
      const dx = x - draft.x1;
      const dy = y - draft.y1;
      const len = Math.hypot(dx, dy) || 1;
      setDraft({
        ...next,
        cx: (draft.x1 + x) / 2 - (dy / len) * len * 0.32,
        cy: (draft.y1 + y) / 2 + (dx / len) * len * 0.32,
      });
      return;
    }
    setDraft({ ...draft, x2: x, y2: y });
  }

  function onPitchPointerUp() {
    if (!draft) return;
    const mark = normalizeMark({ ...draft, id: crypto.randomUUID() });
    setDraft(null);
    if (!isUsefulMark(mark)) return;
    persistTactics([...tactics, mark]);
    setSelectedMark(mark.id);
    setTool("select");
  }

  async function copyShare(kind: "url" | "code") {
    if (!board) return;
    const text = kind === "url" ? joinUrl(board.shareCode) : board.shareCode;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(kind === "url" ? "链接已复制，发给朋友即可打开" : "邀请码已复制");
    } catch {
      toast.message(text);
    }
  }

  async function nativeShare() {
    if (!board || !navigator.share) return;
    try {
      await navigator.share({
        title: board.name,
        text: `加入战术板「${board.name}」`,
        url: joinUrl(board.shareCode),
      });
    } catch {
      /* user cancelled */
    }
  }

  function demoSequence(): DemoStep[] {
    return draftMoves.length > 0 ? [...demoSteps, { moves: draftMoves }] : demoSteps;
  }

  function playDemo() {
    const sequence = demoSequence();
    if (sequence.length === 0 || animRef.current != null) return;
    const stepMs = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const total = sequence.length * stepMs;
      const clamped = Math.min(elapsed, total);
      const index = Math.min(sequence.length - 1, Math.floor(clamped / stepMs));
      const local = Math.min(1, (clamped - index * stepMs) / stepMs);
      const eased = 1 - (1 - local) ** 3;
      setAnim({ index, t: eased });
      if (elapsed < total) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
        setAnim(null);
      }
    };
    setAnim({ index: 0, t: 0 });
    animRef.current = requestAnimationFrame(tick);
  }

  function restoreDemo() {
    const sequence = demoSequence();
    const origins = ghostOrigins(sequence);
    if (origins.length === 0) return;
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setAnim(null);
    setPlayers((prev) =>
      prev.map((player) => {
        const origin = origins.find((row) => row.id === player.id);
        return origin ? { ...player, onPitch: true, x: origin.fromX, y: origin.fromY } : player;
      }),
    );
    void movePlayers({
      data: {
        moves: origins.map((origin) => ({
          playerId: origin.id,
          onPitch: true,
          x: origin.fromX,
          y: origin.fromY,
        })),
      },
    });
    draftRef.current = [];
    setDraftMoves([]);
    setDemoSteps([]);
    setSelectedIds([]);
  }

  function nextDemoStep() {
    const draft = draftRef.current;
    if (draft.length > 0) {
      setDemoSteps((prev) => [...prev, { moves: draft }]);
      draftRef.current = [];
      setDraftMoves([]);
    }
    setSelectedIds([]);
  }

  function displayedPlayers(): Player[] {
    if (anim == null) return players;
    const sequence = demoSequence();
    return players.map((player) => {
      const pos = demoPosition(player.id, sequence, anim.index, anim.t);
      return pos ? { ...player, x: pos.x, y: pos.y } : player;
    });
  }

  if (boardQuery.isPending) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <SiteHeader />
        <div className="grid flex-1 place-items-center text-sm text-muted">球场加载中…</div>
      </div>
    );
  }

  if (boardQuery.isError || !board) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <SiteHeader />
        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <p className="font-display text-2xl">打不开这块战术板</p>
            <p className="mt-2 text-sm text-muted">
              {boardQuery.error instanceof Error
                ? boardQuery.error.message
                : "可能没有权限，或邀请链接已失效。"}
            </p>
            <Button asChild className="mt-6">
              <Link to="/">返回列表</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tools: { id: Tool; label: string; icon: typeof MousePointer2 }[] = [
    { id: "select", label: "移动", icon: MousePointer2 },
    { id: "demo", label: "演示", icon: Footprints },
    { id: "arrow", label: "直线", icon: ArrowUpRight },
    { id: "curve", label: "弧线", icon: Spline },
    { id: "zone", label: "压迫圈", icon: Circle },
    { id: "note", label: "备注", icon: StickyNote },
  ];

  const shareLink = joinUrl(board.shareCode);

  const squadPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex overflow-hidden rounded-sm border border-border">
        {SIDES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSide(s.id)}
            className={cn(
              "h-10 flex-1 text-sm",
              activeSide === s.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
            )}
          >
            {s.label}
            <span className="ml-1 tabular-nums text-subtle">
              {s.id === "home" ? homeCount : awayCount}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between px-1 pb-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted">
            {activeSide === "home" ? "主队名单" : "客队名单"}
          </p>
          <p className="font-display text-xl font-semibold tabular-nums">
            {sideOnPitch.length}
            <span className="text-muted"> / {sidePlayers.length}</span>
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          添加
        </Button>
      </div>

      {sidePlayers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
          <p>这支队伍还没有球员。添加自己的人，或先填入示例名单。</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={seedMut.isPending}
              onClick={() => seedMut.mutate(activeSide)}
            >
              {seedMut.isPending ? "填入中…" : "填入本队 11 人"}
            </Button>
            {players.length === 0 ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={seedMut.isPending}
                onClick={() => seedMut.mutate(undefined)}
              >
                填入主客两队
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {sideOnPitch.length > 0 ? (
        <p className="mb-2 text-xs font-medium text-subtle">场上</p>
      ) : null}
      <ul className="flex flex-col gap-1 overflow-y-auto">
        {sideOnPitch.map((p) => (
          <SquadRow
            key={p.id}
            player={p}
            active={selectedPlayer === p.id}
            onSelect={() => setSelectedPlayer(p.id)}
            onEdit={() => setEditPlayer(p)}
            onBench={() => sendToBench(p.id)}
            onDelete={() => {
              void deletePlayer({ data: { playerId: p.id } }).then(invalidate);
            }}
          />
        ))}
      </ul>
      {sideBench.length > 0 ? (
        <p className="mt-4 mb-2 text-xs font-medium text-subtle">替补席 · 拖到球场上场</p>
      ) : null}
      <ul className="flex flex-col gap-1 overflow-y-auto pb-4">
        {sideBench.map((p) => (
          <SquadRow
            key={p.id}
            player={p}
            active={selectedPlayer === p.id}
            onSelect={() => setSelectedPlayer(p.id)}
            onEdit={() => setEditPlayer(p)}
            onPitchPlace={() => {
              const formation = FORMATIONS.find((f) => f.id === formationFor(activeSide));
              const slots = formation ? slotsForSide(formation, activeSide) : [];
              const slot = slots[sideOnPitch.length];
              const x = slot?.x ?? 50;
              const y = slot?.y ?? (activeSide === "home" ? 40 : 60);
              setPlayers((prev) =>
                prev.map((row) =>
                  row.id === p.id ? { ...row, onPitch: true, x, y } : row,
                ),
              );
              moveMut.mutate({ playerId: p.id, onPitch: true, x, y });
            }}
            onDelete={() => {
              void deletePlayer({ data: { playerId: p.id } }).then(invalidate);
            }}
            draggableToken
            kit={kitFor(p.side)}
            onTokenPointerDown={(e) => onTokenPointerDown(p, e)}
            onTokenPointerMove={onTokenPointerMove}
            onTokenPointerUp={onTokenPointerUp}
          />
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader
        trailing={
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-sm text-fg"
          >
            <Share2 className="size-3.5" />
            分享
          </button>
        }
      />

      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Link
          to="/"
          className="grid size-9 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg"
        >
          <ChevronLeft className="size-4" />
        </Link>
        {nameDraft == null ? (
          <button
            type="button"
            className="min-w-0 truncate font-display text-lg font-semibold tracking-tight"
            onClick={() => setNameDraft(board.name)}
          >
            {board.name}
          </button>
        ) : (
          <form
            className="min-w-0 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              const name = nameDraft.trim();
              setNameDraft(null);
              if (name && name !== board.name) {
                void renameBoard({ data: { boardId, name } }).then(invalidate);
              }
            }}
          >
            <Input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                const name = nameDraft.trim();
                setNameDraft(null);
                if (name && name !== board.name) {
                  void renameBoard({ data: { boardId, name } }).then(invalidate);
                }
              }}
              className="h-9 max-w-64"
            />
          </form>
        )}
        <span className="hidden text-xs text-subtle sm:inline">
          主 {homeCount} · 客 {awayCount} · {board.members.length} 人共用
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-border p-4 lg:flex lg:flex-col">
          {squadPanel}
        </aside>

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
            <div className="flex overflow-hidden rounded-sm border border-border">
              {SIDES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSide(s.id)}
                  className={cn(
                    "h-10 px-3 text-xs",
                    activeSide === s.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <select
              value={formationFor(activeSide)}
              disabled={formationMut.isPending}
              onChange={(e) => formationMut.mutate({ formationId: e.target.value, side: activeSide })}
              className="h-10 rounded-sm border border-border bg-elevated px-2 text-sm text-fg outline-none"
            >
              {FORMATIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} · {f.line}
                </option>
              ))}
            </select>
            <div className="flex overflow-hidden rounded-sm border border-border">
              {KITS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() =>
                    kitMut.mutate(
                      activeSide === "away" ? { awayKit: k.id } : { kit: k.id },
                    )
                  }
                  className={cn(
                    "h-10 px-2.5 text-xs",
                    kitFor(activeSide) === k.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1 overflow-x-auto">
              {tools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={t.label}
                  onClick={() => setTool(t.id)}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm px-2.5 text-xs",
                    tool === t.id ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg",
                  )}
                >
                  <t.icon className="size-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
              <button
                type="button"
                title="清除战术"
                onClick={() => {
                  persistTactics([]);
                  setSelectedMark(null);
                }}
                className="grid size-10 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg"
              >
                <Eraser className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-1.5">
            <span className="pr-1 text-[11px] text-subtle">连线</span>
            {(
              [
                ["attack", "前场"],
                ["mid", "中场"],
                ["defense", "后场"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setLinks((prev) => ({ ...prev, [id]: !prev[id] }))}
                className={cn(
                  "h-8 rounded-sm px-2.5 text-xs",
                  links[id] ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                {label}
              </button>
            ))}
            {tool === "demo" ? (
              <>
                <button
                  type="button"
                  onClick={() => setAddMode((on) => !on)}
                  className={cn(
                    "h-8 rounded-sm px-2.5 text-xs",
                    addMode ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg",
                  )}
                >
                  加选
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddMode(true);
                    setSelectedIds(
                      players
                        .filter((player) => player.onPitch && player.side === activeSide)
                        .map((player) => player.id),
                    );
                  }}
                  className="h-8 rounded-sm px-2.5 text-xs text-muted hover:bg-elevated hover:text-fg"
                >
                  全体
                </button>
                <button
                  type="button"
                  onClick={nextDemoStep}
                  className="h-8 rounded-sm px-2.5 text-xs text-muted hover:bg-elevated hover:text-fg"
                >
                  下一步
                </button>
                <span className="text-[11px] text-muted">
                  点一个人拖。加选后再点，就会一起动。下一步后换人，其他人停住。
                </span>
              </>
            ) : null}
          </div>

          <div
            className={cn(
              "flex min-h-0 flex-1 items-center justify-center p-3 sm:p-5",
              mobileTab === "squad" ? "hidden lg:flex" : "flex",
            )}
          >
            <div
              ref={pitchRef}
              className="relative h-full w-full max-w-[min(100%,calc((100dvh-13rem)*68/105))]"
              onPointerDown={onPitchPointerDown}
              onPointerMove={onPitchPointerMove}
              onPointerUp={onPitchPointerUp}
            >
              <PitchField className="h-full w-full max-h-full">
                <span className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-sm bg-bg/55 px-2 py-0.5 text-[10px] tracking-widest text-fg/80">
                  客队
                </span>
                <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-sm bg-bg/55 px-2 py-0.5 text-[10px] tracking-widest text-fg/80">
                  主队
                </span>
                <TacticsLayer
                  marks={tactics}
                  draft={draft}
                  selectedId={selectedMark}
                  interactive={tool === "select"}
                  pointFromEvent={pitchPercent}
                  onSelect={(id) => {
                    if (tool === "select") {
                      setSelectedMark(id);
                      setSelectedPlayer(null);
                    }
                  }}
                  onChange={(next, persist) => {
                    tacticsDragRef.current = !persist;
                    setTactics(next);
                    if (persist) tacticsMut.mutate(next);
                  }}
                />
                <ShapeLayer
                  players={displayedPlayers().filter((p) => p.onPitch && p.side === activeSide)}
                  side={activeSide}
                  links={links}
                  steps={demoSequence()}
                />
                {ghostOrigins(demoSequence()).map((move) => {
                  const player = players.find((row) => row.id === move.id);
                  if (!player) return null;
                  return (
                    <div
                      key={`ghost-${move.id}`}
                      className="absolute z-0"
                      style={{
                        left: `${move.fromX}%`,
                        top: `${move.fromY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <PlayerToken player={player} kit={kitFor(player.side)} ghost />
                    </div>
                  );
                })}
                {displayedPlayers()
                  .filter((p) => p.onPitch)
                  .map((p) =>
                  p.x == null || p.y == null ? null : (
                    <div
                      key={p.id}
                      className="absolute z-[1]"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <PlayerToken
                        player={p}
                        kit={kitFor(p.side)}
                        selected={
                          tool === "demo"
                            ? selectedIds.includes(p.id)
                            : selectedPlayer === p.id
                        }
                        dragging={draggingId === p.id || Boolean(groupDragRef.current?.ids.includes(p.id))}
                        onPointerDown={(e) => onTokenPointerDown(p, e)}
                        onPointerMove={onTokenPointerMove}
                        onPointerUp={onTokenPointerUp}
                      />
                    </div>
                  ),
                )}
              </PitchField>
            </div>
          </div>

          {tool === "demo" || demoSequence().length > 0 ? (
            <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2 lg:bottom-20">
              <div className="pointer-events-auto flex items-center gap-2 rounded-md border border-border bg-bg/90 px-2 py-1.5 backdrop-blur-sm">
                <span className="px-1 text-[11px] text-muted">
                  {demoSteps.length + (draftMoves.length > 0 ? 1 : 0)} 步
                </span>
                <Button size="sm" onClick={playDemo} disabled={anim != null || demoSequence().length === 0}>
                  <Play className="size-3.5" />
                  播放
                </Button>
                <Button size="sm" variant="secondary" onClick={nextDemoStep}>
                  下一步
                </Button>
                <Button size="sm" variant="secondary" onClick={restoreDemo} disabled={demoSequence().length === 0}>
                  <RotateCcw className="size-3.5" />
                  还原
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    draftRef.current = [];
                    setDraftMoves([]);
                    setDemoSteps([]);
                    setSelectedIds([]);
                  }}
                >
                  清除轨迹
                </Button>
              </div>
            </div>
          ) : null}

          {selectedMark || selectedPlayer ? (
            <div className="pointer-events-none absolute right-4 bottom-20 hidden lg:block">
              <div className="pointer-events-auto flex gap-2">
                {selectedPlayer ? (
                  <Button size="sm" variant="secondary" onClick={() => sendToBench(selectedPlayer)}>
                    下场
                  </Button>
                ) : null}
                {selectedMark ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      persistTactics(tactics.filter((m) => m.id !== selectedMark));
                      setSelectedMark(null);
                    }}
                  >
                    删除标记
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {mobileTab === "squad" ? (
            <div className="flex-1 overflow-y-auto p-4 lg:hidden">{squadPanel}</div>
          ) : null}

          <nav className="flex items-center gap-1 border-t border-border p-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab("pitch")}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-sm text-sm",
                mobileTab === "pitch" ? "bg-elevated text-fg" : "text-muted",
              )}
            >
              <Shirt className="size-4" />
              球场
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("squad")}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-sm text-sm",
                mobileTab === "squad" ? "bg-elevated text-fg" : "text-muted",
              )}
            >
              <Users className="size-4" />
              名单
            </button>
          </nav>
        </section>
      </div>

      <DragWindow
        active={!!draggingId && tool !== "demo"}
        onMove={(e) => {
          const id = draggingRef.current;
          if (!id) return;
          const { x, y } = pitchPercent(e.clientX, e.clientY);
          setPlayers((prev) =>
            prev.map((p) => (p.id === id ? { ...p, onPitch: true, x, y } : p)),
          );
        }}
        onUp={onTokenPointerUp}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogTitle>添加{activeSide === "home" ? "主队" : "客队"}球员</DialogTitle>
          <DialogDescription>写上名字、号码，也可以上传头像。</DialogDescription>
          <PlayerForm
            submitLabel="加入名单"
            pending={addMut.isPending}
            onSubmit={(draftPlayer) => {
              addMut.mutate({
                data: {
                  boardId,
                  name: draftPlayer.name,
                  number: draftPlayer.number ? Number(draftPlayer.number) : null,
                  prefRole: draftPlayer.prefRole,
                  photo: draftPlayer.photo,
                  side: activeSide,
                },
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPlayer} onOpenChange={(o) => !o && setEditPlayer(null)}>
        <DialogContent>
          <DialogTitle>编辑球员</DialogTitle>
          <DialogDescription>改资料或换一张头像。</DialogDescription>
          {editPlayer ? (
            <PlayerForm
              key={editPlayer.id}
              initial={{
                name: editPlayer.name,
                number: editPlayer.number != null ? String(editPlayer.number) : "",
                prefRole: editPlayer.prefRole,
                photo: editPlayer.photo,
              }}
              submitLabel="保存"
              pending={updateMut.isPending}
              onSubmit={(draftPlayer) => {
                updateMut.mutate({
                  data: {
                    playerId: editPlayer.id,
                    name: draftPlayer.name,
                    number: draftPlayer.number ? Number(draftPlayer.number) : null,
                    prefRole: draftPlayer.prefRole,
                    photo: draftPlayer.photo,
                  },
                });
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogTitle>网上共用</DialogTitle>
          <DialogDescription>
            把链接发到微信、群聊或邮件。对方打开并登录后，就会加入这块战术板。
          </DialogDescription>
          <div className="mt-4 rounded-sm border border-border bg-elevated px-3 py-2">
            <p className="truncate font-mono text-xs text-fg">{shareLink}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button className="flex-1" onClick={() => void copyShare("url")}>
              <Link2 className="size-4" />
              复制链接
            </Button>
            {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
              <Button variant="secondary" onClick={() => void nativeShare()}>
                <Share2 className="size-4" />
                系统分享
              </Button>
            ) : null}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex h-12 flex-1 items-center justify-center rounded-sm border border-border bg-elevated font-display text-2xl font-semibold tracking-[0.3em]">
              {board.shareCode}
            </div>
            <Button size="icon" variant="secondary" onClick={() => void copyShare("code")}>
              <Copy className="size-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            当前 {board.members.length} 人在这块板上
            {board.isOwner ? " · 你是创建者" : ""}
          </p>
          <div className="mt-4 flex gap-2">
            {board.isOwner ? (
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  if (!window.confirm("确定删除这块战术板？球员也会一起删掉。")) return;
                  void deleteBoard({ data: { boardId } }).then(() =>
                    navigate({ to: "/" }),
                  );
                }}
              >
                删除战术板
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  void leaveBoard({ data: { boardId } }).then(() => navigate({ to: "/" }));
                }}
              >
                退出
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DragWindow({
  active,
  onMove,
  onUp,
}: {
  active: boolean;
  onMove: (e: PointerEvent) => void;
  onUp: () => void;
}) {
  useEffect(() => {
    if (!active) return;
    const move = (e: PointerEvent) => onMove(e);
    const up = () => onUp();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [active, onMove, onUp]);
  return null;
}

function SquadRow({
  player,
  active,
  kit,
  onSelect,
  onEdit,
  onBench,
  onPitchPlace,
  onDelete,
  draggableToken,
  onTokenPointerDown,
  onTokenPointerMove,
  onTokenPointerUp,
}: {
  player: Player;
  active?: boolean;
  kit?: KitId;
  onSelect: () => void;
  onEdit: () => void;
  onBench?: () => void;
  onPitchPlace?: () => void;
  onDelete: () => void;
  draggableToken?: boolean;
  onTokenPointerDown?: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onTokenPointerMove?: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onTokenPointerUp?: () => void;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-md px-1.5 py-1",
        active ? "bg-elevated" : "hover:bg-elevated/60",
      )}
    >
      {draggableToken ? (
        <PlayerToken
          player={player}
          kit={kit ?? (player.side === "away" ? "away" : "home")}
          compact
          onPointerDown={onTokenPointerDown}
        />
      ) : (
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-medium">
            <span className="mr-1.5 font-display tabular-nums text-muted">
              {player.number ?? "–"}
            </span>
            {player.name}
          </span>
          <span className="text-[11px] text-subtle">
            {player.prefRole} · {ROLE_LABEL[player.prefRole]}
          </span>
        </button>
      )}
      {draggableToken ? (
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm">{ROLE_LABEL[player.prefRole]}</span>
        </button>
      ) : null}
      {onPitchPlace ? (
        <button type="button" className="text-xs text-muted hover:text-fg" onClick={onPitchPlace}>
          上场
        </button>
      ) : null}
      {onBench ? (
        <button type="button" className="text-xs text-muted hover:text-fg" onClick={onBench}>
          下场
        </button>
      ) : null}
      <button type="button" className="text-xs text-muted hover:text-fg" onClick={onEdit}>
        编辑
      </button>
      <button
        type="button"
        className="grid size-8 place-items-center text-subtle hover:text-danger"
        onClick={onDelete}
        aria-label="删除球员"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}
