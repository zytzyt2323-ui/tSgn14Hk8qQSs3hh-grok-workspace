import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as slotsForSide, r as FORMATION_BY_ID } from "./formations-o5YYF_IL.mjs";
import { l as Plus, n as Users } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as useCurrentUserState, o as parseJoinCode, t as Button } from "./share-B_E9JM2D.mjs";
import { n as Label, r as PitchField, t as Input } from "./label-Dyk0QwQD.mjs";
import { a as createBoard, d as listBoards, l as joinBoard, n as SiteHeader } from "./board-api-BMEbQUJ_.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogDescription, t as Dialog } from "./dialog-BoWIvgoy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DZqUJuZn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { user } = useCurrentUserState();
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {});
}
function Landing() {
	const home = slotsForSide(FORMATION_BY_ID["4-3-3"], "home");
	const away = slotsForSide(FORMATION_BY_ID["4-3-3"], "away");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-10 lg:flex-row lg:items-center lg:gap-16 lg:py-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.2em] text-accent uppercase",
						children: "阵型板"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-3 font-display text-5xl leading-[0.95] font-semibold tracking-tight sm:text-6xl",
						children: [
							"主队客队",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"同一块球场"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-md text-base leading-relaxed text-muted",
						children: "两队对阵排阵。按住向外拉出圆形或椭圆压迫圈，直线或弧线画跑位，画完还能拖着改。把链接发给朋友，打开就能一起改。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								search: {},
								children: "开始排阵"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								search: {},
								children: "加入已有战术板"
							})
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto w-full max-w-[22rem]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PitchField, { children: [home.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line/80 bg-kit-home font-display text-[11px] font-semibold text-kit-home-ink",
					style: {
						left: `${s.x}%`,
						top: `${s.y}%`
					},
					children: s.role
				}, `h-${s.role}-${i}`)), away.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line/50 bg-kit-away font-display text-[11px] font-semibold text-kit-away-ink",
					style: {
						left: `${s.x}%`,
						top: `${s.y}%`
					},
					children: s.role
				}, `a-${s.role}-${i}`))] })
			})]
		})]
	});
}
function Dashboard() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [joinOpen, setJoinOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("周末友谊赛");
	const [code, setCode] = (0, import_react.useState)("");
	const boardsQuery = useQuery({
		queryKey: ["boards"],
		queryFn: () => listBoards()
	});
	const createMut = useMutation({
		mutationFn: () => createBoard({ data: { name: name.trim() || "未命名战术板" } }),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: ["boards"] });
			setCreateOpen(false);
			navigate({
				to: "/board/$boardId",
				params: { boardId: res.id }
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const joinMut = useMutation({
		mutationFn: () => joinBoard({ data: { code: parseJoinCode(code) } }),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: ["boards"] });
			setJoinOpen(false);
			navigate({
				to: "/board/$boardId",
				params: { boardId: res.id }
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const boards = boardsQuery.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto w-full max-w-5xl flex-1 px-5 py-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl font-semibold tracking-tight",
						children: "我的战术板"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "创建新的对阵，或用链接 / 邀请码加入朋友的板。"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setJoinOpen(true),
							children: "加入"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => setCreateOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "新建"]
						})]
					})]
				}), boardsQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: [
						0,
						1,
						2
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-xl bg-surface" }, i))
				}) : boards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12 rounded-xl border border-dashed border-border p-10 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl",
							children: "还没有战术板"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "建一块，把人拉进来，主客一起排 4-3-3。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-5",
							onClick: () => setCreateOpen(true),
							children: "创建第一块"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: boards.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardCard, { board: b }, b.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: createOpen,
				onOpenChange: setCreateOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "新战术板" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "先起个名字，进去再排主客两队。" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 flex flex-col gap-3",
						onSubmit: (e) => {
							e.preventDefault();
							createMut.mutate();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "board-name",
								children: "名称"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "board-name",
								value: name,
								maxLength: 40,
								onChange: (e) => setName(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: createMut.isPending,
								children: createMut.isPending ? "创建中…" : "创建并打开"
							})
						]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: joinOpen,
				onOpenChange: setJoinOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "加入战术板" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "粘贴朋友发来的链接，或输入 6 位邀请码。" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 flex flex-col gap-3",
						onSubmit: (e) => {
							e.preventDefault();
							joinMut.mutate();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "join-code",
								children: "链接或邀请码"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "join-code",
								value: code,
								placeholder: "https://…/join/7K2M9Q",
								className: "font-display text-base tracking-wide",
								onChange: (e) => setCode(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: joinMut.isPending || parseJoinCode(code).length < 4,
								children: joinMut.isPending ? "加入中…" : "加入"
							})
						]
					})
				] })
			})
		]
	});
}
function BoardCard({ board }) {
	const home = FORMATION_BY_ID[board.formation]?.slots ?? [];
	const away = slotsForSide(FORMATION_BY_ID[board.formation] ?? FORMATION_BY_ID["4-3-3"], "away");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/board/$boardId",
		params: { boardId: board.id },
		className: "block overflow-hidden rounded-xl border border-border bg-surface no-underline transition-colors duration-150 hover:border-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-28 overflow-hidden px-8 pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PitchField, {
				className: "mx-auto max-h-28 border-0 shadow-none",
				children: [home.slice(0, 11).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kit-home",
					style: {
						left: `${s.x}%`,
						top: `${s.y}%`
					}
				}, `h${i}`)), away.slice(0, 11).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kit-away",
					style: {
						left: `${s.x}%`,
						top: `${s.y}%`
					}
				}, `a${i}`))]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 pt-2 pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate font-medium text-fg",
				children: board.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 flex items-center gap-2 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: board.formation }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }), board.memberCount]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [board.playerCount, " 人"] }),
					board.isOwner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "我创建的" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "共用" })
				]
			})]
		})]
	}) });
}
//#endregion
export { Home as component };
