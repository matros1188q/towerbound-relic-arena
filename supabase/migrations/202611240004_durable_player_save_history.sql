-- Towerbound: durable version history and empty-save protection.
create table if not exists public.player_save_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null check (revision > 0),
  save_data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, revision),
  constraint player_save_history_payload_size check (octet_length(save_data::text) <= 500000)
);
create index if not exists player_save_history_updated_idx on public.player_save_history (user_id, updated_at desc);
alter table public.player_save_history enable row level security;
revoke all on public.player_save_history from public, anon, authenticated;
create or replace function public.save_player_game(p_save_data jsonb,p_expected_revision bigint)
returns table(revision bigint,updated_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare
 v_user_id uuid:=auth.uid(); v_revision bigint; v_updated_at timestamptz; v_previous_save jsonb;
 v_previous_game jsonb; v_next_game jsonb; v_previous_characters integer:=0; v_next_characters integer:=0;
begin
 if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 if p_save_data is null or jsonb_typeof(p_save_data)<>'object' then raise exception 'INVALID_SAVE_PAYLOAD' using errcode='22023'; end if;
 if octet_length(p_save_data::text)>500000 then raise exception 'SAVE_TOO_LARGE' using errcode='22001'; end if;
 if p_expected_revision is null or p_expected_revision<0 then raise exception 'INVALID_SAVE_REVISION' using errcode='22023'; end if;
 begin v_next_game:=nullif(p_save_data #>> '{keys,tb-rpg-v2}','')::jsonb;
 exception when others then raise exception 'INVALID_SAVE_PAYLOAD' using errcode='22023'; end;
 if jsonb_typeof(v_next_game->'characters')='array' then v_next_characters:=jsonb_array_length(v_next_game->'characters'); end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));
 select ps.revision,ps.save_data into v_revision,v_previous_save from public.player_saves ps where ps.user_id=v_user_id for update;
 if not found then
  if p_expected_revision<>0 then raise exception 'SAVE_CONFLICT' using errcode='40001'; end if;
  insert into public.player_saves(user_id,save_data,revision,updated_at) values(v_user_id,p_save_data,1,now())
   returning player_saves.revision,player_saves.updated_at into v_revision,v_updated_at;
 else
  if v_revision<>p_expected_revision then raise exception 'SAVE_CONFLICT' using errcode='40001'; end if;
  begin v_previous_game:=nullif(v_previous_save #>> '{keys,tb-rpg-v2}','')::jsonb;
  exception when others then v_previous_game:=null; end;
  if jsonb_typeof(v_previous_game->'characters')='array' then v_previous_characters:=jsonb_array_length(v_previous_game->'characters'); end if;
  if v_previous_characters>0 and v_next_characters=0 then raise exception 'EMPTY_SAVE_GUARD' using errcode='22023'; end if;
  insert into public.player_save_history(user_id,revision,save_data,updated_at) values(v_user_id,v_revision,v_previous_save,now())
   on conflict(user_id,revision) do nothing;
  update public.player_saves set save_data=p_save_data,revision=player_saves.revision+1,updated_at=now()
   where user_id=v_user_id returning player_saves.revision,player_saves.updated_at into v_revision,v_updated_at;
 end if;
 if v_revision is null then raise exception 'SAVE_CONFLICT' using errcode='40001'; end if;
 insert into public.player_save_history(user_id,revision,save_data,updated_at) values(v_user_id,v_revision,p_save_data,coalesce(v_updated_at,now()))
  on conflict(user_id,revision) do nothing;
 delete from public.player_save_history h where h.user_id=v_user_id and h.revision not in
  (select keep.revision from public.player_save_history keep where keep.user_id=v_user_id order by keep.revision desc limit 25);
 return query select v_revision,v_updated_at;
end; $$;
revoke all on function public.save_player_game(jsonb,bigint) from public,anon;
grant execute on function public.save_player_game(jsonb,bigint) to authenticated;
comment on table public.player_save_history is 'Private rolling history of the latest 25 Towerbound cloud-save revisions per player.';
