import {
  bandPlayers,
  chainPairs,
  completePairs,
  hullPath,
  paddedHull,
  ringPoints,
  type LineBand,
} from "@/lib/lines";
import type { Player, Side } from "@/lib/types";

export type DemoMove = {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export type DemoStep = {
  moves: DemoMove[];
};

export function ghostOrigins(steps: DemoStep[]): DemoMove[] {
  const map = new Map<string, DemoMove>();
  for (const step of steps) {
    for (const move of step.moves) {
      const prev = map.get(move.id);
      if (!prev) map.set(move.id, { ...move });
      else map.set(move.id, { ...prev, toX: move.toX, toY: move.toY });
    }
  }
  return [...map.values()];
}

export function demoPosition(
  id: string,
  steps: DemoStep[],
  index: number,
  t: number,
): { x: number; y: number } | null {
  let held: { x: number; y: number } | null = null;
  for (let i = 0; i < steps.length; i++) {
    const move = steps[i]!.moves.find((item) => item.id === id);
    if (i < index) {
      if (move) held = { x: move.toX, y: move.toY };
      continue;
    }
    if (i > index) break;
    if (move) {
      return {
        x: move.fromX + (move.toX - move.fromX) * t,
        y: move.fromY + (move.toY - move.fromY) * t,
      };
    }
    if (held) return held;
    for (let j = i + 1; j < steps.length; j++) {
      const later = steps[j]!.moves.find((item) => item.id === id);
      if (later) return { x: later.fromX, y: later.fromY };
    }
    return null;
  }
  return held;
}

export function ShapeLayer({
  players,
  side,
  links,
  steps,
}: {
  players: Player[];
  side: Side;
  links: Record<LineBand, boolean>;
  steps: DemoStep[];
}) {
  const bands = bandPlayers(players, side);
  const attack = bands.attack;
  const mid = bands.mid;
  const defense = bands.defense;
  const midPts = mid.map((player) => ({ x: player.x as number, y: player.y as number }));
  const zone = midPts.length >= 3 ? paddedHull(midPts, 8) : [];
  const ring = ringPoints(attack);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {links.mid && zone.length >= 3 ? (
        <path
          d={hullPath(zone)}
          fill="var(--color-line)"
          fillOpacity={0.14}
          stroke="var(--color-line)"
          strokeOpacity={0.55}
          strokeWidth={0.45}
          strokeDasharray="1.8 1.2"
        />
      ) : null}

      {links.defense
        ? chainPairs(defense).map(([a, b], i) => (
            <line
              key={`d-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--color-line)"
              strokeWidth={0.55}
              strokeOpacity={0.7}
            />
          ))
        : null}

      {links.attack && ring.length >= 3 ? (
        <path
          d={hullPath(ring)}
          fill="var(--color-line)"
          fillOpacity={0.1}
          stroke="var(--color-line)"
          strokeWidth={0.6}
          strokeOpacity={0.85}
          strokeLinejoin="round"
        />
      ) : null}
      {links.attack && ring.length === 2 ? (
        <line
          x1={ring[0]!.x}
          y1={ring[0]!.y}
          x2={ring[1]!.x}
          y2={ring[1]!.y}
          stroke="var(--color-line)"
          strokeWidth={0.6}
          strokeOpacity={0.85}
        />
      ) : null}

      {links.mid
        ? completePairs(mid).map(([a, b], i) => (
            <line
              key={`m-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--color-line)"
              strokeWidth={0.32}
              strokeOpacity={0.42}
            />
          ))
        : null}

      {steps.flatMap((step, stepIndex) =>
        step.moves.map((move) => (
          <line
            key={`demo-${stepIndex}-${move.id}`}
            x1={move.fromX}
            y1={move.fromY}
            x2={move.toX}
            y2={move.toY}
            stroke="var(--color-primary)"
            strokeWidth={0.7}
            strokeDasharray="1.6 1.15"
            strokeOpacity={0.85}
            strokeLinecap="round"
          />
        )),
      )}
    </svg>
  );
}
