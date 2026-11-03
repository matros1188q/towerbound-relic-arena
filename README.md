# Towerbound: Relic Arena

Mobile-first fantasy RPG / roguelite prototype. The active seven-class implementation is maintained on the separate branch `feature/balance-and-content-pass`; the repository's `main` branch is intentionally preserved as an older four-class baseline.

## Active RPG build

- 7 playable classes: Assassin, Bishop, Dragonkin, Destroyer, Elemental, Duelist and Shaman.
- 21 specializations and 420 active skill definitions (20 skills per specialization).
- 250-stage tower map, solo boss stage every 10 levels, and 3/5/7 enemy gauntlets in the configured ranges.
- Character levels, talent trees, skill selection, equipment, item level 120, sockets, stones, refinement, enchantment and heroic mode.
- Easy / Normal / Hardcore difficulty rules, potion belt, checkpoints, weighted death item loss and account progression.
- Daily quests and boss, seasonal modifiers, account PvP points, local ghost matchmaking, shared browser stash, achievements, lore, tutorial and paragon.
- Balance is data-driven in `configs/balance/`; specializations and active skills are in `configs/skills/catalog.json`.

## Run the active build

Open `index.html` in a modern browser after checking out `feature/balance-and-content-pass`. The project uses browser JavaScript and localStorage; no build step is required.

To publish this specific build with GitHub Pages, select **Settings → Pages → Deploy from a branch**, choose `feature/balance-and-content-pass`, and select the repository root folder. Publishing `main` will continue to serve the preserved older baseline until the branch is deliberately merged or Pages is configured to use the feature branch.

## Save data and online-service limits

Character data, account progression, PvP ghosts/points and the shared stash are stored in the current browser's localStorage. They persist through refreshes in that browser, but do not sync across devices or create a secure global multiplayer service. Weekly rating and ghost matchmaking are local to the browser profile. A production cross-account leaderboard, authenticated matchmaking, anti-cheat and protected account economy require a server backend.

Diamond package prices are displayed in the prototype; real-money payments are not connected and browser code does not grant purchased currency.

## Tests

GitHub Actions checks JavaScript syntax, seven-class expansion, all balance configs, engine rules and the Playwright Chromium browser smoke test. See `tests/`, `.github/workflows/rpg-rework-v2.yml` and `docs/BALANCE-CONTENT-AUDIT.md`.

## Historical baseline

- Preserved rollback point: `backup/balance-pass-before-20261103`.
- `main` is not modified by the balance/content pass.
- Existing older branches and draft PRs are retained; they are not silently moved or merged.
