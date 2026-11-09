# Towerbound: Relic Arena

Mobile-first fantasy RPG / roguelite. The active seven-class implementation is now merged into `main` and published through GitHub Pages.

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

Character data, account progression, PvP ghosts/points and the shared stash are stored in the current browser's localStorage. They persist through refreshes in that browser, but do not sync across devices or create a secure global multiplayer service. Weekly rating and ghost matchmaking are local to the browser profile. A production cross-account leaderboard, authenticated matchmaking, anti-cheat and protected account economy require a server backend.

Diamond package prices are displayed in the prototype; real-money payments are not connected and browser code does not grant purchased currency.

## Cloud accounts (phase 1)

The Supabase account and cloud-save client is wired into the page, with email/password and optional Google sign-in. Cloud sync is intentionally inactive until a dedicated Supabase project is configured. Follow [TOWERBOUND_CLOUD_SETUP.md](./TOWERBOUND_CLOUD_SETUP.md), fill `supabase-config.js` with the project's URL and publishable key, and run `supabase/migrations/202611090001_cloud_saves.sql` in the Supabase SQL Editor.

LocalStorage remains as a compatibility/offline cache; the cloud snapshot syncs the active RPG engine and legacy profile save keys. First-time migration keeps local data and asks before resolving conflicting local/cloud copies. The versioned RPC prevents stale devices from silently overwriting newer saves.

This phase provides account ownership and cross-device persistence, not server-authoritative anti-cheat. Currency grants, item rewards, progression validation, trading and PvP outcomes must move to server-validated operations before public competitive play.

## Tests

GitHub Actions checks JavaScript syntax, seven-class expansion, all balance configs, engine rules and the Playwright Chromium browser smoke test. See `tests/`, `.github/workflows/rpg-rework-v2.yml` and `docs/BALANCE-CONTENT-AUDIT.md`.

## Historical baseline

- Preserved rollback point: `backup/balance-pass-before-20261103`.
- The pre-publication baseline is preserved by `backup/balance-pass-before-20261103` and the legacy rollback branches/tags.
- The source feature branch is retained; it is now one merge commit behind `main`.
- Older branches and PR #1 are retained as history; PR #2 is the publication merge.
