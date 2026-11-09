-- Towerbound online services: global leaderboard, public PvP ghost builds and ratings.
-- Apply after 202611090001_cloud_saves.sql in the dedicated Towerbound Supabase project.
-- The browser may publish only its own profile/ghost. PvP rating writes are intentionally
-- withheld until battle outcomes are validated by a trusted Edge Function.

create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  class text not null check (char_length(class) between 1 and 40),
  battle_power integer not null default 0 check (battle_power >= 0),
  max_stage integer not null default 0 check (max_stage between 0 and 250),
  updated_at timestamptz not null default now()
);
create index if not exists leaderboard_top100_idx
  on public.leaderboard (battle_power desc, max_stage desc, updated_at asc);

alter table public.leaderboard enable row level security;
drop policy if exists "Leaderboard is publicly readable" on public.leaderboard;
create policy "Leaderboard is publicly readable"
  on public.leaderboard for select to anon, authenticated using (true);
drop policy if exists "Players can insert their own leaderboard row" on public.leaderboard;
create policy "Players can insert their own leaderboard row"
  on public.leaderboard for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists "Players can update their own leaderboard row" on public.leaderboard;
create policy "Players can update their own leaderboard row"
  on public.leaderboard for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
revoke all on public.leaderboard from anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
grant insert, update on public.leaderboard to authenticated;

create table if not exists public.pvp_ghosts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  class text not null check (char_length(class) between 1 and 40),
  level integer not null default 1 check (level between 1 and 100),
  battle_power integer not null default 0 check (battle_power >= 0),
  max_stage integer not null default 0 check (max_stage between 0 and 250),
  max_hp integer not null default 1 check (max_hp > 0),
  attack integer not null default 1 check (attack >= 0),
  defense integer not null default 0 check (defense >= 0),
  build jsonb not null default '{}'::jsonb check (jsonb_typeof(build) = 'object' and octet_length(build::text) <= 100000),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create index if not exists pvp_ghosts_matchmaking_idx
  on public.pvp_ghosts (battle_power, expires_at);

alter table public.pvp_ghosts enable row level security;
drop policy if exists "Authenticated players can discover active ghosts" on public.pvp_ghosts;
create policy "Authenticated players can discover active ghosts"
  on public.pvp_ghosts for select to authenticated
  using (expires_at > now());
drop policy if exists "Players can publish their own ghost" on public.pvp_ghosts;
create policy "Players can publish their own ghost"
  on public.pvp_ghosts for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists "Players can update their own ghost" on public.pvp_ghosts;
create policy "Players can update their own ghost"
  on public.pvp_ghosts for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
revoke all on public.pvp_ghosts from anon, authenticated;
grant select, insert, update on public.pvp_ghosts to authenticated;

-- Rating is a server-owned ledger. There are deliberately no client write policies or grants.
-- A trusted resolver must validate the duel before changing these values.
create table if not exists public.pvp_ratings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rating integer not null default 1000 check (rating >= 0),
  points bigint not null default 0 check (points >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  updated_at timestamptz not null default now()
);
create index if not exists pvp_ratings_top_idx on public.pvp_ratings (rating desc, wins desc);
alter table public.pvp_ratings enable row level security;
drop policy if exists "PvP ratings are publicly readable" on public.pvp_ratings;
create policy "PvP ratings are publicly readable"
  on public.pvp_ratings for select to authenticated using (true);
revoke all on public.pvp_ratings from anon, authenticated;
grant select on public.pvp_ratings to authenticated;

comment on table public.leaderboard is
  'Public top-100 profile. RLS permits players to write only their own user_id row; client-reported stats are not anti-cheat verified.';
comment on table public.pvp_ghosts is
  'Authenticated-only, seven-day build snapshots for asynchronous PvP matchmaking. Only safe build stats are exposed.';
comment on table public.pvp_ratings is
  'Server-owned PvP rating ledger. No browser write access; update only after trusted battle-result validation.';
