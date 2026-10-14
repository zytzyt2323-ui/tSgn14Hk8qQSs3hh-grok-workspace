create table if not exists boards (
  id text primary key,
  owner_id text not null,
  name text not null,
  share_code text not null unique,
  formation text not null default '4-3-3',
  kit text not null default 'home',
  tactics_json text not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists boards_owner_id_idx on boards (owner_id);
create index if not exists boards_share_code_idx on boards (share_code);

create table if not exists board_members (
  board_id text not null references boards (id) on delete cascade,
  user_id text not null,
  role text not null default 'editor',
  joined_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create index if not exists board_members_user_id_idx on board_members (user_id);

create table if not exists players (
  id text primary key,
  board_id text not null references boards (id) on delete cascade,
  name text not null,
  number integer,
  pref_role text not null default 'CM',
  photo text,
  on_pitch boolean not null default false,
  x double precision,
  y double precision,
  created_at timestamptz not null default now()
);

create index if not exists players_board_id_idx on players (board_id);
