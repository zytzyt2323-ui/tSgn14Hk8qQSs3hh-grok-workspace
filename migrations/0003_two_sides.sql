alter table players add column if not exists side text not null default 'home';
create index if not exists players_side_idx on players (board_id, side);

alter table boards add column if not exists away_formation text not null default '4-3-3';
alter table boards add column if not exists away_kit text not null default 'away';
