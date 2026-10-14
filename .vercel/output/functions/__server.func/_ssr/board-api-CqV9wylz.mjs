import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-BGv6LzIV.mjs";
import { a as authMiddleware, n as ROLES } from "./types-DvE639nH.mjs";
import { i as slotsForSide, r as FORMATION_BY_ID, t as DEFAULT_FORMATION } from "./formations-o5YYF_IL.mjs";
import { cn as _enum, dn as boolean, gn as object, hn as number, un as array, yn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board-api-CqV9wylz.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
function shareCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const bytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(6));
	return Array.from(bytes, (b) => alphabet[b % 32]).join("");
}
function parseTactics(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.flatMap((item) => {
			const result = tacticSchema.safeParse(item);
			return result.success ? [result.data] : [];
		});
	} catch {
		return [];
	}
}
function asKit(value, fallback) {
	return [
		"home",
		"away",
		"third",
		"keeper"
	].includes(value) ? value : fallback;
}
function asSide(value) {
	return value === "away" ? "away" : "home";
}
function mapPlayer(row) {
	return {
		id: row.id,
		boardId: row.board_id,
		name: row.name,
		number: row.number == null ? null : Number(row.number),
		prefRole: ROLES.includes(row.pref_role) ? row.pref_role : "CM",
		photo: row.photo,
		onPitch: Boolean(row.on_pitch),
		x: row.x == null ? null : Number(row.x),
		y: row.y == null ? null : Number(row.y),
		side: asSide(row.side)
	};
}
var BOARD_SELECT = `
  b.id, b.owner_id, b.name, b.share_code, b.formation, b.kit,
  coalesce(b.away_formation, '4-3-3') as away_formation,
  coalesce(b.away_kit, 'away') as away_kit,
  b.tactics_json, b.updated_at::text as updated_at
`;
async function requireMember(boardId, userId) {
	const board = (await (await getSql()).query(`select ${BOARD_SELECT}
     from boards b
     inner join board_members m on m.board_id = b.id
     where b.id = $1 and m.user_id = $2`, [boardId, userId]))[0];
	if (!board) throw new Error("找不到这块战术板，或你没有权限");
	return board;
}
async function loadDetail(board, userId) {
	const sql = await getSql();
	const [players, members] = await Promise.all([sql`
      select id, board_id, name, number, pref_role, photo, on_pitch, x, y,
             coalesce(side, 'home') as side
      from players where board_id = ${board.id}
      order by side, number nulls last, created_at
    `, sql`
      select user_id, role from board_members where board_id = ${board.id}
    `]);
	return {
		id: board.id,
		name: board.name,
		shareCode: board.share_code,
		formation: board.formation,
		awayFormation: board.away_formation || "4-3-3",
		kit: asKit(board.kit, "home"),
		awayKit: asKit(board.away_kit, "away"),
		ownerId: board.owner_id,
		isOwner: board.owner_id === userId,
		tactics: parseTactics(board.tactics_json),
		players: players.map(mapPlayer),
		members: members.map((m) => ({
			userId: m.user_id,
			role: m.role
		})),
		updatedAt: board.updated_at
	};
}
async function touch(boardId) {
	await (await getSql())`update boards set updated_at = now() where id = ${boardId}`;
}
var listBoards_createServerFn_handler = createServerRpc({
	id: "f585811ba9712401e2962f0a7809358f6e797784c84487fd80aae9d6651bfe55",
	name: "listBoards",
	filename: "src/lib/board-api.ts"
}, (opts) => listBoards.__executeServer(opts));
var listBoards = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listBoards_createServerFn_handler, async ({ context }) => {
	return (await (await getSql()).query(`select ${BOARD_SELECT},
              (select count(*)::int from board_members m2 where m2.board_id = b.id) as member_count,
              (select count(*)::int from players p where p.board_id = b.id) as player_count
       from boards b
       inner join board_members m on m.board_id = b.id
       where m.user_id = $1
       order by b.updated_at desc`, [context.userId])).map((r) => ({
		id: r.id,
		name: r.name,
		shareCode: r.share_code,
		formation: r.formation,
		kit: asKit(r.kit, "home"),
		isOwner: r.owner_id === context.userId,
		memberCount: Number(r.member_count),
		playerCount: Number(r.player_count),
		updatedAt: r.updated_at
	}));
});
var getBoard_createServerFn_handler = createServerRpc({
	id: "6145101ff080815fc76ad34e4ba8ee7b440fe166c015b1bbc3c9e18de6cadf85",
	name: "getBoard",
	filename: "src/lib/board-api.ts"
}, (opts) => getBoard.__executeServer(opts));
var getBoard = createServerFn({ method: "GET" }).validator((input) => object({ boardId: string().min(1) }).parse(input)).middleware([authMiddleware]).handler(getBoard_createServerFn_handler, async ({ context, data }) => {
	return loadDetail(await requireMember(data.boardId, context.userId), context.userId);
});
var createBoard_createServerFn_handler = createServerRpc({
	id: "4ec582b62d1449fc96d5b48920279b4e4468963215653a3615a88321c324243e",
	name: "createBoard",
	filename: "src/lib/board-api.ts"
}, (opts) => createBoard.__executeServer(opts));
var createBoard = createServerFn({ method: "POST" }).validator((input) => object({ name: string().trim().min(1).max(40) }).parse(input)).middleware([authMiddleware]).handler(createBoard_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const id = crypto.randomUUID();
	let code = shareCode();
	let created = false;
	for (let i = 0; i < 6; i++) try {
		await sql`
          insert into boards (id, owner_id, name, share_code, formation, away_formation, kit, away_kit)
          values (${id}, ${context.userId}, ${data.name}, ${code}, ${DEFAULT_FORMATION}, ${DEFAULT_FORMATION}, ${"home"}, ${"away"})
        `;
		created = true;
		break;
	} catch {
		code = shareCode();
	}
	if (!created) throw new Error("无法创建战术板，请重试");
	await sql`
      insert into board_members (board_id, user_id, role)
      values (${id}, ${context.userId}, ${"owner"})
    `;
	return { id };
});
var joinBoard_createServerFn_handler = createServerRpc({
	id: "6f174f35abce0992f23481f4eb10eeb2656538691277a0308a56aa5527fc4a73",
	name: "joinBoard",
	filename: "src/lib/board-api.ts"
}, (opts) => joinBoard.__executeServer(opts));
var joinBoard = createServerFn({ method: "POST" }).validator((input) => object({ code: string().trim().min(4).max(32) }).parse(input)).middleware([authMiddleware]).handler(joinBoard_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const board = (await sql`
      select id from boards where share_code = ${data.code.toUpperCase().replace(/[^A-Z0-9]/g, "")}
    `)[0];
	if (!board) throw new Error("邀请链接或邀请码无效");
	await sql`
      insert into board_members (board_id, user_id, role)
      values (${board.id}, ${context.userId}, ${"editor"})
      on conflict (board_id, user_id) do nothing
    `;
	await touch(board.id);
	return { id: board.id };
});
var renameBoard_createServerFn_handler = createServerRpc({
	id: "6be4f0ee1deaa2d8f614b01a5cf45c77703aeccff4f14c96e5c1e6ab26d08a67",
	name: "renameBoard",
	filename: "src/lib/board-api.ts"
}, (opts) => renameBoard.__executeServer(opts));
var renameBoard = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	name: string().trim().min(1).max(40)
}).parse(input)).middleware([authMiddleware]).handler(renameBoard_createServerFn_handler, async ({ context, data }) => {
	await requireMember(data.boardId, context.userId);
	await (await getSql())`update boards set name = ${data.name}, updated_at = now() where id = ${data.boardId}`;
	return { ok: true };
});
var setBoardMeta_createServerFn_handler = createServerRpc({
	id: "a060688585415194bdde41f171401738db96b4efd8045e77ba6856e59956244f",
	name: "setBoardMeta",
	filename: "src/lib/board-api.ts"
}, (opts) => setBoardMeta.__executeServer(opts));
var setBoardMeta = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	formation: string().optional(),
	awayFormation: string().optional(),
	kit: kitSchema.optional(),
	awayKit: kitSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(setBoardMeta_createServerFn_handler, async ({ context, data }) => {
	await requireMember(data.boardId, context.userId);
	const sql = await getSql();
	if (data.formation) await sql`update boards set formation = ${data.formation}, updated_at = now() where id = ${data.boardId}`;
	if (data.awayFormation) await sql`update boards set away_formation = ${data.awayFormation}, updated_at = now() where id = ${data.boardId}`;
	if (data.kit) await sql`update boards set kit = ${data.kit}, updated_at = now() where id = ${data.boardId}`;
	if (data.awayKit) await sql`update boards set away_kit = ${data.awayKit}, updated_at = now() where id = ${data.boardId}`;
	return { ok: true };
});
var saveTactics_createServerFn_handler = createServerRpc({
	id: "7fb39a05e5b2303f03975bbdb0f33eace3a8d8893687d96730ee616aa3bdc572",
	name: "saveTactics",
	filename: "src/lib/board-api.ts"
}, (opts) => saveTactics.__executeServer(opts));
var saveTactics = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	tactics: array(tacticSchema)
}).parse(input)).middleware([authMiddleware]).handler(saveTactics_createServerFn_handler, async ({ context, data }) => {
	await requireMember(data.boardId, context.userId);
	await (await getSql())`update boards set tactics_json = ${JSON.stringify(data.tactics)}, updated_at = now() where id = ${data.boardId}`;
	return { ok: true };
});
var deleteBoard_createServerFn_handler = createServerRpc({
	id: "c2e6458b9b322e98cea35ca77086159c3d8ea93eccfe5d552a953825c4b8aca8",
	name: "deleteBoard",
	filename: "src/lib/board-api.ts"
}, (opts) => deleteBoard.__executeServer(opts));
var deleteBoard = createServerFn({ method: "POST" }).validator((input) => object({ boardId: string().min(1) }).parse(input)).middleware([authMiddleware]).handler(deleteBoard_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const board = (await sql`
      select owner_id from boards where id = ${data.boardId}
    `)[0];
	if (!board || board.owner_id !== context.userId) throw new Error("只有创建者可以删除");
	await sql`delete from boards where id = ${data.boardId}`;
	return { ok: true };
});
var leaveBoard_createServerFn_handler = createServerRpc({
	id: "fd3b8ec3e7173a03e1341769ad63a09b23b193384d313aad41e0a2f8601df66e",
	name: "leaveBoard",
	filename: "src/lib/board-api.ts"
}, (opts) => leaveBoard.__executeServer(opts));
var leaveBoard = createServerFn({ method: "POST" }).validator((input) => object({ boardId: string().min(1) }).parse(input)).middleware([authMiddleware]).handler(leaveBoard_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if ((await sql`
      select owner_id from boards where id = ${data.boardId}
    `)[0]?.owner_id === context.userId) throw new Error("创建者不能退出，请直接删除战术板");
	await sql`
      delete from board_members
      where board_id = ${data.boardId} and user_id = ${context.userId}
    `;
	return { ok: true };
});
var addPlayer_createServerFn_handler = createServerRpc({
	id: "eb5a75299bbc3b8659ce609705d7caf90b4673da79ff8336211b6cb88bd0acbc",
	name: "addPlayer",
	filename: "src/lib/board-api.ts"
}, (opts) => addPlayer.__executeServer(opts));
var addPlayer = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	name: string().trim().min(1).max(24),
	number: number().int().min(1).max(99).nullable().optional(),
	prefRole: roleSchema,
	photo: string().max(15e4).nullable().optional(),
	side: sideSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(addPlayer_createServerFn_handler, async ({ context, data }) => {
	await requireMember(data.boardId, context.userId);
	const sql = await getSql();
	const id = crypto.randomUUID();
	const photo = data.photo ?? null;
	const number = data.number ?? null;
	const side = data.side ?? "home";
	await sql`
      insert into players (id, board_id, name, number, pref_role, photo, on_pitch, side)
      values (${id}, ${data.boardId}, ${data.name}, ${number}, ${data.prefRole}, ${photo}, false, ${side})
    `;
	await touch(data.boardId);
	return { id };
});
var updatePlayer_createServerFn_handler = createServerRpc({
	id: "eda3c460d3dd83e73080bc8f8b7d6842eef749ce21ffa4e52efbed511ec648ae",
	name: "updatePlayer",
	filename: "src/lib/board-api.ts"
}, (opts) => updatePlayer.__executeServer(opts));
var updatePlayer = createServerFn({ method: "POST" }).validator((input) => object({
	playerId: string().min(1),
	name: string().trim().min(1).max(24).optional(),
	number: number().int().min(1).max(99).nullable().optional(),
	prefRole: roleSchema.optional(),
	photo: string().max(15e4).nullable().optional(),
	side: sideSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(updatePlayer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = (await sql`
      select board_id from players where id = ${data.playerId}
    `)[0];
	if (!row) throw new Error("找不到这名球员");
	await requireMember(row.board_id, context.userId);
	if (data.name !== void 0) await sql`update players set name = ${data.name} where id = ${data.playerId}`;
	if (data.number !== void 0) await sql`update players set number = ${data.number} where id = ${data.playerId}`;
	if (data.prefRole !== void 0) await sql`update players set pref_role = ${data.prefRole} where id = ${data.playerId}`;
	if (data.photo !== void 0) await sql`update players set photo = ${data.photo} where id = ${data.playerId}`;
	if (data.side !== void 0) await sql`update players set side = ${data.side} where id = ${data.playerId}`;
	await touch(row.board_id);
	return { ok: true };
});
var deletePlayer_createServerFn_handler = createServerRpc({
	id: "42211a1eac03474df83c1504033e80a9c0a07088fa646d121e8fd8de0c0fba37",
	name: "deletePlayer",
	filename: "src/lib/board-api.ts"
}, (opts) => deletePlayer.__executeServer(opts));
var deletePlayer = createServerFn({ method: "POST" }).validator((input) => object({ playerId: string().min(1) }).parse(input)).middleware([authMiddleware]).handler(deletePlayer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = (await sql`
      select board_id from players where id = ${data.playerId}
    `)[0];
	if (!row) return { ok: true };
	await requireMember(row.board_id, context.userId);
	await sql`delete from players where id = ${data.playerId}`;
	await touch(row.board_id);
	return { ok: true };
});
var movePlayer_createServerFn_handler = createServerRpc({
	id: "e13dfba1a66c7a7fe711aa5d5d5b021b8e51e19fc9df4df53fe2cee95ec3ff72",
	name: "movePlayer",
	filename: "src/lib/board-api.ts"
}, (opts) => movePlayer.__executeServer(opts));
var movePlayer = createServerFn({ method: "POST" }).validator((input) => object({
	playerId: string().min(1),
	onPitch: boolean(),
	x: number().min(0).max(100).nullable(),
	y: number().min(0).max(100).nullable()
}).parse(input)).middleware([authMiddleware]).handler(movePlayer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = (await sql`
      select board_id from players where id = ${data.playerId}
    `)[0];
	if (!row) throw new Error("找不到这名球员");
	await requireMember(row.board_id, context.userId);
	await sql`
      update players
      set on_pitch = ${data.onPitch}, x = ${data.x}, y = ${data.y}
      where id = ${data.playerId}
    `;
	await touch(row.board_id);
	return { ok: true };
});
var SAMPLE_HOME = [
	{
		name: "陈浩",
		number: 1,
		prefRole: "GK"
	},
	{
		name: "林志远",
		number: 2,
		prefRole: "RB"
	},
	{
		name: "王磊",
		number: 3,
		prefRole: "CB"
	},
	{
		name: "赵宇",
		number: 4,
		prefRole: "CB"
	},
	{
		name: "刘洋",
		number: 5,
		prefRole: "LB"
	},
	{
		name: "黄凯",
		number: 6,
		prefRole: "CDM"
	},
	{
		name: "周杰",
		number: 7,
		prefRole: "RM"
	},
	{
		name: "吴昊",
		number: 8,
		prefRole: "CM"
	},
	{
		name: "郑毅",
		number: 9,
		prefRole: "ST"
	},
	{
		name: "孙宁",
		number: 10,
		prefRole: "CAM"
	},
	{
		name: "马超",
		number: 11,
		prefRole: "LW"
	}
];
var SAMPLE_AWAY = [
	{
		name: "高远",
		number: 1,
		prefRole: "GK"
	},
	{
		name: "谢鹏",
		number: 2,
		prefRole: "RB"
	},
	{
		name: "韩磊",
		number: 3,
		prefRole: "CB"
	},
	{
		name: "冯涛",
		number: 4,
		prefRole: "CB"
	},
	{
		name: "曹斌",
		number: 5,
		prefRole: "LB"
	},
	{
		name: "邓凯",
		number: 6,
		prefRole: "CDM"
	},
	{
		name: "钱宇",
		number: 7,
		prefRole: "RM"
	},
	{
		name: "许明",
		number: 8,
		prefRole: "CM"
	},
	{
		name: "沈杰",
		number: 9,
		prefRole: "ST"
	},
	{
		name: "蒋宁",
		number: 10,
		prefRole: "CAM"
	},
	{
		name: "潘超",
		number: 11,
		prefRole: "LW"
	}
];
async function insertSquad(boardId, side, squad, formationId) {
	const sql = await getSql();
	const formation = FORMATION_BY_ID[formationId] ?? FORMATION_BY_ID["4-3-3"];
	const slots = slotsForSide(formation, side);
	for (let i = 0; i < squad.length; i++) {
		const p = squad[i];
		const slot = slots[i];
		const id = crypto.randomUUID();
		const x = slot?.x ?? 50;
		const y = slot?.y ?? 50;
		await sql`
      insert into players (id, board_id, name, number, pref_role, on_pitch, x, y, side)
      values (${id}, ${boardId}, ${p.name}, ${p.number}, ${p.prefRole}, true, ${x}, ${y}, ${side})
    `;
	}
}
var seedSquad_createServerFn_handler = createServerRpc({
	id: "e129cdd88fbfac43066a4ef8eeaa3d90f1df3231c4f8d170dfb3697929ac76ac",
	name: "seedSquad",
	filename: "src/lib/board-api.ts"
}, (opts) => seedSquad.__executeServer(opts));
var seedSquad = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	side: sideSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(seedSquad_createServerFn_handler, async ({ context, data }) => {
	const board = await requireMember(data.boardId, context.userId);
	const sql = await getSql();
	if (data.side) {
		const existing = await sql`
        select count(*)::int as c from players
        where board_id = ${data.boardId} and coalesce(side, 'home') = ${data.side}
      `;
		if (Number(existing[0]?.c ?? 0) > 0) throw new Error("这支队伍已经有球员了");
		await insertSquad(data.boardId, data.side, data.side === "away" ? SAMPLE_AWAY : SAMPLE_HOME, data.side === "away" ? board.away_formation : board.formation);
	} else {
		const existing = await sql`
        select count(*)::int as c from players where board_id = ${data.boardId}
      `;
		if (Number(existing[0]?.c ?? 0) > 0) throw new Error("名单里已经有球员了");
		await insertSquad(data.boardId, "home", SAMPLE_HOME, board.formation);
		await insertSquad(data.boardId, "away", SAMPLE_AWAY, board.away_formation);
	}
	await touch(data.boardId);
	return { ok: true };
});
var applyFormation_createServerFn_handler = createServerRpc({
	id: "ac946b16768848e1241b97cfda62539f85df74f5b00846dbc696b30f32a4ae7f",
	name: "applyFormation",
	filename: "src/lib/board-api.ts"
}, (opts) => applyFormation.__executeServer(opts));
var applyFormation = createServerFn({ method: "POST" }).validator((input) => object({
	boardId: string().min(1),
	formationId: string().min(1),
	side: sideSchema.optional()
}).parse(input)).middleware([authMiddleware]).handler(applyFormation_createServerFn_handler, async ({ context, data }) => {
	await requireMember(data.boardId, context.userId);
	const formation = FORMATION_BY_ID[data.formationId];
	if (!formation) throw new Error("未知阵型");
	const side = data.side ?? "home";
	const sql = await getSql();
	const mapped = (await sql`
      select id, board_id, name, number, pref_role, photo, on_pitch, x, y,
             coalesce(side, 'home') as side
      from players where board_id = ${data.boardId}
      order by on_pitch desc, y nulls last, number nulls last, created_at
    `).map(mapPlayer).filter((p) => p.side === side);
	const slots = slotsForSide(formation, side);
	const used = /* @__PURE__ */ new Set();
	const assigned = [];
	for (const slot of slots) {
		const match = mapped.find((p) => !used.has(p.id) && p.prefRole === slot.role);
		if (match) {
			used.add(match.id);
			assigned.push({
				player: match,
				slot
			});
		}
	}
	for (const slot of slots) {
		if (assigned.some((a) => a.slot === slot)) continue;
		const next = mapped.find((p) => !used.has(p.id));
		if (!next) break;
		used.add(next.id);
		assigned.push({
			player: next,
			slot
		});
	}
	for (const p of mapped) {
		const hit = assigned.find((a) => a.player.id === p.id);
		if (hit) await sql`
          update players set on_pitch = true, x = ${hit.slot.x}, y = ${hit.slot.y}
          where id = ${p.id}
        `;
		else await sql`
          update players set on_pitch = false, x = null, y = null
          where id = ${p.id}
        `;
	}
	if (side === "away") await sql`
        update boards set away_formation = ${data.formationId}, updated_at = now()
        where id = ${data.boardId}
      `;
	else await sql`
        update boards set formation = ${data.formationId}, updated_at = now()
        where id = ${data.boardId}
      `;
	return { ok: true };
});
//#endregion
export { addPlayer_createServerFn_handler, applyFormation_createServerFn_handler, createBoard_createServerFn_handler, deleteBoard_createServerFn_handler, deletePlayer_createServerFn_handler, getBoard_createServerFn_handler, joinBoard_createServerFn_handler, leaveBoard_createServerFn_handler, listBoards_createServerFn_handler, movePlayer_createServerFn_handler, renameBoard_createServerFn_handler, saveTactics_createServerFn_handler, seedSquad_createServerFn_handler, setBoardMeta_createServerFn_handler, updatePlayer_createServerFn_handler };
