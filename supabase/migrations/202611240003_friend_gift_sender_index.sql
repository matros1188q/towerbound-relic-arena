create index if not exists tb_friend_gifts_sender_created_idx
  on public.tb_friend_gifts(sender_id, created_at desc);