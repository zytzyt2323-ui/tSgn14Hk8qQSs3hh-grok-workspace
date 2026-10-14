import type { TacticMark } from "@/lib/types";
import { clamp } from "@/lib/utils";

export function zoneRadii(m: TacticMark): { rx: number; ry: number } {
  if (m.rx != null && m.ry != null) {
    return { rx: Math.max(m.rx, 1.2), ry: Math.max(m.ry, 1.2) };
  }
  const rx = Math.abs(m.x2 - m.x1);
  const ry = Math.abs(m.y2 - m.y1);
  if (rx < 0.4 && ry < 0.4) {
    const r = Math.max(Math.hypot(m.x2 - m.x1, m.y2 - m.y1), 1.2);
    return { rx: r, ry: r };
  }
  return { rx: Math.max(rx, 1.2), ry: Math.max(ry, 1.2) };
}

export function curveControl(m: TacticMark): { cx: number; cy: number } {
  if (m.cx != null && m.cy != null) return { cx: m.cx, cy: m.cy };
  const dx = m.x2 - m.x1;
  const dy = m.y2 - m.y1;
  const len = Math.hypot(dx, dy) || 1;
  return {
    cx: (m.x1 + m.x2) / 2 - (dy / len) * len * 0.32,
    cy: (m.y1 + m.y2) / 2 + (dx / len) * len * 0.32,
  };
}

export function normalizeMark(m: TacticMark): TacticMark {
  if (m.kind === "zone") {
    const { rx, ry } = zoneRadii(m);
    return { ...m, rx, ry, x2: m.x1 + rx, y2: m.y1 + ry };
  }
  if (m.kind === "curve") {
    const c = curveControl(m);
    return { ...m, cx: c.cx, cy: c.cy };
  }
  return m;
}

export function translateMark(m: TacticMark, dx: number, dy: number): TacticMark {
  return normalizeMark({
    ...m,
    x1: m.x1 + dx,
    y1: m.y1 + dy,
    x2: m.x2 + dx,
    y2: m.y2 + dy,
    cx: m.cx != null ? m.cx + dx : m.cx,
    cy: m.cy != null ? m.cy + dy : m.cy,
  });
}

export function isUsefulMark(m: TacticMark): boolean {
  if (m.kind === "note") return Boolean(m.text?.trim());
  if (m.kind === "zone") {
    const { rx, ry } = zoneRadii(m);
    return rx >= 2.4 || ry >= 2.4;
  }
  return Math.hypot(m.x2 - m.x1, m.y2 - m.y1) >= 3.5;
}

export function arrowHead(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size = 3.1,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const wing = size * 0.5;
  const bx = x2 - ux * size;
  const by = y2 - uy * size;
  const px = -uy;
  const py = ux;
  return `${x2},${y2} ${bx + px * wing},${by + py * wing} ${bx - px * wing},${by - py * wing}`;
}

export function clampPoint(x: number, y: number) {
  return { x: clamp(x, 1.5, 98.5), y: clamp(y, 1.5, 98.5) };
}
