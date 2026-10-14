import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Navigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as authMiddleware, n as ROLES } from "./types-DvE639nH.mjs";
import { cn as _enum, dn as boolean, gn as object, hn as number, un as array, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { a as hasGateSessionMarker } from "./server-TK9_o09f.mjs";
import { i as signOut } from "./client-1vAx-gM_.mjs";
import { c as useCurrentUser, l as useCurrentUserState } from "./share-B_E9JM2D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board-api-BMEbQUJ_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function SiteHeader({ trailing }) {
	const { user, isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex h-14 shrink-0 items-center gap-3 border-b border-border px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "flex items-baseline gap-2 text-fg no-underline",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-xl font-semibold tracking-wide",
				children: "Pitchboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden text-xs text-muted sm:inline",
				children: "阵型板"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ml-auto flex items-center gap-3",
			children: [trailing, isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-8 animate-pulse rounded-full bg-elevated" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-fg [&_button]:text-muted [&_span]:text-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				search: {},
				className: "inline-flex h-9 items-center rounded-sm bg-primary px-3 text-sm font-medium text-primary-fg no-underline",
				children: "登录"
			})]
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var roleSchema = _enum(ROLES);
var kitSchema = _enum([
	"home",
	"away",
	"third",
	"keeper"
]);
var sideSchema = _enum(["home", "away"]);
var tacticSchema = object({
	id: string(),
	kind: _enum([
		"arrow",
		"curve",
		"zone",
		"note"
	]),
	x1: number(),
	y1: number(),
	x2: number(),
	y2: number(),
	cx: number().optional(),
	cy: number().optional(),
	rx: number().optional(),
	ry: number().optional(),
	text: string().optional()
});
var listBoards = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("f585811ba9712401e2962f0a7809358f6e797784c84487fd80aae9d6651bfe55"));
var getBoard = createServerFn({ method: "GET" }).validator((input) => object({ boardId: string().min(1) }).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("6145101ff080815fc76ad34e4ba8ee7b440fe166c015b1bbc3c9e18de6cadf85"));
var createBoard = createServerFn({ method: "POST" }).validator((input) => object({ name: string().trim().min(1).max(40) }).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("4ec582b62d1449fc96d5b48920279b4e4468963215653a3615a88321c324243e"));
var joinBoard = createServerFn({ method: "POST" }).validator((input) => object({ code: string().trim().min(4).max(32) }).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("6f174f35abce0992f23481f4eb10eeb2656538691277a0308a56aa5527fc4a73"));
var renameBoard = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	name: string().trim().min(1).max(40)
}).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("6be4f0ee1deaa2d8f614b01a5cf45c77703aeccff4f14c96e5c1e6ab26d08a67"));
var setBoardMeta = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	formation: string().optional(),
	awayFormation: string().optional(),
	kit: kitSchema.optional(),
	awayKit: kitSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("a060688585415194bdde41f171401738db96b4efd8045e77ba6856e59956244f"));
var saveTactics = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	tactics: array(tacticSchema)
}).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("7fb39a05e5b2303f03975bbdb0f33eace3a8d8893687d96730ee616aa3bdc572"));
var deleteBoard = createServerFn({ method: "POST" }).validator((input) => object({ boardId: string().min(1) }).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("c2e6458b9b322e98cea35ca77086159c3d8ea93eccfe5d552a953825c4b8aca8"));
var leaveBoard = createServerFn({ method: "POST" }).validator((input) => object({ boardId: string().min(1) }).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("fd3b8ec3e7173a03e1341769ad63a09b23b193384d313aad41e0a2f8601df66e"));
var addPlayer = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	name: string().trim().min(1).max(24),
	number: number().int().min(1).max(99).nullable().optional(),
	prefRole: roleSchema,
	photo: string().max(15e4).nullable().optional(),
	side: sideSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("eb5a75299bbc3b8659ce609705d7caf90b4673da79ff8336211b6cb88bd0acbc"));
var updatePlayer = createServerFn({ method: "POST" }).validator((input) => object({
	playerId: string().min(1),
	name: string().trim().min(1).max(24).optional(),
	number: number().int().min(1).max(99).nullable().optional(),
	prefRole: roleSchema.optional(),
	photo: string().max(15e4).nullable().optional(),
	side: sideSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("eda3c460d3dd83e73080bc8f8b7d6842eef749ce21ffa4e52efbed511ec648ae"));
var deletePlayer = createServerFn({ method: "POST" }).validator((input) => object({ playerId: string().min(1) }).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("42211a1eac03474df83c1504033e80a9c0a07088fa646d121e8fd8de0c0fba37"));
var movePlayer = createServerFn({ method: "POST" }).validator((input) => object({
	playerId: string().min(1),
	onPitch: boolean(),
	x: number().min(0).max(100).nullable(),
	y: number().min(0).max(100).nullable()
}).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("e13dfba1a66c7a7fe711aa5d5d5b021b8e51e19fc9df4df53fe2cee95ec3ff72"));
var seedSquad = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	side: sideSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("e129cdd88fbfac43066a4ef8eeaa3d90f1df3231c4f8d170dfb3697929ac76ac"));
var applyFormation = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	formationId: string().min(1),
	side: sideSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(createSsrRpc("ac946b16768848e1241b97cfda62539f85df74f5b00846dbc696b30f32a4ae7f"));
//#endregion
export { updatePlayer as _, createBoard as a, getBoard as c, listBoards as d, movePlayer as f, setBoardMeta as g, seedSquad as h, applyFormation as i, joinBoard as l, saveTactics as m, SiteHeader as n, deleteBoard as o, renameBoard as p, addPlayer as r, deletePlayer as s, RedirectToSignIn as t, leaveBoard as u };
