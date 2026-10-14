import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/types-DvE639nH.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-1vAx-gM_.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-DVqHS988.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var ROLES = [
	"GK",
	"CB",
	"LB",
	"RB",
	"LWB",
	"RWB",
	"CDM",
	"CM",
	"CAM",
	"LM",
	"RM",
	"LW",
	"RW",
	"CF",
	"ST"
];
var ROLE_LABEL = {
	GK: "门将",
	CB: "中卫",
	LB: "左后卫",
	RB: "右后卫",
	LWB: "左边卫",
	RWB: "右边卫",
	CDM: "后腰",
	CM: "中场",
	CAM: "前腰",
	LM: "左边锋",
	RM: "右边锋",
	LW: "左边锋",
	RW: "右边锋",
	CF: "影锋",
	ST: "前锋"
};
var KITS = [
	{
		id: "home",
		label: "浅色"
	},
	{
		id: "away",
		label: "深色"
	},
	{
		id: "third",
		label: "红色"
	},
	{
		id: "keeper",
		label: "门将"
	}
];
var SIDES = [{
	id: "home",
	label: "主队"
}, {
	id: "away",
	label: "客队"
}];
//#endregion
export { authMiddleware as a, SIDES as i, ROLES as n, ROLE_LABEL as r, KITS as t };
