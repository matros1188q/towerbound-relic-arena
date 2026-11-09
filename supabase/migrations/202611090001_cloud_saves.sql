-- Towerbound: Relic Arena — account-bound cloud saves
-- Apply this migration in the dedicated Towerbound Supabase project's SQL Editor.
-- No service-role key is ever exposed to the browser.

create table if not exists public.player_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint player_saves_payload_size check (octet_length(save_data::text) <= 500000)
);

alter table public.player_saves enable row level security;

drop policy if exists "Players can read their own save" on public.player_saves;
create policy "Players can read their own save"
  on public.player_saves for select
  to authenticated
  using (auth.uid() = user_id);

-- Browser clients cannot insert, update or delete save rows directly.
revoke insert, update, delete on public.player_saves from anon, authenticated;
grant select on public.player_saves to authenticated;

create or replace function public.save_player_game(
  p_save_data jsonb,
  p_expected_revision bigint
)
returns table(revision bigint, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_revision bigint;
  v_updated_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;
  if p_save_data is null or jsonb_typeof(p_save_data) <> 'object' then
    raise exception 'INVALID_SAVE_PAYLOAD' using errcode = '22023';
  end if;
  if octet_length(p_save_data::text) > 500000 then
    raise exception 'SAVE_TOO_LARGE' using errcode = '22001';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'INVALID_SAVE_REVISION' using errcode = '22023';
  end if;

  insert into public.player_saves as current_save (user_id, save_data, revision, updated_at)
  select v_user_id, p_save_data, 1, now()
  where p_expected_revision = 0
  on conflict (user_id) do update
    set save_data = excluded.save_data,
        revision = current_save.revision + 1,
        updated_at = now()
    where current_save.revision = p_expected_revision
  returning current_save.revision, current_save.updated_at
    into v_revision, v_updated_at;

  if v_revision is null then
    raise exception 'SAVE_CONFLICT' using errcode = '40001';
  end if;

  return query select v_revision, v_updated_at;
end;
$$;

revoke all on function public.save_player_game(jsonb, bigint) from public, anon;
grant execute on function public.save_player_game(jsonb, bigint) to authenticated;

comment on table public.player_saves is
  'One versioned cloud save per authenticated Towerbound player. Writes must use save_player_game().';
