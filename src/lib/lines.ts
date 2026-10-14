import type { Player, Role, Side } from "@/lib/types";

export type LineBand = "attack" | "mid" | "defense";

const DEF_ROLES = new Set<Role>(["CB", "LB", "RB", "LWB", "RWB"]);

export type Pt = { x: number; y: number; id?: string };

function clusterByY(players: Player[], threshold = 9): Player[][] {
  const sorted = [...players].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
  const bands: Player[][] = [];
  for (const player of sorted) {
    const last = bands[bands.length - 1];
    if (!last) {
      bands.push([player]);
      continue;
    }
    const avg = last.reduce((sum, item) => sum + (item.y ?? 0), 0) / last.length;
    if (Math.abs((player.y ?? 0) - avg) <= threshold) last.push(player);
    else bands.push([player]);
  }
  return bands;
}

/** Who is in the front, middle, and back of the shape actually on the pitch. */
export function bandPlayers(players: Player[], side: Side): Record<LineBand, Player[]> {
  const outfield = players.filter(
    (player) => player.onPitch && player.x != null && player.y != null && player.prefRole !== "GK",
  );
  const bands = clusterByY(outfield);
  if (bands.length === 0) return { attack: [], mid: [], defense: [] };
  if (bands.length === 1) return { attack: bands[0]!, mid: [], defense: [] };

  const frontIndex = side === "home" ? 0 : bands.length - 1;
  const backIndex = side === "home" ? bands.length - 1 : 0;
  const towardBack = side === "home" ? 1 : -1;

  const attackBands = [bands[frontIndex]!];
  const support = bands[frontIndex + towardBack];
  const frontCount = attackBands[0]!.length;
  if (support && (frontCount === 1 || (frontCount === 2 && support.length === 1))) {
    attackBands.push(support);
  }

  const defenseBands = [bands[backIndex]!];
  const ahead = bands[backIndex - towardBack];
  const attackIds = new Set(attackBands.flat().map((player) => player.id));
  if (
    ahead &&
    ahead.every((player) => !attackIds.has(player.id) && DEF_ROLES.has(player.prefRole))
  ) {
    defenseBands.push(ahead);
  }

  const defense = defenseBands.flat().filter((player) => !attackIds.has(player.id));
  const defenseIds = new Set(defense.map((player) => player.id));
  const mid = outfield.filter((player) => !attackIds.has(player.id) && !defenseIds.has(player.id));
  return { attack: attackBands.flat(), mid, defense };
}

export function chainPairs(players: Player[]): [Pt, Pt][] {
  const pts = toPoints(players);
  const pairs: [Pt, Pt][] = [];
  for (let i = 0; i < pts.length - 1; i++) pairs.push([pts[i]!, pts[i + 1]!]);
  return pairs;
}

export function completePairs(players: Player[]): [Pt, Pt][] {
  const pts = players
    .filter((player) => player.x != null && player.y != null)
    .map((player) => ({ id: player.id, x: player.x as number, y: player.y as number }));
  const pairs: [Pt, Pt][] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) pairs.push([pts[i]!, pts[j]!]);
  }
  return pairs;
}

function toPoints(players: Player[]): Pt[] {
  return players
    .filter((player) => player.x != null && player.y != null)
    .map((player) => ({ id: player.id, x: player.x as number, y: player.y as number }))
    .sort((a, b) => a.x - b.x || a.y - b.y);
}

/** Order around the centroid so 3 forwards close into a triangle and 4 into a quad. */
export function ringPoints(players: Player[]): Pt[] {
  const pts = players
    .filter((player) => player.x != null && player.y != null)
    .map((player) => ({ id: player.id, x: player.x as number, y: player.y as number }));
  if (pts.length < 3) return pts.sort((a, b) => a.x - b.x);
  const cx = pts.reduce((sum, point) => sum + point.x, 0) / pts.length;
  const cy = pts.reduce((sum, point) => sum + point.y, 0) / pts.length;
  return [...pts].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx),
  );
}

function cross(o: Pt, a: Pt, b: Pt) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export function convexHull(points: Pt[]): Pt[] {
  const pts = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (pts.length < 3) return pts;
  const sorted = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const lower: Pt[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper: Pt[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const point = sorted[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function paddedHull(points: Pt[], pad = 7): Pt[] {
  const hull = convexHull(points);
  if (hull.length === 0) return hull;
  const cx = hull.reduce((sum, point) => sum + point.x, 0) / hull.length;
  const cy = hull.reduce((sum, point) => sum + point.y, 0) / hull.length;
  return hull.map((point) => {
    const dx = point.x - cx;
    const dy = point.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: point.x + (dx / len) * pad, y: point.y + (dy / len) * pad };
  });
}

export function hullPath(points: Pt[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  return `${points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ")} Z`;
}