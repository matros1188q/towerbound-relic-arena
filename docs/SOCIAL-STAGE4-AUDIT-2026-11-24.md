# TowerBound social stage audit — 2026-11-24

## Verified in the live Supabase project

- Cloud save allowlist contains both `tb-social-v1` and `tb-endgame-v1`; restore writes the keys and dispatches `towerbound-cloud-restore`.
- The RPG body-isolation selector explicitly excludes `#socPanel`, so the community panel remains visible while `body.rpg-open` is active.
- The live database contains guild, member, treasury, contribution, buff, message, weekly boss, raid-attempt and reward-ledger tables with RLS enabled.
- Eleven player-facing `tb_guild_*` RPCs are executable by authenticated users; internal wallet/reward helpers and weekly settlement functions are not executable by browser roles.
- Guild-specific raid ranking and payout queries are scoped by `guild_id`; weekly non-kill rewards are 50/40/30/20/10 diamonds for places 1–5.
- Silver contributions are 1,000–100,000; diamond contributions are 5–100; each currency has a five-contribution daily cap. These are checked in the server RPC, not only in the UI.
- The weekly payout cron job is active.

## Corrected social UI gaps

- The social community ranking previously generated synthetic bot entries. It now reads the real Supabase leaderboard through `TowerboundOnline.getLeaderboard()`.
- The «Друзья» section now uses persistent Supabase friend search, incoming/outgoing requests, an accepted friend list, friend removal and received-gift history.
- Gifts are transferred by an authenticated server RPC: the sender's bag item is decremented and the recipient's active character bag is updated in the same database transaction; both cloud-save revisions advance atomically.
- The fabricated top-player replay was removed; the UI now states that server replay recording is not available.

## Friends and gifts — implemented and smoke-tested

- Added `tb_friend_requests`, `tb_friendships` and `tb_friend_gifts`, all with RLS enabled and browser writes revoked.
- Added nine authenticated-only RPCs for profile search, request/send/accept/decline/cancel, friend list/removal, gift inbox and atomic gift delivery. Each privileged function checks `auth.uid()`; function execution is revoked from `anon` and `PUBLIC`.
- Gift delivery is restricted to an existing friendship, locks both `player_saves` rows in stable user-ID order, checks the sender's active-character bag and tradeability flags, updates both save payloads and increments both revisions in one transaction. Currency and equipped gear are not transferred.
- A transaction-scoped smoke test created synthetic accounts, exercised search → request → accept → friend list → gift → inbox → remove/cancel, verified both inventories and rolled back all test rows.
- The client synchronizes before sending a gift and reloads the authoritative save afterward. Cloud restore can reconcile server-only bag changes without overwriting unrelated character fields.
- Search returns accounts that have published a leaderboard profile. Both sender and receiver must have an active cloud save and an active character for item gifting.

## Security review

- RLS is enabled for guild tables; table reads are limited to active guild membership except the open-guild directory.
- Authenticated `SECURITY DEFINER` RPC warnings are expected for the server-owned guild operations. Browser execute access is limited to the user-facing RPCs; internal credit/award/settlement helpers are not executable by authenticated users.
- Supabase also reports leaked-password protection disabled. This is an Auth project setting and was not changed as part of this code patch.
- Supabase's security advisor flags authenticated-executable `SECURITY DEFINER` RPCs as warnings. These are intentional server operations; they explicitly validate `auth.uid()`, have a fixed `search_path`, and are not executable by `anon` or `PUBLIC`.
- The guild schema is present in the live project migration history (guild migrations dated 2026-11-23); the original guild migration SQL files are not currently mirrored in this repository's `supabase/migrations` folder.

## Regression coverage

- `tests/social-endgame.test.cjs` now rejects synthetic ranking entries and unsafe local-only gift consumption.
- `tests/guild-social.test.cjs` checks the UI/RPC contract, contribution limits, per-guild rankings and cloud/panel integration.
- `tests/friends-system.test.cjs` checks the friend UI, RPC contract, RLS, authenticated-only execution, atomic save revision updates and cloud gift reconciliation; CI also runs `node --check towerbound-friends.js`.

## Remaining social scope

- No private chat or realtime online-presence indicator is included in this friends pass.
- Gifts transfer items from the active character's bag only; equipped items and currencies are intentionally excluded.
