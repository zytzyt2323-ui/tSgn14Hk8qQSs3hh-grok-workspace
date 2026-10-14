import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { DEFAULT_FORMATION, FORMATION_BY_ID, slotsForSide } from "@/lib/formations";
import type {
  BoardDetail,
  BoardSummary,
  KitId,
  Player,
  Role,
  Side,
  TacticMark,
} from "@/lib/types";
import { ROLES } from "@/lib/types";

const roleSchema = z.enum(ROLES);
const kitSchema = z.enum(["home", "away", "third", "keeper"]);
const sideSchema = z.enum(["home", "away"]);

const tacticSchema = z.object({
  id: z.string(),
  kind: z.enum(["arrow", "curve", "zone", "note"]),
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  cx: z.number().optional(),
  cy: z.number().optional(),
  rx: z.number().optional(),
  ry: z.number().optional(),
  text: z.string().optional(),
});

type BoardRow = {
  id: string;
  owner_id: string;
  name: string;
  share_code: string;
  formation: string;
  kit: string;
  away_formation: string;
  away_kit: string;
  tactics_json: string;
  updated_at: string;
};

type PlayerRow = {
  id: string;
  board_id: string;
  name: string;
  number: number | null;
  pref_role: string;
  photo: string | null;
  on_pitch: boolean;
  x: number | null;
  y: number | null;
  side: string;
};

type MemberRow = { user_id: string; role: string };

function shareCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function parseTactics(raw: string): TacticMark[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const result = tacticSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

function asKit(value: string | null | undefined, fallback: KitId): KitId {
  return (["home", "away", "third", "keeper"] as const).includes(value as KitId)
    ? (value as KitId)
    : fallback;
}

function asSide(value: string | null | undefined): Side {
  return value === "away" ? "away" : "home";
}

function mapPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    number: row.number == null ? null : Number(row.number),
    prefRole: (ROLES.includes(row.pref_role as Role) ? row.pref_role : "CM") as Role,
    photo: row.photo,
    onPitch: Boolean(row.on_pitch),
    x: row.x == null ? null : Number(row.x),
    y: row.y == null ? null : Number(row.y),
    side: asSide(row.side),
  };
}

const BOARD_SELECT = `
  b.id, b.owner_id, b.name, b.share_code, b.formation, b.kit,
  coalesce(b.away_formation, '4-3-3') as away_formation,
  coalesce(b.away_kit, 'away') as away_kit,
  b.tactics_json, b.updated_at::text as updated_at
`;

async function requireMember(boardId: string, userId: string): Promise<BoardRow> {
  const sql = await getSql();
  const rows = await sql.query<BoardRow>(
    `select ${BOARD_SELECT}
     from boards b
     inner join board_members m on m.board_id = b.id
     where b.id = $1 and m.user_id = $2`,
    [boardId, userId],
  );
  const board = rows[0];
  if (!board) {
    throw new Error("找不到这块战术板，或你没有权限");
  }
  return board;
}

async function loadDetail(board: BoardRow, userId: string): Promise<BoardDetail> {
  const sql = await getSql();
  const [players, members] = await Promise.all([
    sql<PlayerRow>`
      select id, board_id, name, number, pref_role, photo, on_pitch, x, y,
             coalesce(side, 'home') as side
      from players where board_id = ${board.id}
      order by side, number nulls last, created_at
    `,
    sql<MemberRow>`
      select user_id, role from board_members where board_id = ${board.id}
    `,
  ]);
  return {
    id: board.id,
    name: board.name,
    shareCode: board.share_code,
    formation: board.formation,
    awayFormation: board.away_formation || DEFAULT_FORMATION,
    kit: asKit(board.kit, "home"),
    awayKit: asKit(board.away_kit, "away"),
    ownerId: board.owner_id,
    isOwner: board.owner_id === userId,
    tactics: parseTactics(board.tactics_json),
    players: players.map(mapPlayer),
    members: members.map((m) => ({ userId: m.user_id, role: m.role })),
    updatedAt: board.updated_at,
  };
}

async function touch(boardId: string) {
  const sql = await getSql();
  await sql`update boards set updated_at = now() where id = ${boardId}`;
}

