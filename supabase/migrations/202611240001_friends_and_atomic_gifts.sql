-- TowerBound stage 4: persistent friends and atomic item gifts.
create table if not exists public.tb_friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint tb_friend_requests_not_self check (sender_id <> receiver_id),
  constraint tb_friend_requests_unique_pair unique(sender_id, receiver_id)
);
create index if not exists tb_friend_requests_receiver_created_idx on public.tb_friend_requests(receiver_id, created_at desc);
create index if not exists tb_friend_requests_sender_created_idx on public.tb_friend_requests(sender_id, created_at desc);
create table if not exists public.tb_friendships (
  user_low uuid not null references auth.users(id) on delete cascade,
  user_high uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_low, user_high),
  constraint tb_friendships_ordered_pair check (user_low < user_high)
);
create index if not exists tb_friendships_high_idx on public.tb_friendships(user_high);
create table if not exists public.tb_friend_gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_name text not null,
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  constraint tb_friend_gifts_not_self check (sender_id <> receiver_id)
);
create index if not exists tb_friend_gifts_receiver_created_idx on public.tb_friend_gifts(receiver_id, created_at desc);
alter table public.tb_friend_requests enable row level security;
alter table public.tb_friendships enable row level security;
alter table public.tb_friend_gifts enable row level security;
drop policy if exists "Players read their friend requests" on public.tb_friend_requests;
create policy "Players read their friend requests" on public.tb_friend_requests for select to authenticated using ((select auth.uid()) = sender_id or (select auth.uid()) = receiver_id);
drop policy if exists "Players read their friendships" on public.tb_friendships;
create policy "Players read their friendships" on public.tb_friendships for select to authenticated using ((select auth.uid()) = user_low or (select auth.uid()) = user_high);
drop policy if exists "Players read their gift history" on public.tb_friend_gifts;
create policy "Players read their gift history" on public.tb_friend_gifts for select to authenticated using ((select auth.uid()) = sender_id or (select auth.uid()) = receiver_id);
revoke insert, update, delete on public.tb_friend_requests from anon, authenticated;
revoke insert, update, delete on public.tb_friendships from anon, authenticated;
revoke insert, update, delete on public.tb_friend_gifts from anon, authenticated;
grant select on public.tb_friend_requests, public.tb_friendships, public.tb_friend_gifts to authenticated;

create or replace function public.tb_friend_search(p_query text) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid := auth.uid(); v_q text := left(trim(coalesce(p_query,'')),32);
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 if length(v_q)<2 then raise exception 'SEARCH_TOO_SHORT' using errcode='22023'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('user_id',l.user_id,'nickname',l.nickname,'class',l.class,'battle_power',l.battle_power,'max_stage',l.max_stage) order by l.battle_power desc,l.max_stage desc)
 from (select user_id,nickname,class,battle_power,max_stage from public.leaderboard where user_id<>v_uid and nickname ilike '%'||replace(replace(replace(v_q,'\','\\'),'%','\%'),'_','\_')||'%' order by battle_power desc,max_stage desc limit 20) l),'[]'::jsonb);
end; $$;

create or replace function public.tb_friend_request(p_target_user uuid) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid:=auth.uid(); v_low uuid; v_high uuid; v_reverse uuid;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 if p_target_user is null or p_target_user=v_uid then raise exception 'INVALID_TARGET' using errcode='22023'; end if;
 if not exists(select 1 from public.leaderboard where user_id=p_target_user) then raise exception 'PLAYER_NOT_FOUND' using errcode='P0002'; end if;
 v_low:=least(v_uid,p_target_user); v_high:=greatest(v_uid,p_target_user);
 if exists(select 1 from public.tb_friendships where user_low=v_low and user_high=v_high) then return jsonb_build_object('status','already_friends'); end if;
 select id into v_reverse from public.tb_friend_requests where sender_id=p_target_user and receiver_id=v_uid for update;
 if v_reverse is not null then
  insert into public.tb_friendships(user_low,user_high) values(v_low,v_high) on conflict do nothing;
  delete from public.tb_friend_requests where id=v_reverse;
  delete from public.tb_friend_requests where sender_id=v_uid and receiver_id=p_target_user;
  return jsonb_build_object('status','accepted');
 end if;
 insert into public.tb_friend_requests(sender_id,receiver_id) values(v_uid,p_target_user) on conflict(sender_id,receiver_id) do nothing;
 return jsonb_build_object('status','sent');
end; $$;

create or replace function public.tb_friend_respond(p_request_id uuid,p_accept boolean) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid:=auth.uid(); v_sender uuid; v_receiver uuid;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 select sender_id,receiver_id into v_sender,v_receiver from public.tb_friend_requests where id=p_request_id and receiver_id=v_uid for update;
 if not found then raise exception 'REQUEST_NOT_FOUND' using errcode='P0002'; end if;
 if p_accept then insert into public.tb_friendships(user_low,user_high) values(least(v_sender,v_receiver),greatest(v_sender,v_receiver)) on conflict do nothing; end if;
 delete from public.tb_friend_requests where id=p_request_id;
 return jsonb_build_object('status',case when p_accept then 'accepted' else 'declined' end);
end; $$;

create or replace function public.tb_friend_cancel(p_request_id uuid) returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid:=auth.uid(); v_count integer;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 delete from public.tb_friend_requests where id=p_request_id and sender_id=v_uid;
 get diagnostics v_count=row_count; return v_count>0;
end; $$;

create or replace function public.tb_friend_remove(p_friend_id uuid) returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid:=auth.uid(); v_count integer;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 if p_friend_id is null or p_friend_id=v_uid then raise exception 'INVALID_TARGET' using errcode='22023'; end if;
 delete from public.tb_friendships where user_low=least(v_uid,p_friend_id) and user_high=greatest(v_uid,p_friend_id);
 get diagnostics v_count=row_count; return v_count>0;
end; $$;

create or replace function public.tb_friend_list() returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid:=auth.uid();
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('user_id',p.user_id,'nickname',coalesce(l.nickname,'Игрок'),'class',coalesce(l.class,'—'),'battle_power',coalesce(l.battle_power,0),'max_stage',coalesce(l.max_stage,0),'since',p.created_at) order by coalesce(l.battle_power,0) desc,coalesce(l.max_stage,0) desc)
 from (select case when user_low=v_uid then user_high else user_low end user_id,created_at from public.tb_friendships where user_low=v_uid or user_high=v_uid) p left join public.leaderboard l on l.user_id=p.user_id),'[]'::jsonb);
end; $$;

create or replace function public.tb_friend_requests_list() returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid:=auth.uid(); v_in jsonb; v_out jsonb;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'user_id',r.sender_id,'nickname',coalesce(l.nickname,'Игрок'),'class',coalesce(l.class,'—'),'battle_power',coalesce(l.battle_power,0),'created_at',r.created_at) order by r.created_at desc),'[]'::jsonb) into v_in from public.tb_friend_requests r left join public.leaderboard l on l.user_id=r.sender_id where r.receiver_id=v_uid;
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'user_id',r.receiver_id,'nickname',coalesce(l.nickname,'Игрок'),'class',coalesce(l.class,'—'),'battle_power',coalesce(l.battle_power,0),'created_at',r.created_at) order by r.created_at desc),'[]'::jsonb) into v_out from public.tb_friend_requests r left join public.leaderboard l on l.user_id=r.receiver_id where r.sender_id=v_uid;
 return jsonb_build_object('incoming',v_in,'outgoing',v_out);
