-- Towerbound online services: tighten function exposure and optimize RLS predicates.
-- The event-trigger helper is infrastructure-only and must not be callable through PostgREST.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

drop policy if exists "Players can read their own save" on public.player_saves;
create policy "Players can read their own save"
  on public.player_saves for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Players can insert their own leaderboard row" on public.leaderboard;
create policy "Players can insert their own leaderboard row"
  on public.leaderboard for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their own leaderboard row" on public.leaderboard;
create policy "Players can update their own leaderboard row"
  on public.leaderboard for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can publish their own ghost" on public.pvp_ghosts;
create policy "Players can publish their own ghost"
  on public.pvp_ghosts for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their own ghost" on public.pvp_ghosts;
create policy "Players can update their own ghost"
  on public.pvp_ghosts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
