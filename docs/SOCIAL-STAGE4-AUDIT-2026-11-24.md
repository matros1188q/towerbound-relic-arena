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
- The gift screen previously removed a healing potion while only writing a local journal entry. It now clearly states that cross-account delivery is not implemented and does not consume inventory.
- The friend section now explains that it currently offers link duels, not a persistent friend list or private messaging.
- The fabricated top-player replay was removed; the UI now states that server replay recording is not available.

## Security review

- RLS is enabled for guild tables; table reads are limited to active guild membership except the open-guild directory.
- Authenticated `SECURITY DEFINER` RPC warnings are expected for the server-owned guild operations. Browser execute access is limited to the user-facing RPCs; internal credit/award/settlement helpers are not executable by authenticated users.
- Supabase also reports leaked-password protection disabled. This is an Auth project setting and was not changed as part of this code patch.
- The guild schema is present in the live project migration history (guild migrations dated 2026-11-23); the original guild migration SQL files are not currently mirrored in this repository's `supabase/migrations` folder.

## Regression coverage

- `tests/social-endgame.test.cjs` now rejects synthetic ranking entries and unsafe local-only gift consumption.
- `tests/guild-social.test.cjs` checks the UI/RPC contract, contribution limits, per-guild rankings and cloud/panel integration.
