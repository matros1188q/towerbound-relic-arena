-- Allow each authenticated player to read only their own private rolling save history.
drop policy if exists "Players can read their own save history" on public.player_save_history;
create policy "Players can read their own save history"
  on public.player_save_history for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.player_save_history to authenticated;
