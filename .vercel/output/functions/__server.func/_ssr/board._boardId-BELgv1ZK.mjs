import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as SIDES, n as ROLES, r as ROLE_LABEL, t as KITS } from "./types-DvE639nH.mjs";
import { i as slotsForSide, n as FORMATIONS } from "./formations-o5YYF_IL.mjs";
import { _ as ArrowUpRight, a as StickyNote, c as Share2, d as Link2, f as Eraser, g as Camera, h as ChevronLeft, i as Trash2, l as Plus, m as Circle, n as Users, o as Spline, p as Copy, s as Shirt, u as MousePointer2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as Route$2 } from "./router-BSI5PPsu.mjs";
import { a as joinUrl, i as initials, l as useCurrentUserState, n as clamp, r as cn, t as Button } from "./share-B_E9JM2D.mjs";
import { n as Label, r as PitchField, t as Input } from "./label-Dyk0QwQD.mjs";
import { _ as updatePlayer, c as getBoard, f as movePlayer, g as setBoardMeta, h as seedSquad, i as applyFormation, m as saveTactics, n as SiteHeader, o as deleteBoard, p as renameBoard, r as addPlayer, s as deletePlayer, t as RedirectToSignIn, u as leaveBoard } from "./board-api-BMEbQUJ_.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogDescription, t as Dialog } from "./dialog-BoWIvgoy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board._boardId-BELgv1ZK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SIZE = 192;
var QUALITY = .82;
var MAX_CHARS = 12e4;
async function compressPhoto(file) {
	const bitmap = await createImageBitmap(file);
	const canvas = document.createElement("canvas");
	canvas.width = SIZE;
	canvas.height = SIZE;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("无法处理图片");
	const scale = Math.max(SIZE / bitmap.width, SIZE / bitmap.height);
	const w = bitmap.width * scale;
	const h = bitmap.height * scale;
	ctx.fillStyle = "#17241c";
	ctx.fillRect(0, 0, SIZE, SIZE);
	ctx.drawImage(bitmap, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
	bitmap.close();
	const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
	if (dataUrl.length > MAX_CHARS) {
		const tighter = canvas.toDataURL("image/jpeg", .6);
		if (tighter.length > MAX_CHARS) throw new Error("图片太大，请换一张");
		return tighter;
	}
	return dataUrl;
}
function PlayerForm({ initial, submitLabel, pending, onSubmit }) {
	const [name, setName] = (0, import_react.useState)(initial?.name ?? "");
	const [number, setNumber] = (0, import_react.useState)(initial?.number ?? "");
	const [prefRole, setPrefRole] = (0, import_react.useState)(initial?.prefRole ?? "CM");
	const [photo, setPhoto] = (0, import_react.useState)(initial?.photo ?? null);
	const [error, setError] = (0, import_react.useState)(null);
	const fileRef = (0, import_react.useRef)(null);
	async function onFile(file) {
		if (!file) return;
		try {
			setError(null);
			const data = await compressPhoto(file);
			setPhoto(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "图片处理失败");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 flex flex-col gap-3",
		onSubmit: (e) => {
			e.preventDefault();
			const trimmed = name.trim();
			if (!trimmed) {
				setError("请填写姓名");
				return;
			}
			onSubmit({
				name: trimmed,
				number,
				prefRole,
				photo
			});
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						className: "relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-elevated text-sm font-medium",
						children: photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: photo,
							alt: "",
							className: "absolute inset-0 size-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name ? initials(name) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5 text-muted" }) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "头像"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "点击圆形上传照片，会自动裁成方形。"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: (e) => void onFile(e.target.files?.[0])
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "player-name",
					children: "姓名"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "player-name",
					value: name,
					maxLength: 24,
					placeholder: "例如：陈浩",
					onChange: (e) => setName(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "player-num",
						children: "号码"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "player-num",
						inputMode: "numeric",
						value: number,
						placeholder: "10",
						onChange: (e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "player-role",
						children: "位置"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						id: "player-role",
						value: prefRole,
						onChange: (e) => setPrefRole(e.target.value),
						className: "h-11 rounded-sm border border-border bg-elevated px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
						children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: r,
							children: [
								r,
								" · ",
								ROLE_LABEL[r]
							]
						}, r))
					})]
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: pending,
				className: cn("mt-1"),
				children: pending ? "保存中…" : submitLabel
			})
		]
	});
}
var KIT_CLASS = {
	home: "token-kit-home",
	away: "token-kit-away",
	third: "token-kit-third",
	keeper: "token-kit-keeper"
};
function PlayerToken({ player, kit, selected, dragging, compact, onPointerDown, onPointerMove, onPointerUp }) {
	const kitClass = player.prefRole === "GK" ? KIT_CLASS.keeper : KIT_CLASS[kit];
	const size = compact ? "size-9" : "size-11 sm:size-12";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onPointerDown,
		onPointerMove,
		onPointerUp,
		className: cn("flex flex-col items-center gap-0.5 touch-none select-none", dragging && "scale-110 z-20", selected && "z-10"),
		style: { touchAction: "none" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: cn("relative grid place-items-center overflow-hidden rounded-full border-2 font-display font-semibold tabular-nums shadow-[0_4px_12px_rgba(0,0,0,0.35)]", size, kitClass, selected ? "border-primary ring-2 ring-primary/40" : "border-line/70"),
			children: [player.photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: player.photo,
				alt: "",
				className: "absolute inset-0 size-full object-cover",
				draggable: false
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("leading-none", compact ? "text-sm" : "text-base"),
				children: player.number ?? initials(player.name)
			}), player.photo && player.number != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-x-0 bottom-0 bg-bg/55 text-[10px] leading-4 text-fg",
				children: player.number
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("max-w-16 truncate rounded-sm bg-bg/70 px-1 text-center font-medium text-fg backdrop-blur-sm", compact ? "text-[10px]" : "text-[11px] sm:text-xs"),
			children: player.name
		})]
	});
}
function zoneRadii(m) {
	if (m.rx != null && m.ry != null) return {
		rx: Math.max(m.rx, 1.2),
		ry: Math.max(m.ry, 1.2)
	};
	const rx = Math.abs(m.x2 - m.x1);
	const ry = Math.abs(m.y2 - m.y1);
	if (rx < .4 && ry < .4) {
		const r = Math.max(Math.hypot(m.x2 - m.x1, m.y2 - m.y1), 1.2);
		return {
			rx: r,
			ry: r
		};
	}
	return {
		rx: Math.max(rx, 1.2),
		ry: Math.max(ry, 1.2)
	};
}
function curveControl(m) {
	if (m.cx != null && m.cy != null) return {
		cx: m.cx,
		cy: m.cy
	};
	const dx = m.x2 - m.x1;
	const dy = m.y2 - m.y1;
	const len = Math.hypot(dx, dy) || 1;
	return {
		cx: (m.x1 + m.x2) / 2 - dy / len * len * .32,
		cy: (m.y1 + m.y2) / 2 + dx / len * len * .32
	};
}
function normalizeMark(m) {
	if (m.kind === "zone") {
		const { rx, ry } = zoneRadii(m);
		return {
			...m,
			rx,
			ry,
			x2: m.x1 + rx,
			y2: m.y1 + ry
		};
	}
	if (m.kind === "curve") {
		const c = curveControl(m);
		return {
			...m,
			cx: c.cx,
			cy: c.cy
		};
	}
	return m;
}
function translateMark(m, dx, dy) {
	return normalizeMark({
		...m,
		x1: m.x1 + dx,
		y1: m.y1 + dy,
		x2: m.x2 + dx,
		y2: m.y2 + dy,
		cx: m.cx != null ? m.cx + dx : m.cx,
		cy: m.cy != null ? m.cy + dy : m.cy
	});
}
function isUsefulMark(m) {
	if (m.kind === "note") return Boolean(m.text?.trim());
	if (m.kind === "zone") {
		const { rx, ry } = zoneRadii(m);
		return rx >= 2.4 || ry >= 2.4;
	}
	return Math.hypot(m.x2 - m.x1, m.y2 - m.y1) >= 3.5;
}
function arrowHead(x1, y1, x2, y2, size = 3.1) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const len = Math.hypot(dx, dy) || 1;
	const ux = dx / len;
	const uy = dy / len;
	const wing = size * .5;
	const bx = x2 - ux * size;
	const by = y2 - uy * size;
	const px = -uy;
	const py = ux;
	return `${x2},${y2} ${bx + px * wing},${by + py * wing} ${bx - px * wing},${by - py * wing}`;
}
function clampPoint(x, y) {
	return {
		x: clamp(x, 1.5, 98.5),
		y: clamp(y, 1.5, 98.5)
	};
}
function TacticsLayer({ marks, draft, selectedId, interactive, pointFromEvent, onSelect, onChange }) {
	const dragRef = (0, import_react.useRef)(null);
	const lastRef = (0, import_react.useRef)(null);
	const all = draft ? [...marks, draft] : marks;
	function patchMark(id, next, persist) {
		lastRef.current = next;
		onChange?.(marks.map((m) => m.id === id ? next : m), persist);
	}
	function beginDrag(mark, mode, e) {
		if (!interactive || mark.id === "draft") return;
		e.stopPropagation();
		e.preventDefault();
		onSelect?.(mark.id);
		const origin = pointFromEvent(e.clientX, e.clientY);
		dragRef.current = {
			id: mark.id,
			mode,
			origin,
			mark: { ...mark }
		};
		lastRef.current = mark;
		const move = (ev) => {
			const drag = dragRef.current;
			if (!drag) return;
			const pos = pointFromEvent(ev.clientX, ev.clientY);
			const dx = pos.x - drag.origin.x;
			const dy = pos.y - drag.origin.y;
			const next = drag.mode === "move" ? translateMark(drag.mark, dx, dy) : reshape(drag.mark, drag.mode, pos);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className: "absolute inset-0 h-full w-full",
		viewBox: "0 0 100 100",
		preserveAspectRatio: "none",
		children: all.map((m) => {
			const active = m.id === selectedId;
			const stroke = active ? "var(--color-primary)" : "var(--color-line)";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
				m.kind === "arrow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StraightArrow, {
					mark: m,
					stroke,
					active,
					interactive,
					onBodyDown: (e) => beginDrag(m, "move", e)
				}) : null,
				m.kind === "curve" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurveArrow, {
					mark: m,
					stroke,
					active,
					interactive,
					onBodyDown: (e) => beginDrag(m, "move", e)
				}) : null,
				m.kind === "zone" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PressZone, {
					mark: m,
					stroke,
					active,
					interactive,
					onBodyDown: (e) => beginDrag(m, "move", e)
				}) : null,
				m.kind === "note" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteMark, {
					mark: m,
					stroke,
					interactive,
					onBodyDown: (e) => beginDrag(m, "move", e)
				}) : null,
				active && interactive && m.id !== "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handles, {
					mark: m,
					onDown: (handle, e) => beginDrag(m, handle, e)
				}) : null
			] }, m.id);
		})
	});
}
function StraightArrow({ mark, stroke, active, interactive, onBodyDown }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: interactive ? "cursor-grab" : void 0,
		onPointerDown: onBodyDown,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mark.x1,
				y1: mark.y1,
				x2: mark.x2,
				y2: mark.y2,
				stroke: "transparent",
				strokeWidth: 4.5,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mark.x1,
				y1: mark.y1,
				x2: mark.x2,
				y2: mark.y2,
				stroke,
				strokeWidth: active ? .95 : .7,
				strokeLinecap: "round",
				opacity: .95
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: arrowHead(mark.x1, mark.y1, mark.x2, mark.y2),
				fill: stroke,
				opacity: .95
			})
		]
	});
}
function CurveArrow({ mark, stroke, active, interactive, onBodyDown }) {
	const c = curveControl(mark);
	const d = `M ${mark.x1} ${mark.y1} Q ${c.cx} ${c.cy} ${mark.x2} ${mark.y2}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: interactive ? "cursor-grab" : void 0,
		onPointerDown: onBodyDown,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d,
				fill: "none",
				stroke: "transparent",
				strokeWidth: 4.5
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d,
				fill: "none",
				stroke,
				strokeWidth: active ? .95 : .7,
				strokeLinecap: "round",
				opacity: .95
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: arrowHead(c.cx, c.cy, mark.x2, mark.y2),
				fill: stroke,
				opacity: .95
			})
		]
	});
}
function PressZone({ mark, stroke, active, interactive, onBodyDown }) {
	const { rx, ry } = zoneRadii(mark);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
		cx: mark.x1,
		cy: mark.y1,
		rx,
		ry,
		fill: "var(--color-line)",
		fillOpacity: active ? .2 : .11,
		stroke,
		strokeWidth: .55,
		strokeDasharray: "1.7 1.15",
		className: interactive ? "cursor-grab" : void 0,
		onPointerDown: onBodyDown
	});
}
function NoteMark({ mark, stroke, interactive, onBodyDown }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: interactive ? "cursor-grab" : void 0,
		onPointerDown: onBodyDown,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: mark.x1 - 8,
			y: mark.y1 - 3,
			width: 16,
			height: 6,
			rx: 1,
			fill: "var(--color-bg)",
			fillOpacity: .72,
			stroke,
			strokeWidth: .4
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: mark.x1,
			y: mark.y1 + 1.1,
			textAnchor: "middle",
			fill: "var(--color-fg)",
			fontSize: "3.2",
			fontFamily: "Figtree, sans-serif",
			children: (mark.text ?? "备注").slice(0, 10)
		})]
	});
}
function Handles({ mark, onDown }) {
	const handles = [];
	if (mark.kind === "arrow" || mark.kind === "curve") {
		handles.push({
			id: "start",
			x: mark.x1,
			y: mark.y1
		});
		handles.push({
			id: "end",
			x: mark.x2,
			y: mark.y2
		});
		if (mark.kind === "curve") {
			const c = curveControl(mark);
			handles.push({
				id: "control",
				x: c.cx,
				y: c.cy
			});
		}
	}
	if (mark.kind === "zone") {
		const { rx, ry } = zoneRadii(mark);
		handles.push({
			id: "rx",
			x: mark.x1 + rx,
			y: mark.y1
		});
		handles.push({
			id: "ry",
			x: mark.x1,
			y: mark.y1 - ry
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [mark.kind === "curve" ? (() => {
		const c = curveControl(mark);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: (mark.x1 + mark.x2) / 2,
			y1: (mark.y1 + mark.y2) / 2,
			x2: c.cx,
			y2: c.cy,
			stroke: "var(--color-primary)",
			strokeWidth: .35,
			strokeDasharray: "1 0.8",
			opacity: .7
		});
	})() : null, handles.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		className: "cursor-nwse-resize",
		onPointerDown: (e) => {
			e.stopPropagation();
			onDown(h.id, e);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: h.x,
			cy: h.y,
			r: 3.2,
			fill: "transparent"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: h.x,
			cy: h.y,
			r: 1.35,
			fill: "var(--color-primary)",
			stroke: "var(--color-bg)",
			strokeWidth: .45
		})]
	}, h.id))] });
}
function reshape(mark, handle, pos) {
	const p = clampPoint(pos.x, pos.y);
	if (handle === "start") return normalizeMark({
		...mark,
		x1: p.x,
		y1: p.y
	});
	if (handle === "end") return normalizeMark({
		...mark,
		x2: p.x,
		y2: p.y
	});
	if (handle === "control") return {
		...mark,
		cx: p.x,
		cy: p.y
	};
	if (mark.kind === "zone" && handle === "rx") {
		const rx = Math.max(Math.abs(p.x - mark.x1), 1.6);
		return normalizeMark({
			...mark,
			rx,
			x2: mark.x1 + rx
		});
	}
	if (mark.kind === "zone" && handle === "ry") {
		const ry = Math.max(Math.abs(p.y - mark.y1), 1.6);
		return normalizeMark({
			...mark,
			ry,
			y2: mark.y1 + ry
		});
	}
	return mark;
}
function BoardEditor({ boardId }) {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const pitchRef = (0, import_react.useRef)(null);
	const draggingRef = (0, import_react.useRef)(null);
	const tacticsDragRef = (0, import_react.useRef)(false);
	const playersRef = (0, import_react.useRef)([]);
	const [draggingId, setDraggingId] = (0, import_react.useState)(null);
	const [players, setPlayers] = (0, import_react.useState)([]);
	const [tactics, setTactics] = (0, import_react.useState)([]);
	const [tool, setTool] = (0, import_react.useState)("select");
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [selectedMark, setSelectedMark] = (0, import_react.useState)(null);
	const [selectedPlayer, setSelectedPlayer] = (0, import_react.useState)(null);
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [editPlayer, setEditPlayer] = (0, import_react.useState)(null);
	const [shareOpen, setShareOpen] = (0, import_react.useState)(false);
	const [mobileTab, setMobileTab] = (0, import_react.useState)("pitch");
	const [nameDraft, setNameDraft] = (0, import_react.useState)(null);
	const [activeSide, setActiveSide] = (0, import_react.useState)("home");
	const boardQuery = useQuery({
		queryKey: ["board", boardId],
		queryFn: () => getBoard({ data: { boardId } }),
		refetchInterval: () => draggingRef.current ? false : 2800
	});
	(0, import_react.useEffect)(() => {
		if (!boardQuery.data || draggingRef.current || tacticsDragRef.current) return;
		setPlayers(boardQuery.data.players);
		setTactics(boardQuery.data.tactics);
	}, [boardQuery.data]);
	(0, import_react.useEffect)(() => {
		playersRef.current = players;
	}, [players]);
	const invalidate = () => qc.invalidateQueries({ queryKey: ["board", boardId] });
	const moveMut = useMutation({
		mutationFn: (input) => movePlayer({ data: input }),
		onSettled: invalidate
	});
	const tacticsMut = useMutation({ mutationFn: (next) => saveTactics({ data: {
		boardId,
		tactics: next
	} }) });
	const formationMut = useMutation({
		mutationFn: (input) => applyFormation({ data: {
			boardId,
			formationId: input.formationId,
			side: input.side
		} }),
		onSuccess: invalidate
	});
	const kitMut = useMutation({
		mutationFn: (input) => setBoardMeta({ data: {
			boardId,
			...input
		} }),
		onSuccess: invalidate
	});
	const addMut = useMutation({
		mutationFn: addPlayer,
		onSuccess: () => {
			setAddOpen(false);
			invalidate();
			toast.success("已加入名单");
		},
		onError: (e) => toast.error(e.message)
	});
	const updateMut = useMutation({
		mutationFn: updatePlayer,
		onSuccess: () => {
			setEditPlayer(null);
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const seedMut = useMutation({
		mutationFn: (side) => seedSquad({ data: {
			boardId,
			side
		} }),
		onSuccess: () => {
			invalidate();
			toast.success("已填入示例名单，可以开始拖动");
		},
		onError: (e) => toast.error(e.message)
	});
	const board = boardQuery.data;
	const kitFor = (side) => side === "away" ? board?.awayKit ?? "away" : board?.kit ?? "home";
	const formationFor = (side) => side === "away" ? board?.awayFormation ?? "4-3-3" : board?.formation ?? "4-3-3";
	const onPitch = players.filter((p) => p.onPitch);
	const sidePlayers = players.filter((p) => p.side === activeSide);
	const sideOnPitch = sidePlayers.filter((p) => p.onPitch);
	const sideBench = sidePlayers.filter((p) => !p.onPitch);
	const homeCount = players.filter((p) => p.side === "home").length;
	const awayCount = players.filter((p) => p.side === "away").length;
	const persistTactics = (0, import_react.useCallback)((next) => {
		setTactics(next);
		tacticsMut.mutate(next);
	}, [tacticsMut]);
	const pitchPercent = (0, import_react.useCallback)((clientX, clientY) => {
		const rect = pitchRef.current?.getBoundingClientRect();
		if (!rect) return {
			x: 50,
			y: 50
		};
		return {
			x: clamp((clientX - rect.left) / rect.width * 100, 1.5, 98.5),
			y: clamp((clientY - rect.top) / rect.height * 100, 1.5, 98.5)
		};
	}, []);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (e.key !== "Backspace" && e.key !== "Delete") return;
			const target = e.target;
			if (target && [
				"INPUT",
				"TEXTAREA",
				"SELECT"
			].includes(target.tagName)) return;
			if (!selectedMark) return;
			e.preventDefault();
			persistTactics(tactics.filter((m) => m.id !== selectedMark));
			setSelectedMark(null);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		selectedMark,
		tactics,
		persistTactics
	]);
	function onTokenPointerDown(player, e) {
		e.stopPropagation();
		if (tool !== "select") return;
		e.preventDefault();
		draggingRef.current = player.id;
		setDraggingId(player.id);
		setSelectedPlayer(player.id);
		setSelectedMark(null);
		setActiveSide(player.side);
		setMobileTab("pitch");
		const { x, y } = pitchPercent(e.clientX, e.clientY);
		if (!player.onPitch) setPlayers((prev) => prev.map((p) => p.id === player.id ? {
			...p,
			onPitch: true,
			x,
			y
		} : p));
		const move = (ev) => {
			if (draggingRef.current !== player.id) return;
			const pos = pitchPercent(ev.clientX, ev.clientY);
			setPlayers((prev) => prev.map((p) => p.id === player.id ? {
				...p,
				onPitch: true,
				x: pos.x,
				y: pos.y
			} : p));
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
	function onTokenPointerMove(e) {
		const id = draggingRef.current;
		if (!id) return;
		const { x, y } = pitchPercent(e.clientX, e.clientY);
		setPlayers((prev) => prev.map((p) => p.id === id ? {
			...p,
			onPitch: true,
			x,
			y
		} : p));
	}
	function onTokenPointerUp() {
		const id = draggingRef.current;
		if (!id) return;
		draggingRef.current = null;
		setDraggingId(null);
		const p = playersRef.current.find((x) => x.id === id);
		if (p) moveMut.mutate({
			playerId: p.id,
			onPitch: true,
			x: p.x ?? 50,
			y: p.y ?? 50
		});
	}
	function sendToBench(playerId) {
		setPlayers((prev) => prev.map((p) => p.id === playerId ? {
			...p,
			onPitch: false,
			x: null,
			y: null
		} : p));
		moveMut.mutate({
			playerId,
			onPitch: false,
			x: null,
			y: null
		});
	}
	function onPitchPointerDown(e) {
		if (tool === "select") {
			setSelectedMark(null);
			setSelectedPlayer(null);
			return;
		}
		const { x, y } = pitchPercent(e.clientX, e.clientY);
		if (tool === "note") {
			const text = window.prompt("战术备注", "压迫")?.trim();
			if (!text) return;
			persistTactics([...tactics, {
				id: crypto.randomUUID(),
				kind: "note",
				x1: x,
				y1: y,
				x2: x,
				y2: y,
				text
			}]);
			return;
		}
		e.currentTarget.setPointerCapture(e.pointerId);
		const mark = {
			id: "draft",
			kind: tool,
			x1: x,
			y1: y,
			x2: x,
			y2: y
		};
		if (tool === "zone") {
			mark.rx = 1.6;
			mark.ry = 1.6;
		}
		setDraft(mark);
	}
	function onPitchPointerMove(e) {
		if (!draft) return;
		const { x, y } = pitchPercent(e.clientX, e.clientY);
		if (draft.kind === "zone") {
			const rx = Math.max(Math.abs(x - draft.x1), 1.6);
			const ry = Math.max(Math.abs(y - draft.y1), 1.6);
			setDraft({
				...draft,
				x2: draft.x1 + rx,
				y2: draft.y1 + ry,
				rx,
				ry
			});
			return;
		}
		if (draft.kind === "curve") {
			const next = {
				...draft,
				x2: x,
				y2: y
			};
			const dx = x - draft.x1;
			const dy = y - draft.y1;
			const len = Math.hypot(dx, dy) || 1;
			setDraft({
				...next,
				cx: (draft.x1 + x) / 2 - dy / len * len * .32,
				cy: (draft.y1 + y) / 2 + dx / len * len * .32
			});
			return;
		}
		setDraft({
			...draft,
			x2: x,
			y2: y
		});
	}
	function onPitchPointerUp() {
		if (!draft) return;
		const mark = normalizeMark({
			...draft,
			id: crypto.randomUUID()
		});
		setDraft(null);
		if (!isUsefulMark(mark)) return;
		persistTactics([...tactics, mark]);
		setSelectedMark(mark.id);
		setTool("select");
	}
	async function copyShare(kind) {
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
				url: joinUrl(board.shareCode)
			});
		} catch {}
	}
	if (boardQuery.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid flex-1 place-items-center text-sm text-muted",
			children: "球场加载中…"
		})]
	});
	if (boardQuery.isError || !board) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid flex-1 place-items-center px-6 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl",
					children: "打不开这块战术板"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: boardQuery.error instanceof Error ? boardQuery.error.message : "可能没有权限，或邀请链接已失效。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "返回列表"
					})
				})
			] })
		})]
	});
	const tools = [
		{
			id: "select",
			label: "移动",
			icon: MousePointer2
		},
		{
			id: "arrow",
			label: "直线",
			icon: ArrowUpRight
		},
		{
			id: "curve",
			label: "弧线",
			icon: Spline
		},
		{
			id: "zone",
			label: "压迫圈",
			icon: Circle
		},
		{
			id: "note",
			label: "备注",
			icon: StickyNote
		}
	];
	const shareLink = joinUrl(board.shareCode);
	const squadPanel = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex overflow-hidden rounded-sm border border-border",
				children: SIDES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setActiveSide(s.id),
					className: cn("h-10 flex-1 text-sm", activeSide === s.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"),
					children: [s.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1 tabular-nums text-subtle",
						children: s.id === "home" ? homeCount : awayCount
					})]
				}, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-1 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted",
					children: activeSide === "home" ? "主队名单" : "客队名单"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-xl font-semibold tabular-nums",
					children: [sideOnPitch.length, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [" / ", sidePlayers.length]
					})]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setAddOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "添加"]
				})]
			}),
			sidePlayers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-dashed border-border p-4 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "这支队伍还没有球员。添加自己的人，或先填入示例名单。" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "sm",
						disabled: seedMut.isPending,
						onClick: () => seedMut.mutate(activeSide),
						children: seedMut.isPending ? "填入中…" : "填入本队 11 人"
					}), players.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "sm",
						disabled: seedMut.isPending,
						onClick: () => seedMut.mutate(void 0),
						children: "填入主客两队"
					}) : null]
				})]
			}) : null,
			sideOnPitch.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-medium text-subtle",
				children: "场上"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1 overflow-y-auto",
				children: sideOnPitch.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquadRow, {
					player: p,
					active: selectedPlayer === p.id,
					onSelect: () => setSelectedPlayer(p.id),
					onEdit: () => setEditPlayer(p),
					onBench: () => sendToBench(p.id),
					onDelete: () => {
						deletePlayer({ data: { playerId: p.id } }).then(invalidate);
					}
				}, p.id))
			}),
			sideBench.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 mb-2 text-xs font-medium text-subtle",
				children: "替补席 · 拖到球场上场"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1 overflow-y-auto pb-4",
				children: sideBench.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquadRow, {
					player: p,
					active: selectedPlayer === p.id,
					onSelect: () => setSelectedPlayer(p.id),
					onEdit: () => setEditPlayer(p),
					onPitchPlace: () => {
						const formation = FORMATIONS.find((f) => f.id === formationFor(activeSide));
						const slot = (formation ? slotsForSide(formation, activeSide) : [])[sideOnPitch.length];
						const x = slot?.x ?? 50;
						const y = slot?.y ?? (activeSide === "home" ? 40 : 60);
						setPlayers((prev) => prev.map((row) => row.id === p.id ? {
							...row,
							onPitch: true,
							x,
							y
						} : row));
						moveMut.mutate({
							playerId: p.id,
							onPitch: true,
							x,
							y
						});
					},
					onDelete: () => {
						deletePlayer({ data: { playerId: p.id } }).then(invalidate);
					},
					draggableToken: true,
					kit: kitFor(p.side),
					onTokenPointerDown: (e) => onTokenPointerDown(p, e),
					onTokenPointerMove,
					onTokenPointerUp
				}, p.id))
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setShareOpen(true),
				className: "inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-3.5" }), "分享"]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-b border-border px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "grid size-9 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
					}),
					nameDraft == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-w-0 truncate font-display text-lg font-semibold tracking-tight",
						onClick: () => setNameDraft(board.name),
						children: board.name
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
						className: "min-w-0 flex-1",
						onSubmit: (e) => {
							e.preventDefault();
							const name = nameDraft.trim();
							setNameDraft(null);
							if (name && name !== board.name) renameBoard({ data: {
								boardId,
								name
							} }).then(invalidate);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							autoFocus: true,
							value: nameDraft,
							onChange: (e) => setNameDraft(e.target.value),
							onBlur: () => {
								const name = nameDraft.trim();
								setNameDraft(null);
								if (name && name !== board.name) renameBoard({ data: {
									boardId,
									name
								} }).then(invalidate);
							},
							className: "h-9 max-w-64"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden text-xs text-subtle sm:inline",
						children: [
							"主 ",
							homeCount,
							" · 客 ",
							awayCount,
							" · ",
							board.members.length,
							" 人共用"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col lg:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden w-72 shrink-0 border-r border-border p-4 lg:flex lg:flex-col",
					children: squadPanel
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "relative flex min-h-0 min-w-0 flex-1 flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex overflow-hidden rounded-sm border border-border",
									children: SIDES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setActiveSide(s.id),
										className: cn("h-10 px-3 text-xs", activeSide === s.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"),
										children: s.label
									}, s.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: formationFor(activeSide),
									disabled: formationMut.isPending,
									onChange: (e) => formationMut.mutate({
										formationId: e.target.value,
										side: activeSide
									}),
									className: "h-10 rounded-sm border border-border bg-elevated px-2 text-sm text-fg outline-none",
									children: FORMATIONS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: f.id,
										children: [
											f.name,
											" · ",
											f.line
										]
									}, f.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex overflow-hidden rounded-sm border border-border",
									children: KITS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => kitMut.mutate(activeSide === "away" ? { awayKit: k.id } : { kit: k.id }),
										className: cn("h-10 px-2.5 text-xs", kitFor(activeSide) === k.id ? "bg-elevated text-fg" : "text-muted hover:text-fg"),
										children: k.label
									}, k.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-auto flex items-center gap-1 overflow-x-auto",
									children: [tools.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										title: t.label,
										onClick: () => setTool(t.id),
										className: cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm px-2.5 text-xs", tool === t.id ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: t.label
										})]
									}, t.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										title: "清除战术",
										onClick: () => {
											persistTactics([]);
											setSelectedMark(null);
										},
										className: "grid size-10 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { className: "size-3.5" })
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("flex min-h-0 flex-1 items-center justify-center p-3 sm:p-5", mobileTab === "squad" ? "hidden lg:flex" : "flex"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: pitchRef,
								className: "relative h-full w-full max-w-[min(100%,calc((100dvh-13rem)*68/105))]",
								onPointerDown: onPitchPointerDown,
								onPointerMove: onPitchPointerMove,
								onPointerUp: onPitchPointerUp,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PitchField, {
									className: "h-full w-full max-h-full",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-sm bg-bg/55 px-2 py-0.5 text-[10px] tracking-widest text-fg/80",
											children: "客队"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-sm bg-bg/55 px-2 py-0.5 text-[10px] tracking-widest text-fg/80",
											children: "主队"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TacticsLayer, {
											marks: tactics,
											draft,
											selectedId: selectedMark,
											interactive: tool === "select",
											pointFromEvent: pitchPercent,
											onSelect: (id) => {
												if (tool === "select") {
													setSelectedMark(id);
													setSelectedPlayer(null);
												}
											},
											onChange: (next, persist) => {
												tacticsDragRef.current = !persist;
												setTactics(next);
												if (persist) tacticsMut.mutate(next);
											}
										}),
										onPitch.map((p) => p.x == null || p.y == null ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute z-[1]",
											style: {
												left: `${p.x}%`,
												top: `${p.y}%`,
												transform: "translate(-50%, -50%)"
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerToken, {
												player: p,
												kit: kitFor(p.side),
												selected: selectedPlayer === p.id,
												dragging: draggingId === p.id,
												onPointerDown: (e) => onTokenPointerDown(p, e),
												onPointerMove: onTokenPointerMove,
												onPointerUp: onTokenPointerUp
											})
										}, p.id))
									]
								})
							})
						}),
						selectedMark || selectedPlayer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute right-4 bottom-20 hidden lg:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto flex gap-2",
								children: [selectedPlayer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => sendToBench(selectedPlayer),
									children: "下场"
								}) : null, selectedMark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "danger",
									onClick: () => {
										persistTactics(tactics.filter((m) => m.id !== selectedMark));
										setSelectedMark(null);
									},
									children: "删除标记"
								}) : null]
							})
						}) : null,
						mobileTab === "squad" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 overflow-y-auto p-4 lg:hidden",
							children: squadPanel
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "flex items-center gap-1 border-t border-border p-2 lg:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setMobileTab("pitch"),
								className: cn("flex h-11 flex-1 items-center justify-center gap-1.5 rounded-sm text-sm", mobileTab === "pitch" ? "bg-elevated text-fg" : "text-muted"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shirt, { className: "size-4" }), "球场"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setMobileTab("squad"),
								className: cn("flex h-11 flex-1 items-center justify-center gap-1.5 rounded-sm text-sm", mobileTab === "squad" ? "bg-elevated text-fg" : "text-muted"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), "名单"]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragWindow, {
				active: !!draggingId,
				onMove: (e) => {
					const id = draggingRef.current;
					if (!id) return;
					const { x, y } = pitchPercent(e.clientX, e.clientY);
					setPlayers((prev) => prev.map((p) => p.id === id ? {
						...p,
						onPitch: true,
						x,
						y
					} : p));
				},
				onUp: onTokenPointerUp
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
						"添加",
						activeSide === "home" ? "主队" : "客队",
						"球员"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "写上名字、号码，也可以上传头像。" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerForm, {
						submitLabel: "加入名单",
						pending: addMut.isPending,
						onSubmit: (draftPlayer) => {
							addMut.mutate({ data: {
								boardId,
								name: draftPlayer.name,
								number: draftPlayer.number ? Number(draftPlayer.number) : null,
								prefRole: draftPlayer.prefRole,
								photo: draftPlayer.photo,
								side: activeSide
							} });
						}
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!editPlayer,
				onOpenChange: (o) => !o && setEditPlayer(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "编辑球员" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "改资料或换一张头像。" }),
					editPlayer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerForm, {
						initial: {
							name: editPlayer.name,
							number: editPlayer.number != null ? String(editPlayer.number) : "",
							prefRole: editPlayer.prefRole,
							photo: editPlayer.photo
						},
						submitLabel: "保存",
						pending: updateMut.isPending,
						onSubmit: (draftPlayer) => {
							updateMut.mutate({ data: {
								playerId: editPlayer.id,
								name: draftPlayer.name,
								number: draftPlayer.number ? Number(draftPlayer.number) : null,
								prefRole: draftPlayer.prefRole,
								photo: draftPlayer.photo
							} });
						}
					}, editPlayer.id) : null
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: shareOpen,
				onOpenChange: setShareOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "网上共用" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "把链接发到微信、群聊或邮件。对方打开并登录后，就会加入这块战术板。" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 rounded-sm border border-border bg-elevated px-3 py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-mono text-xs text-fg",
							children: shareLink
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "flex-1",
							onClick: () => void copyShare("url"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }), "复制链接"]
						}), typeof navigator !== "undefined" && typeof navigator.share === "function" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => void nativeShare(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "系统分享"]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-12 flex-1 items-center justify-center rounded-sm border border-border bg-elevated font-display text-2xl font-semibold tracking-[0.3em]",
							children: board.shareCode
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "secondary",
							onClick: () => void copyShare("code"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted",
						children: [
							"当前 ",
							board.members.length,
							" 人在这块板上",
							board.isOwner ? " · 你是创建者" : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex gap-2",
						children: board.isOwner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							className: "flex-1",
							onClick: () => {
								if (!window.confirm("确定删除这块战术板？球员也会一起删掉。")) return;
								deleteBoard({ data: { boardId } }).then(() => navigate({ to: "/" }));
							},
							children: "删除战术板"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "flex-1",
							onClick: () => {
								leaveBoard({ data: { boardId } }).then(() => navigate({ to: "/" }));
							},
							children: "退出"
						})
					})
				] })
			})
		]
	});
}
function DragWindow({ active, onMove, onUp }) {
	(0, import_react.useEffect)(() => {
		if (!active) return;
		const move = (e) => onMove(e);
		const up = () => onUp();
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		return () => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
		};
	}, [
		active,
		onMove,
		onUp
	]);
	return null;
}
function SquadRow({ player, active, kit, onSelect, onEdit, onBench, onPitchPlace, onDelete, draggableToken, onTokenPointerDown, onTokenPointerMove, onTokenPointerUp }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("flex items-center gap-2 rounded-md px-1.5 py-1", active ? "bg-elevated" : "hover:bg-elevated/60"),
		children: [
			draggableToken ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerToken, {
				player,
				kit: kit ?? (player.side === "away" ? "away" : "home"),
				compact: true,
				onPointerDown: onTokenPointerDown
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onSelect,
				className: "min-w-0 flex-1 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block truncate text-sm font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-1.5 font-display tabular-nums text-muted",
						children: player.number ?? "–"
					}), player.name]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] text-subtle",
					children: [
						player.prefRole,
						" · ",
						ROLE_LABEL[player.prefRole]
					]
				})]
			}),
			draggableToken ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onSelect,
				className: "min-w-0 flex-1 text-left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-sm",
					children: ROLE_LABEL[player.prefRole]
				})
			}) : null,
			onPitchPlace ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-xs text-muted hover:text-fg",
				onClick: onPitchPlace,
				children: "上场"
			}) : null,
			onBench ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-xs text-muted hover:text-fg",
				onClick: onBench,
				children: "下场"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-xs text-muted hover:text-fg",
				onClick: onEdit,
				children: "编辑"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-8 place-items-center text-subtle hover:text-danger",
				onClick: onDelete,
				"aria-label": "删除球员",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
			})
		]
	});
}
function BoardPage() {
	const { boardId } = Route$2.useParams();
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid flex-1 place-items-center text-sm text-muted",
			children: "加载中…"
		})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardEditor, { boardId });
}
//#endregion
export { BoardPage as component };