end; $$;

create or replace function public.tb_friend_gift_inbox() returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid:=auth.uid();
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'sender_id',g.sender_id,'sender_name',coalesce(l.nickname,'Игрок'),'item_type',g.item_type,'item_name',g.item_name,'quantity',g.quantity,'created_at',g.created_at) order by g.created_at desc) from public.tb_friend_gifts g left join public.leaderboard l on l.user_id=g.sender_id where g.receiver_id=v_uid),'[]'::jsonb);
end; $$;

create or replace function public.tb_friend_send_gift(p_friend_id uuid,p_item_id text,p_quantity integer default 1) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
 v_uid uuid:=auth.uid(); v_sender_save jsonb; v_receiver_save jsonb; v_sender_game jsonb; v_receiver_game jsonb;
 v_sender_idx integer; v_receiver_idx integer; v_sender_char jsonb; v_receiver_char jsonb; v_item jsonb; v_new_item jsonb; v_sender_bag jsonb;
 v_available integer; v_type text; v_name text; v_sender_revision bigint; v_receiver_revision bigint; v_gift_id uuid;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 if p_friend_id is null or p_friend_id=v_uid then raise exception 'INVALID_TARGET' using errcode='22023'; end if;
 if p_quantity is null or p_quantity<1 or p_quantity>99 then raise exception 'INVALID_QUANTITY' using errcode='22023'; end if;
 if not exists(select 1 from public.tb_friendships where user_low=least(v_uid,p_friend_id) and user_high=greatest(v_uid,p_friend_id)) then raise exception 'NOT_FRIENDS' using errcode='42501'; end if;
 perform 1 from public.player_saves where user_id in (v_uid,p_friend_id) order by user_id for update;
 select save_data,revision into v_sender_save,v_sender_revision from public.player_saves where user_id=v_uid;
 select save_data,revision into v_receiver_save,v_receiver_revision from public.player_saves where user_id=p_friend_id;
 if v_sender_save is null then raise exception 'SENDER_SAVE_NOT_FOUND' using errcode='P0002'; end if;
 if v_receiver_save is null then raise exception 'RECEIVER_SAVE_NOT_FOUND' using errcode='P0002'; end if;
 v_sender_game:=(v_sender_save->'keys'->>'tb-rpg-v2')::jsonb; v_receiver_game:=(v_receiver_save->'keys'->>'tb-rpg-v2')::jsonb;
 if jsonb_typeof(v_sender_game->'characters')<>'array' or jsonb_typeof(v_receiver_game->'characters')<>'array' then raise exception 'CHARACTER_SAVE_INVALID' using errcode='22023'; end if;
 select (ordinality-1)::integer into v_sender_idx from jsonb_array_elements(v_sender_game->'characters') with ordinality c(value,ordinality) where c.value->>'id'=v_sender_game->>'activeCharacterId' limit 1;
 if v_sender_idx is null then v_sender_idx:=0; end if;
 select (ordinality-1)::integer into v_receiver_idx from jsonb_array_elements(v_receiver_game->'characters') with ordinality c(value,ordinality) where c.value->>'id'=v_receiver_game->>'activeCharacterId' limit 1;
 if v_receiver_idx is null then v_receiver_idx:=0; end if;
 v_sender_char:=v_sender_game->'characters'->v_sender_idx; v_receiver_char:=v_receiver_game->'characters'->v_receiver_idx;
 if v_sender_char is null or v_receiver_char is null then raise exception 'ACTIVE_CHARACTER_NOT_FOUND' using errcode='P0002'; end if;
 select item into v_item from jsonb_array_elements(coalesce(v_sender_char->'bag','[]'::jsonb)) item where item->>'id'=p_item_id limit 1;
 if v_item is null then raise exception 'ITEM_NOT_FOUND_IN_BAG' using errcode='P0002'; end if;
 if coalesce((v_item->>'soulbound')::boolean,false) or coalesce(v_item->>'tradeable','true')='false' or coalesce(v_item->>'type','') in ('auto_salvage','currency','silver','diamonds') then raise exception 'ITEM_NOT_TRADEABLE' using errcode='42501'; end if;
 v_available:=greatest(1,coalesce((v_item->>'quantity')::integer,1));
 if p_quantity>v_available then raise exception 'NOT_ENOUGH_ITEMS' using errcode='22023'; end if;
 v_type:=coalesce(v_item->>'type','item'); v_name:=coalesce(v_item->>'name',v_type);
 select coalesce(jsonb_agg(case when item->>'id'=p_item_id and v_available>p_quantity then jsonb_set(item,'{quantity}',to_jsonb(v_available-p_quantity),true) else item end order by ordinality) filter(where not(item->>'id'=p_item_id and v_available<=p_quantity)),'[]'::jsonb)
 into v_sender_bag from jsonb_array_elements(coalesce(v_sender_char->'bag','[]'::jsonb)) with ordinality x(item,ordinality);
 v_sender_game:=jsonb_set(v_sender_game,array['characters',v_sender_idx::text,'bag'],v_sender_bag,true);
 v_new_item:=(v_item-'id'-'quantity')||jsonb_build_object('id','gift-'||replace(gen_random_uuid()::text,'-',''),'quantity',p_quantity);
 v_receiver_game:=jsonb_set(v_receiver_game,array['characters',v_receiver_idx::text,'bag'],coalesce(v_receiver_char->'bag','[]'::jsonb)||jsonb_build_array(v_new_item),true);
 v_sender_save:=jsonb_set(v_sender_save,'{keys,tb-rpg-v2}',to_jsonb(v_sender_game::text),true);
 v_receiver_save:=jsonb_set(v_receiver_save,'{keys,tb-rpg-v2}',to_jsonb(v_receiver_game::text),true);
 update public.player_saves set save_data=v_sender_save,revision=revision+1,updated_at=now() where user_id=v_uid returning revision into v_sender_revision;
 update public.player_saves set save_data=v_receiver_save,revision=revision+1,updated_at=now() where user_id=p_friend_id returning revision into v_receiver_revision;
 insert into public.tb_friend_gifts(sender_id,receiver_id,item_type,item_name,quantity) values(v_uid,p_friend_id,v_type,v_name,p_quantity) returning id into v_gift_id;
 return jsonb_build_object('gift_id',v_gift_id,'item_name',v_name,'quantity',p_quantity,'sender_revision',v_sender_revision,'receiver_revision',v_receiver_revision);