export const listBoards = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<
      BoardRow & { member_count: number; player_count: number }
    >(
      `select ${BOARD_SELECT},
              (select count(*)::int from board_members m2 where m2.board_id = b.id) as member_count,
              (select count(*)::int from players p where p.board_id = b.id) as player_count
       from boards b
       inner join board_members m on m.board_id = b.id
       where m.user_id = $1
       order by b.updated_at desc`,
      [context.userId],
    );
    return rows.map(
      (r): BoardSummary => ({
        id: r.id,
        name: r.name,
        shareCode: r.share_code,
        formation: r.formation,
        kit: asKit(r.kit, "home"),
        isOwner: r.owner_id === context.userId,
        memberCount: Number(r.member_count),
        playerCount: Number(r.player_count),
        updatedAt: r.updated_at,
      }),
    );
  });

export const getBoard = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ boardId: z.string().min(1) }).parse(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const board = await requireMember(data.boardId, context.userId);
    return loadDetail(board, context.userId);
  });

export const createBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ name: z.string().trim().min(1).max(40) }).parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    let code = shareCode();
    let created = false;
    let lastError: unknown = null;
    for (let i = 0; i < 6; i++) {
      try {
        await sql`
          insert into boards (id, owner_id, name, share_code, formation, away_formation, kit, away_kit)
          values (${id}, ${context.userId}, ${data.name}, ${code}, ${DEFAULT_FORMATION}, ${DEFAULT_FORMATION}, ${"home"}, ${"away"})
        `;
        created = true;
        break;
      } catch (err) {
        lastError = err;
        code = shareCode();
      }
    }
    if (!created) {
      const detail = lastError instanceof Error ? lastError.message : "请重试";
      throw new Error(`无法创建战术板：${detail}`);
    }
    await sql`
      insert into board_members (board_id, user_id, role)
      values (${id}, ${context.userId}, ${"owner"})
    `;
    return { id };
  });

export const joinBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({ code: z.string().trim().min(4).max(32) })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const code = data.code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const rows = await sql<{ id: string }>`
      select id from boards where share_code = ${code}
    `;
    const board = rows[0];
    if (!board) throw new Error("邀请链接或邀请码无效");
    await sql`
      insert into board_members (board_id, user_id, role)
      values (${board.id}, ${context.userId}, ${"editor"})
      on conflict (board_id, user_id) do nothing
    `;
    await touch(board.id);
    return { id: board.id };
  });

export const renameBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        boardId: z.string().min(1),
        name: z.string().trim().min(1).max(40),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await requireMember(data.boardId, context.userId);
    const sql = await getSql();
    await sql`update boards set name = ${data.name}, updated_at = now() where id = ${data.boardId}`;
    return { ok: true as const };
  });

export const setBoardMeta = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        boardId: z.string().min(1),
        formation: z.string().optional(),
        awayFormation: z.string().optional(),
        kit: kitSchema.optional(),
        awayKit: kitSchema.optional(),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await requireMember(data.boardId, context.userId);
    const sql = await getSql();
    if (data.formation) {
      await sql`update boards set formation = ${data.formation}, updated_at = now() where id = ${data.boardId}`;
    }
    if (data.awayFormation) {
      await sql`update boards set away_formation = ${data.awayFormation}, updated_at = now() where id = ${data.boardId}`;
    }
    if (data.kit) {
      await sql`update boards set kit = ${data.kit}, updated_at = now() where id = ${data.boardId}`;
    }
    if (data.awayKit) {
      await sql`update boards set away_kit = ${data.awayKit}, updated_at = now() where id = ${data.boardId}`;
    }
    return { ok: true as const };
  });

export const saveTactics = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        boardId: z.string().min(1),
        tactics: z.array(tacticSchema),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await requireMember(data.boardId, context.userId);
    const sql = await getSql();
    const json = JSON.stringify(data.tactics);
    await sql`update boards set tactics_json = ${json}, updated_at = now() where id = ${data.boardId}`;
    return { ok: true as const };
  });

export const deleteBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ boardId: z.string().min(1) }).parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ owner_id: string }>`
      select owner_id from boards where id = ${data.boardId}
    `;
    const board = rows[0];
    if (!board || board.owner_id !== context.userId) {
      throw new Error("只有创建者可以删除");
    }
    await sql`delete from boards where id = ${data.boardId}`;
    return { ok: true as const };
  });

