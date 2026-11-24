create or replace function public.tb_friend_respond(p_request_id uuid,p_accept boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid:=auth.uid(); v_sender uuid; v_receiver uuid;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
 select sender_id,receiver_id into v_sender,v_receiver
 from public.tb_friend_requests
 where id=p_request_id and receiver_id=v_uid
 for update;
 if not found then raise exception 'REQUEST_NOT_FOUND' using errcode='P0002'; end if;
 if p_accept then
  insert into public.tb_friendships(user_low,user_high)
   values(least(v_sender,v_receiver),greatest(v_sender,v_receiver))
   on conflict do nothing;
  -- If both players sent requests at almost the same time, accepting one
  -- also consumes the reciprocal request so no stale pending row remains.
  delete from public.tb_friend_requests
   where (sender_id=v_sender and receiver_id=v_receiver)
      or (sender_id=v_receiver and receiver_id=v_sender);
 else
  delete from public.tb_friend_requests where id=p_request_id;
 end if;
 return jsonb_build_object('status',case when p_accept then 'accepted' else 'declined' end);
end;
$$;
revoke all on function public.tb_friend_respond(uuid,boolean) from public,anon;
grant execute on function public.tb_friend_respond(uuid,boolean) to authenticated;
