import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import {
  arrowHead,
  clampPoint,
  curveControl,
  normalizeMark,
  translateMark,
  zoneRadii,
} from "@/lib/tactics";
import type { TacticMark } from "@/lib/types";

type Handle = "start" | "end" | "control" | "rx" | "ry";

export function TacticsLayer({
  marks,
  draft,
  selectedId,
  interactive,
  pointFromEvent,
  onSelect,
  onChange,
}: {
  marks: TacticMark[];
  draft?: TacticMark | null;
  selectedId?: string | null;
  interactive?: boolean;
  pointFromEvent: (clientX: number, clientY: number) => { x: number; y: number };
  onSelect?: (id: string | null) => void;
  onChange?: (next: TacticMark[], persist: boolean) => void;
}) {
  const dragRef = useRef<{
    id: string;
    mode: "move" | Handle;
    origin: { x: number; y: number };
    mark: TacticMark;
  } | null>(null);
  const lastRef = useRef<TacticMark | null>(null);

  const all = draft ? [...marks, draft] : marks;

  function patchMark(id: string, next: TacticMark, persist: boolean) {
    lastRef.current = next;
    onChange?.(
      marks.map((m) => (m.id === id ? next : m)),
      persist,
    );
  }

  function beginDrag(
    mark: TacticMark,
    mode: "move" | Handle,
    e: ReactPointerEvent,
  ) {
    if (!interactive || mark.id === "draft") return;
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(mark.id);
    const origin = pointFromEvent(e.clientX, e.clientY);
    dragRef.current = { id: mark.id, mode, origin, mark: { ...mark } };
    lastRef.current = mark;
    const move = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const pos = pointFromEvent(ev.clientX, ev.clientY);
      const dx = pos.x - drag.origin.x;
      const dy = pos.y - drag.origin.y;
      const next =
        drag.mode === "move"
          ? translateMark(drag.mark, dx, dy)
          : reshape(drag.mark, drag.mode, pos);
      patchMark(drag.id, next, false);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag || !lastRef.current) return;
      patchMark(drag.id, normalizeMark(lastRef.current), true);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {all.map((m) => {
        const active = m.id === selectedId;
        const stroke = active ? "var(--color-primary)" : "var(--color-line)";
        return (
          <g key={m.id}>
            {m.kind === "arrow" ? (
              <StraightArrow
                mark={m}
                stroke={stroke}
                active={active}
                interactive={interactive}
                onBodyDown={(e) => beginDrag(m, "move", e)}
              />
            ) : null}
            {m.kind === "curve" ? (
              <CurveArrow
                mark={m}
                stroke={stroke}
                active={active}
                interactive={interactive}
                onBodyDown={(e) => beginDrag(m, "move", e)}
              />
            ) : null}
            {m.kind === "zone" ? (
              <PressZone
                mark={m}
                stroke={stroke}
                active={active}
                interactive={interactive}
                onBodyDown={(e) => beginDrag(m, "move", e)}
              />
            ) : null}
            {m.kind === "note" ? (
              <NoteMark
                mark={m}
                stroke={stroke}
                interactive={interactive}
                onBodyDown={(e) => beginDrag(m, "move", e)}
              />
            ) : null}
            {active && interactive && m.id !== "draft" ? (
              <Handles mark={m} onDown={(handle, e) => beginDrag(m, handle, e)} />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function StraightArrow({
  mark,
  stroke,
  active,
  interactive,
  onBodyDown,
}: {
  mark: TacticMark;
  stroke: string;
  active: boolean;
  interactive?: boolean;
  onBodyDown: (e: ReactPointerEvent) => void;
}) {
  return (
    <g
      className={interactive ? "cursor-grab" : undefined}
      onPointerDown={onBodyDown}
    >
      <line
        x1={mark.x1}
        y1={mark.y1}
        x2={mark.x2}
        y2={mark.y2}
        stroke="transparent"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <line
        x1={mark.x1}
        y1={mark.y1}
        x2={mark.x2}
        y2={mark.y2}
        stroke={stroke}
        strokeWidth={active ? 0.95 : 0.7}
        strokeLinecap="round"
        opacity={0.95}
      />
      <polygon
        points={arrowHead(mark.x1, mark.y1, mark.x2, mark.y2)}
        fill={stroke}
        opacity={0.95}
      />
    </g>
  );
}

function CurveArrow({
  mark,
  stroke,
  active,
  interactive,
  onBodyDown,
}: {
  mark: TacticMark;
  stroke: string;
  active: boolean;
  interactive?: boolean;
  onBodyDown: (e: ReactPointerEvent) => void;
}) {
  const c = curveControl(mark);
  const d = `M ${mark.x1} ${mark.y1} Q ${c.cx} ${c.cy} ${mark.x2} ${mark.y2}`;
  return (
    <g
      className={interactive ? "cursor-grab" : undefined}
      onPointerDown={onBodyDown}
    >
      <path d={d} fill="none" stroke="transparent" strokeWidth={4.5} />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={active ? 0.95 : 0.7}
        strokeLinecap="round"
        opacity={0.95}
      />
      <polygon
        points={arrowHead(c.cx, c.cy, mark.x2, mark.y2)}
        fill={stroke}
        opacity={0.95}
      />
    </g>
  );
}

function PressZone({
  mark,
  stroke,
  active,
  interactive,
  onBodyDown,
}: {
  mark: TacticMark;
  stroke: string;
  active: boolean;
  interactive?: boolean;
  onBodyDown: (e: ReactPointerEvent) => void;
}) {
  const { rx, ry } = zoneRadii(mark);
  return (
    <ellipse
      cx={mark.x1}
      cy={mark.y1}
      rx={rx}
      ry={ry}
      fill="var(--color-line)"
      fillOpacity={active ? 0.2 : 0.11}
      stroke={stroke}
      strokeWidth={0.55}
      strokeDasharray="1.7 1.15"
      className={interactive ? "cursor-grab" : undefined}
      onPointerDown={onBodyDown}
    />
  );
}

function NoteMark({
  mark,
  stroke,
  interactive,
  onBodyDown,
}: {
  mark: TacticMark;
  stroke: string;
  interactive?: boolean;
  onBodyDown: (e: ReactPointerEvent) => void;
}) {
  return (
    <g
      className={interactive ? "cursor-grab" : undefined}
      onPointerDown={onBodyDown}
    >
      <rect
        x={mark.x1 - 8}
        y={mark.y1 - 3}
        width={16}
        height={6}
        rx={1}
        fill="var(--color-bg)"
        fillOpacity={0.72}
        stroke={stroke}
        strokeWidth={0.4}
      />
      <text
        x={mark.x1}
        y={mark.y1 + 1.1}
        textAnchor="middle"
        fill="var(--color-fg)"
        fontSize="3.2"
        fontFamily="Figtree, sans-serif"
      >
        {(mark.text ?? "备注").slice(0, 10)}
      </text>
    </g>
  );
}

function Handles({
  mark,
  onDown,
}: {
  mark: TacticMark;
  onDown: (handle: Handle, e: ReactPointerEvent) => void;
}) {
  const handles: { id: Handle; x: number; y: number }[] = [];
  if (mark.kind === "arrow" || mark.kind === "curve") {
    handles.push({ id: "start", x: mark.x1, y: mark.y1 });
    handles.push({ id: "end", x: mark.x2, y: mark.y2 });
    if (mark.kind === "curve") {
      const c = curveControl(mark);
      handles.push({ id: "control", x: c.cx, y: c.cy });
    }
  }
  if (mark.kind === "zone") {
    const { rx, ry } = zoneRadii(mark);
    handles.push({ id: "rx", x: mark.x1 + rx, y: mark.y1 });
    handles.push({ id: "ry", x: mark.x1, y: mark.y1 - ry });
  }
  return (
    <>
      {mark.kind === "curve"
        ? (() => {
            const c = curveControl(mark);
            return (
              <line
                x1={(mark.x1 + mark.x2) / 2}
                y1={(mark.y1 + mark.y2) / 2}
                x2={c.cx}
                y2={c.cy}
                stroke="var(--color-primary)"
                strokeWidth={0.35}
                strokeDasharray="1 0.8"
                opacity={0.7}
              />
            );
          })()
        : null}
      {handles.map((h) => (
        <g
          key={h.id}
          className="cursor-nwse-resize"
          onPointerDown={(e) => {
            e.stopPropagation();
            onDown(h.id, e);
          }}
        >
          <circle cx={h.x} cy={h.y} r={3.2} fill="transparent" />
          <circle
            cx={h.x}
            cy={h.y}
            r={1.35}
            fill="var(--color-primary)"
            stroke="var(--color-bg)"
            strokeWidth={0.45}
          />
        </g>
      ))}
    </>
  );
}

function reshape(mark: TacticMark, handle: Handle, pos: { x: number; y: number }): TacticMark {
  const p = clampPoint(pos.x, pos.y);
  if (handle === "start") {
    return normalizeMark({ ...mark, x1: p.x, y1: p.y });
  }
  if (handle === "end") {
    return normalizeMark({ ...mark, x2: p.x, y2: p.y });
  }
  if (handle === "control") {
    return { ...mark, cx: p.x, cy: p.y };
  }
  if (mark.kind === "zone" && handle === "rx") {
    const rx = Math.max(Math.abs(p.x - mark.x1), 1.6);
    return normalizeMark({ ...mark, rx, x2: mark.x1 + rx });
  }
  if (mark.kind === "zone" && handle === "ry") {
    const ry = Math.max(Math.abs(p.y - mark.y1), 1.6);
    return normalizeMark({ ...mark, ry, y2: mark.y1 + ry });
  }
  return mark;
}