export const leaveBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ boardId: z.string().min(1) }).parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ owner_id: string }>`
      select owner_id from boards where id = ${data.boardId}
    `;
    if (rows[0]?.owner_id === context.userId) {
      throw new Error("创建者不能退出，请直接删除战术板");
    }
    await sql`
      delete from board_members
      where board_id = ${data.boardId} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const addPlayer = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        boardId: z.string().min(1),
        name: z.string().trim().min(1).max(24),
        number: z.number().int().min(1).max(99).nullable().optional(),
        prefRole: roleSchema,
        photo: z.string().max(150_000).nullable().optional(),
        side: sideSchema.optional(),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
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

export const updatePlayer = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        playerId: z.string().min(1),
        name: z.string().trim().min(1).max(24).optional(),
        number: z.number().int().min(1).max(99).nullable().optional(),
        prefRole: roleSchema.optional(),
        photo: z.string().max(150_000).nullable().optional(),
        side: sideSchema.optional(),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ board_id: string }>`
      select board_id from players where id = ${data.playerId}
    `;
    const row = rows[0];
    if (!row) throw new Error("找不到这名球员");
    await requireMember(row.board_id, context.userId);
    if (data.name !== undefined) {
      await sql`update players set name = ${data.name} where id = ${data.playerId}`;
    }
    if (data.number !== undefined) {
      await sql`update players set number = ${data.number} where id = ${data.playerId}`;
    }
    if (data.prefRole !== undefined) {
      await sql`update players set pref_role = ${data.prefRole} where id = ${data.playerId}`;
    }
    if (data.photo !== undefined) {
      await sql`update players set photo = ${data.photo} where id = ${data.playerId}`;
    }
    if (data.side !== undefined) {
      await sql`update players set side = ${data.side} where id = ${data.playerId}`;
    }
    await touch(row.board_id);
    return { ok: true as const };
  });

export const deletePlayer = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ playerId: z.string().min(1) }).parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ board_id: string }>`
      select board_id from players where id = ${data.playerId}
    `;
    const row = rows[0];
    if (!row) return { ok: true as const };
    await requireMember(row.board_id, context.userId);
    await sql`delete from players where id = ${data.playerId}`;
    await touch(row.board_id);
    return { ok: true as const };
  });

export const movePlayer = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        playerId: z.string().min(1),
        onPitch: z.boolean(),
        x: z.number().min(0).max(100).nullable(),
        y: z.number().min(0).max(100).nullable(),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ board_id: string }>`
      select board_id from players where id = ${data.playerId}
    `;
    const row = rows[0];
    if (!row) throw new Error("找不到这名球员");
    await requireMember(row.board_id, context.userId);
    await sql`
      update players
      set on_pitch = ${data.onPitch}, x = ${data.x}, y = ${data.y}
      where id = ${data.playerId}
    `;
    await touch(row.board_id);
    return { ok: true as const };
  });

export const movePlayers = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        moves: z
          .array(
            z.object({
              playerId: z.string().min(1),
              onPitch: z.boolean(),
              x: z.number().min(0).max(100).nullable(),
              y: z.number().min(0).max(100).nullable(),
            }),
          )
          .min(1)
          .max(22),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const boardIds = new Set<string>();
    for (const move of data.moves) {
      const rows = await sql<{ board_id: string }>`
        select board_id from players where id = ${move.playerId}
      `;
      const row = rows[0];
      if (!row) continue;
      await requireMember(row.board_id, context.userId);
      boardIds.add(row.board_id);
      await sql`
        update players
        set on_pitch = ${move.onPitch}, x = ${move.x}, y = ${move.y}
        where id = ${move.playerId}
      `;
    }
    for (const id of boardIds) await touch(id);
    return { ok: true as const };
  });

const SAMPLE_HOME: { name: string; number: number; prefRole: Role }[] = [
  { name: "陈浩", number: 1, prefRole: "GK" },
  { name: "林志远", number: 2, prefRole: "RB" },
  { name: "王磊", number: 3, prefRole: "CB" },
  { name: "赵宇", number: 4, prefRole: "CB" },
  { name: "刘洋", number: 5, prefRole: "LB" },
  { name: "黄凯", number: 6, prefRole: "CDM" },
  { name: "周杰", number: 7, prefRole: "RM" },
  { name: "吴昊", number: 8, prefRole: "CM" },
  { name: "郑毅", number: 9, prefRole: "ST" },
  { name: "孙宁", number: 10, prefRole: "CAM" },
  { name: "马超", number: 11, prefRole: "LW" },
];

const SAMPLE_AWAY: { name: string; number: number; prefRole: Role }[] = [
  { name: "高远", number: 1, prefRole: "GK" },
  { name: "谢鹏", number: 2, prefRole: "RB" },
  { name: "韩磊", number: 3, prefRole: "CB" },
  { name: "冯涛", number: 4, prefRole: "CB" },
  { name: "曹斌", number: 5, prefRole: "LB" },
  { name: "邓凯", number: 6, prefRole: "CDM" },
  { name: "钱宇", number: 7, prefRole: "RM" },
  { name: "许明", number: 8, prefRole: "CM" },
  { name: "沈杰", number: 9, prefRole: "ST" },
  { name: "蒋宁", number: 10, prefRole: "CAM" },
  { name: "潘超", number: 11, prefRole: "LW" },
];

async function insertSquad(
  boardId: string,
  side: Side,
  squad: typeof SAMPLE_HOME,
  formationId: string,
) {
  const sql = await getSql();
  const formation = FORMATION_BY_ID[formationId] ?? FORMATION_BY_ID[DEFAULT_FORMATION]!;
  const slots = slotsForSide(formation, side);
  for (let i = 0; i < squad.length; i++) {
    const p = squad[i]!;
    const slot = slots[i];
    const id = crypto.randomUUID();
    const x = slot?.x ?? 50;
    const y = slot?.y ?? 50;
    const role = slot?.role ?? p.prefRole;
    await sql`
      insert into players (id, board_id, name, number, pref_role, on_pitch, x, y, side)
      values (${id}, ${boardId}, ${p.name}, ${p.number}, ${role}, true, ${x}, ${y}, ${side})
    `;
  }
}

export const seedSquad = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        boardId: z.string().min(1),
        side: sideSchema.optional(),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const board = await requireMember(data.boardId, context.userId);
    const sql = await getSql();
    if (data.side) {
      const existing = await sql<{ c: number }>`
        select count(*)::int as c from players
        where board_id = ${data.boardId} and coalesce(side, 'home') = ${data.side}
      `;
      if (Number(existing[0]?.c ?? 0) > 0) {
        throw new Error("这支队伍已经有球员了");
      }
      await insertSquad(
        data.boardId,
        data.side,
        data.side === "away" ? SAMPLE_AWAY : SAMPLE_HOME,
        data.side === "away" ? board.away_formation : board.formation,
      );
    } else {
      const existing = await sql<{ c: number }>`
        select count(*)::int as c from players where board_id = ${data.boardId}
      `;
      if (Number(existing[0]?.c ?? 0) > 0) {
        throw new Error("名单里已经有球员了");
      }
      await insertSquad(data.boardId, "home", SAMPLE_HOME, board.formation);
      await insertSquad(data.boardId, "away", SAMPLE_AWAY, board.away_formation);
    }
    await touch(data.boardId);
    return { ok: true as const };
  });

export const applyFormation = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        boardId: z.string().min(1),
        formationId: z.string().min(1),
        side: sideSchema.optional(),
      })
      .parse(input),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await requireMember(data.boardId, context.userId);
    const formation = FORMATION_BY_ID[data.formationId];
    if (!formation) throw new Error("未知阵型");
    const side: Side = data.side ?? "home";
    const sql = await getSql();
    const players = await sql<PlayerRow>`
      select id, board_id, name, number, pref_role, photo, on_pitch, x, y,
             coalesce(side, 'home') as side
      from players where board_id = ${data.boardId}
      order by on_pitch desc, y nulls last, number nulls last, created_at
    `;
    const mapped = players.map(mapPlayer).filter((p) => p.side === side);
    const slots = slotsForSide(formation, side);
    const used = new Set<string>();
    const assigned: { player: Player; slot: (typeof slots)[number] }[] = [];

    for (const slot of slots) {
      const match = mapped.find((p) => !used.has(p.id) && p.prefRole === slot.role);
      if (match) {
        used.add(match.id);
        assigned.push({ player: match, slot });
      }
    }
    for (const slot of slots) {
      if (assigned.some((a) => a.slot === slot)) continue;
      const next = mapped.find((p) => !used.has(p.id));
      if (!next) break;
      used.add(next.id);
      assigned.push({ player: next, slot });
    }

    for (const p of mapped) {
      const hit = assigned.find((a) => a.player.id === p.id);
      if (hit) {
        await sql`
          update players
          set on_pitch = true, x = ${hit.slot.x}, y = ${hit.slot.y}, pref_role = ${hit.slot.role}
          where id = ${p.id}
        `;
      } else {
        await sql`
          update players set on_pitch = false, x = null, y = null
          where id = ${p.id}
        `;
      }
    }
    if (side === "away") {
      await sql`
        update boards set away_formation = ${data.formationId}, updated_at = now()
        where id = ${data.boardId}
      `;
    } else {
      await sql`
        update boards set formation = ${data.formationId}, updated_at = now()
        where id = ${data.boardId}
      `;
    }
    return { ok: true as const };
  });
