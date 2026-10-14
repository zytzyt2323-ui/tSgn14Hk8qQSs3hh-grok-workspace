export const ROLES = [
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
  "ST",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
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
  ST: "前锋",
};

export type KitId = "home" | "away" | "third" | "keeper";

export const KITS: { id: KitId; label: string }[] = [
  { id: "home", label: "浅色" },
  { id: "away", label: "深色" },
  { id: "third", label: "红色" },
  { id: "keeper", label: "门将" },
];

export type Side = "home" | "away";

export const SIDES: { id: Side; label: string }[] = [
  { id: "home", label: "主队" },
  { id: "away", label: "客队" },
];

export type TacticKind = "arrow" | "curve" | "zone" | "note";

export type TacticMark = {
  id: string;
  kind: TacticKind;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  text?: string;
};

export type Player = {
  id: string;
  boardId: string;
  name: string;
  number: number | null;
  prefRole: Role;
  photo: string | null;
  onPitch: boolean;
  x: number | null;
  y: number | null;
  side: Side;
};

export type BoardSummary = {
  id: string;
  name: string;
  shareCode: string;
  formation: string;
  kit: KitId;
  isOwner: boolean;
  memberCount: number;
  playerCount: number;
  updatedAt: string;
};

export type BoardDetail = {
  id: string;
  name: string;
  shareCode: string;
  formation: string;
  awayFormation: string;
  kit: KitId;
  awayKit: KitId;
  ownerId: string;
  isOwner: boolean;
  tactics: TacticMark[];
  players: Player[];
  members: { userId: string; role: string }[];
  updatedAt: string;
};