end; $$;

revoke all on function public.tb_friend_search(text) from public,anon;
revoke all on function public.tb_friend_request(uuid) from public,anon;
revoke all on function public.tb_friend_respond(uuid,boolean) from public,anon;
revoke all on function public.tb_friend_cancel(uuid) from public,anon;
revoke all on function public.tb_friend_remove(uuid) from public,anon;
revoke all on function public.tb_friend_list() from public,anon;
revoke all on function public.tb_friend_requests_list() from public,anon;
revoke all on function public.tb_friend_gift_inbox() from public,anon;
revoke all on function public.tb_friend_send_gift(uuid,text,integer) from public,anon;
grant execute on function public.tb_friend_search(text) to authenticated;
grant execute on function public.tb_friend_request(uuid) to authenticated;
grant execute on function public.tb_friend_respond(uuid,boolean) to authenticated;
grant execute on function public.tb_friend_cancel(uuid) to authenticated;
grant execute on function public.tb_friend_remove(uuid) to authenticated;
grant execute on function public.tb_friend_list() to authenticated;
grant execute on function public.tb_friend_requests_list() to authenticated;
grant execute on function public.tb_friend_gift_inbox() to authenticated;
grant execute on function public.tb_friend_send_gift(uuid,text,integer) to authenticated;
