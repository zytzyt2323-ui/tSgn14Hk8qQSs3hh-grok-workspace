import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Navigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as slotsForSide, r as FORMATION_BY_ID } from "./formations-o5YYF_IL.mjs";
import { t as GROK_PROVIDERS } from "./server-TK9_o09f.mjs";
import { i as Route$3 } from "./router-BSI5PPsu.mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { l as useCurrentUserState, s as safePath, t as Button } from "./share-B_E9JM2D.mjs";
import { n as Label, r as PitchField, t as Input } from "./label-Dyk0QwQD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Luj1RPYm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { redirect } = Route$3.useSearch();
	const next = safePath(redirect);
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	if (user) {
		const join = next.match(/^\/join\/([A-Za-z0-9]+)$/i);
		if (join) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
			to: "/join/$code",
			params: { code: join[1] }
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	}
	async function onEmail(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			if (mode === "signup") {
				const res = await authClient.signUp.email({
					email,
					password,
					name: name.trim() || email.split("@")[0] || "球员"
				});
				if (res.error) throw new Error(res.error.message || "注册失败");
			} else {
				const res = await authClient.signIn.email({
					email,
					password
				});
				if (res.error) throw new Error(res.error.message || "登录失败");
			}
			window.location.assign(next);
		} catch (err) {
			setError(err instanceof Error ? err.message : "登录失败");
			setBusy(false);
		}
	}
	const home = slotsForSide(FORMATION_BY_ID["4-3-3"], "home");
	const away = slotsForSide(FORMATION_BY_ID["4-3-3"], "away");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-dvh lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "relative hidden overflow-hidden bg-bg lg:flex lg:items-center lg:justify-center lg:p-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full max-w-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PitchField, { children: [home.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/80 bg-kit-home/90 font-display text-[10px] font-semibold text-kit-home-ink grid place-items-center",
					style: {
						left: `${s.x}%`,
						top: `${s.y}%`
					},
					children: s.role
				}, `h-${s.role}-${i}`)), away.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/50 bg-kit-away font-display text-[10px] font-semibold text-kit-away-ink grid place-items-center",
					style: {
						left: `${s.x}%`,
						top: `${s.y}%`
					},
					children: s.role
				}, `a-${s.role}-${i}`))] })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex items-center justify-center px-5 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "font-display text-2xl font-semibold tracking-wide text-fg no-underline",
						children: "Pitchboard"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-6 font-display text-3xl font-semibold tracking-tight",
						children: next.startsWith("/join/") ? "登录后加入战术板" : "登录后开始排阵"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "主客两队同场，拖站位、拉压迫圈、画跑位。把链接发给朋友就能一起改。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 flex flex-col gap-2",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => signIn(p.providerId, { callbackURL: next }),
							children: [
								"使用 ",
								p.label,
								" 继续"
							]
						}, p.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3 text-xs text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
							"或使用邮箱",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-col gap-3",
						onSubmit: (e) => void onEmail(e),
						children: [
							mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "name",
									children: "名字"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "name",
									value: name,
									onChange: (e) => setName(e.target.value),
									placeholder: "你的名字"
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "邮箱"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									type: "email",
									autoComplete: "email",
									required: true,
									value: email,
									onChange: (e) => setEmail(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "password",
									children: "密码"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "password",
									type: "password",
									autoComplete: mode === "signup" ? "new-password" : "current-password",
									required: true,
									minLength: 8,
									value: password,
									onChange: (e) => setPassword(e.target.value)
								})]
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-danger",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								children: busy ? "请稍候…" : mode === "signup" ? "创建账号" : "登录"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 text-sm text-muted hover:text-fg",
						onClick: () => {
							setMode(mode === "signup" ? "signin" : "signup");
							setError(null);
						},
						children: mode === "signup" ? "已有账号？去登录" : "没有账号？注册一个"
					})
				]
			})
		})]
	});
}
//#endregion
export { Login as component };
