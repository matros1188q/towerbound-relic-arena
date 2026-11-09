# Towerbound: Relic Arena

Mobile-first fantasy RPG / roguelite. The active seven-class implementation is published from `main` through GitHub Pages.

## Active RPG build

- 7 playable classes: Assassin, Bishop, Dragonkin, Destroyer, Elemental, Duelist and Shaman.
- 21 specializations and 420 active skill definitions (20 skills per specialization).
- 250-stage tower map, solo boss stage every 10 levels, and 3/5/7 enemy gauntlets in the configured ranges.
- Character levels, talent trees, skill selection, equipment, item level 120, sockets, stones, refinement, enchantment and heroic mode.
- Easy / Normal / Hardcore difficulty rules, potion belt, checkpoints, weighted death item loss and account progression.
- Daily quests and boss, seasonal modifiers, account PvP points, local ghost matchmaking, shared browser stash, achievements, lore, tutorial and paragon.
- Balance is data-driven in `configs/balance/`; specializations and active skills are in `configs/skills/catalog.json`.

## Run the active build

Open the published game at https://matros1188q.github.io/towerbound-relic-arena/ or open `index.html` from `main` in a modern browser. The project uses browser JavaScript and localStorage; no build step is required.

GitHub Pages is intended to publish from `main` / repository root. The seven-class implementation was merged from `feature/combat-and-presentation-pass` in PR #2 (merge commit `cc863ce94970af7d389456c1a7da8cdc941cfce8`).

## Save data and online-service limits

Before cloud setup, character data, account progression, PvP ghosts/points and the shared stash were stored in the current browser's localStorage. Local browser saves remain enabled as an offline/compatibility cache. A production cross-account leaderboard, authenticated matchmaking, anti-cheat and protected account economy require server-validated backend operations.

Diamond package prices are displayed in the prototype; real-money payments are not connected and browser code does not grant purchased currency.

## Online accounts and cloud saves

### Phase 1 — Supabase connection

**Status: frontend project credentials configured in `main`; backend activation still requires Supabase dashboard setup.**

- The browser client is loaded by `index.html` using Supabase JS v2.
- `supabase-config.js` contains the Supabase project URL and the public `sb_publishable` key. These are browser-side public credentials; never put a Supabase `service_role` / secret key in frontend code or commit it to Git.
- `towerbound-cloud.js` implements email/password registration and sign-in, optional Google OAuth, session handling, local-save discovery/migration, cloud restore/sync, and revision conflict protection.
- `supabase/migrations/202611090001_cloud_saves.sql` creates the per-user save table, Row Level Security policies and the version-aware `save_player_game` RPC.
- `TOWERBOUND_CLOUD_SETUP.md` contains the Supabase setup checklist.

**Still required in the Supabase dashboard before cloud saves can be considered live:**

1. Run `supabase/migrations/202611090001_cloud_saves.sql` in the SQL Editor for this Supabase project.
2. Enable Email auth and configure the site URL / redirect URLs for the published GitHub Pages origin.
3. If Google sign-in is wanted, configure Google OAuth credentials and the Supabase callback URL.
4. Test sign-up, sign-in, sign-out, first-time local-to-cloud migration, restore on a second browser/device, and concurrent-save conflict handling.

LocalStorage is deliberately not deleted during migration. The first migration keeps local data and requires an explicit choice when local and cloud copies conflict. The versioned RPC is designed to prevent stale devices from silently overwriting newer saves.

This phase provides account identity and cloud persistence, not server-authoritative anti-cheat. Currency grants, item rewards, progression validation, trading, matchmaking and PvP outcomes must move to server-validated operations before public competitive play.

### Future phases

- Phase 2: server-validated player profiles, progression, inventory and economy.
- Phase 3: asynchronous online PvP with server-verified battle results and ratings.
- Phase 4: optional real-time multiplayer infrastructure if the game design needs it.

These phases are plans, not claims that the functionality is already implemented.

## Project change log

Keep this section current. Every development session that changes the project must add a dated entry describing what changed, the files/areas affected, the commit SHA, and what remains unverified or unfinished. Do not record planned work as completed.

### 2026-11-09 — Supabase project credentials connected

- Updated `supabase-config.js` on `main` with the user's Supabase project URL and public publishable key.
- Re-fetched the file from GitHub after the commit to verify both values were saved.
- Commit: `38ca1613b1a8ce5610c37787e6a256305a46f227`.
- Not yet verified: SQL migration execution, Supabase Auth provider/site URL configuration, live registration, and an end-to-end cloud save/restore. Do not describe cloud saves as operational until these tests pass.

### Earlier cloud-account implementation

- Added `towerbound-cloud.js`, Supabase JS v2 script loading in `index.html`, `supabase-config.js`, the cloud-save SQL migration, and `TOWERBOUND_CLOUD_SETUP.md`.
- Added documentation for email/password and optional Google OAuth, local-save migration, revision checks, and the limits of client-side trust.
- The initial implementation is present in repository history; use the commit history for its individual commit SHAs.

## Tests

GitHub Actions checks JavaScript syntax, seven-class expansion, all balance configs, engine rules and the Playwright Chromium browser smoke test. See `tests/`, `.github/workflows/rpg-rework-v2.yml` and `docs/BALANCE-CONTENT-AUDIT.md`.

## Historical baseline

- Preserved rollback point: `backup/balance-pass-before-20261103`.
- The pre-publication baseline is preserved by `backup/balance-pass-before-20261103` and the legacy rollback branches/tags.
- The source feature branch is retained; it is now one merge commit behind `main`.
- Older branches and PR #1 are retained as history; PR #2 is the publication merge.
