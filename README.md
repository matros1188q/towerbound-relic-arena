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


## Character artwork integration

### Status — connected in `main`

Runtime portrait URLs now use stable, semantic files under `assets/characters/` instead of loading the UUID-named staging JPEGs directly from `art-inbox/01-characters/`.

- The seven-class RPG character picker, profile avatar, map header and battle hero portrait all use the class portrait map in `rpg-rework-ui.js`.
- Enemy target cards and the focused battle enemy resolve the exact `mobId` first, then use a role fallback (healer / poison / tank / normal).
- Boss battles use the named boss art set; the older arena scene also uses named enemy and boss paths.
- Image containers enforce `object-fit: contain` so character proportions are preserved.
- The art test checks all 33 staging JPEGs, verifies that none exceeds 1 MB, validates manifest source files and named asset files, and checks class/mob/boss routing.
- Source images: 33 JPG files; largest is `16f4bbb7-a8ac-4cb3-8d93-a9647458bf3f.jpg` at 173,539 bytes (about 170 KB). No image in this folder exceeds 1 MB.

### Class / hero mapping

| Class | Runtime art | Source file in `art-inbox/01-characters/` |
|---|---|---|
| Убийца | `heroes/reaper.png` | `acea49d3-fa54-45a9-957a-ac057304b6ab.jpg` |
| Епископ | `heroes/arcanist.png` | `16f4bbb7-a8ac-4cb3-8d93-a9647458bf3f.jpg` |
| Драконит | `enemies/crimson-executioner.png` (best-fit placeholder art, not a dragon) | `b0b7437e-c2ee-4a59-b644-ffce88f1d442.jpg` |
| Разрушитель | `heroes/warden.png` | `7f5c7457-3498-464f-91df-d83335183855.jpg` |
| Владыка стихий | `bosses/ice-abbot.png` (best-fit mage art) | `f1f5e3d0-6b1d-4576-b9b7-52f885bf08fc.jpg` |
| Дуэлянт | `enemies/phantom-duelist.png` | `a41493b8-0505-40f2-8351-fb8f1b484c8c.jpg` |
| Шаман | `bosses/ash-patriarch.png` (best-fit staff caster art) | `c05adc5c-64e2-476a-8a4d-e92eb774c5d8.jpg` |

There are only four dedicated hero assets in the current hero manifest: Warden, Arcanist, Ranger and Reaper. The seven-class RPG therefore still needs dedicated class artwork for **Dragonkin, Elemental Lord, Duelist and Shaman**. Current portraits for those classes are deliberate best-fit existing art, not newly created class-specific images. Ranger art is retained for the older four-hero selector.

### Mob / enemy mapping

| Mob | Runtime art | Source file |
|---|---|---|
| Теневой гоблин | `enemies/shadow-goblin.png` | `aa933809-05b4-4b67-9f5f-442ffd207371.jpg` |
| Проклятый рыцарь | `enemies/cursed-knight.png` | `5c8f39fb-19c6-44e4-946c-4ee584214238.jpg` |
| Пепельный волк | `enemies/ash-wolf.png` | `81c5d782-ceb2-4e17-813a-b4c684f70f75.jpg` |
| Рунный голем | `enemies/rune-golem.png` | `289412ff-344a-402b-b141-3e739f1d1c1c.jpg` |
| Могильный лучник | `enemies/grave-archer.png` | `1a06e424-a782-44b7-a0a0-a9f64325ffcb.jpg` |
| Чумная ведьма | `enemies/plague-witch.png` | `52cbe629-d020-4077-8a86-2469a3cda66d.jpg` |
| Пепельный бес | `enemies/ash-imp.png` | `50bbefaa-97e5-4c6d-8a73-daa03e553525.jpg` |
| Болотный жнец | `enemies/swamp-reaper.png` | `ba3335bd-e111-4f86-90e6-4f2085cae804.jpg` |
| Костяной страж | `enemies/bone-warden.png` | `00cba976-f8e1-4691-af34-7e38bc3e085e.jpg` |
| Багровый палач | `enemies/crimson-executioner.png` | `b0b7437e-c2ee-4a59-b644-ffce88f1d442.jpg` |
| Пустотный охотник | `enemies/void-hunter.png` | `92a10c4d-48e4-4a3c-92e5-bb7bae921f8d.jpg` |
| Паучья матрона | `enemies/spider-matron.png` | `f3f1e987-472d-41ab-aa6c-f6e11d8068ba.jpg` |
| Слепой монах | `enemies/blind-monk.png` | `c05adc5c-64e2-476a-8a4d-e92eb774c5d8.jpg` |
| Каменный минотавр | `enemies/stone-minotaur.png` | `678287f6-5d47-407d-a281-65b1e7eb2463.jpg` |
| Призрачный дуэлянт | `enemies/phantom-duelist.png` | `a41493b8-0505-40f2-8351-fb8f1b484c8c.jpg` |
| Собиратель душ | `enemies/soul-harvester.png` | `00478c4a-e6ee-420d-a3f8-dd8c03c4698e.jpg` |
| Лесной ужас | `enemies/forest-horror.png` | `477537a8-9c39-497b-b809-8fb63968d5a9.jpg` |
| Рыцарь бездны | `enemies/abyss-knight.png` | `bd0e9796-5649-4bad-a565-4067b2c602d3.jpg` |
| Проклятый алхимик | `enemies/cursed-alchemist.png` | `d6021025-d9b9-44da-a245-2c50822ebedc.jpg` |
| Корневой исполин | `enemies/root-colossus.png` | `64cdadd1-93eb-4490-9df8-e7acf5077cde.jpg` |

Role fallback portraits are: healer → Blind Monk, poison → Plague Witch, tank → Rune Golem, normal → Shadow Goblin. A concrete `mobId` mapping takes precedence over role fallback.

### Boss mapping

| Boss | Runtime art | Source file |
|---|---|---|
| Костяной колосс | `bosses/bone-colossus.png` | `fb8c7bd7-f7bc-40c5-928c-ac7e9b95ebbd.jpg` |
| Королева Бездны | `bosses/abyss-queen.png` | `d9e748b9-ee01-4b29-b3f8-eb9c4ecdf503.jpg` |
| Пепельный патриарх | `bosses/ash-patriarch.png` | `c05adc5c-64e2-476a-8a4d-e92eb774c5d8.jpg` |
| Ледяной аббат | `bosses/ice-abbot.png` | `f1f5e3d0-6b1d-4576-b9b7-52f885bf08fc.jpg` |
| Зеркальный палач | `bosses/mirror-executioner.png` | `f50e3768-351d-4b8a-9939-ca398bdd65d7.jpg` |
| Пожиратель душ | `bosses/soul-devourer.png` | `d6021025-d9b9-44da-a245-2c50822ebedc.jpg` |
| Корневой титан | `bosses/root-titan.png` | `beb6557c-f2db-4426-b741-d0faa9c2d80f.jpg` |
| Пустотный охотник-босс | `bosses/void-hunter-boss.png` | `f3f1e987-472d-41ab-aa6c-f6e11d8068ba.jpg` |
| Сердце Башни | `bosses/heart-of-tower.png` | `ead1c2a5-2854-4a9c-83b7-d8964fd737cb.jpg` |

The legacy ten-boss arena has no dedicated art for **Багровый регент**; it currently uses `enemies/crimson-executioner.png` as the closest available approximation. A unique Crimson Regent boss illustration is still needed.

### Unclassified art inbox files

These three JPGs are present in the folder but are not part of the current hero/enemy/boss manifests. They are intentionally not assigned to a character until their visual identity is confirmed:

- `1ce15225-7162-4858-8fa7-41363266e71e.jpg`
- `70524780-ece1-4aa2-ad6b-1e1035c9a136.jpg`
- `be7caee1-03c5-49ca-989c-bbab2c3d2063.jpg`

### 2026-11-09 — Character art integration commits

- `cc063614c1906b4ed5aa381e3e61ba2e53f7c6d4`: replaced role/stage-random art selection in the active RPG with semantic class, mobId and boss mappings; added containment rules for profile and battle portraits.
- `e1dffd4dd72be0ee56edae8bc29af4ca1d22a2b1`: updated the legacy hero picker, mob roster and boss roster to use named `assets/characters/` paths; expanded `tests/character-art.test.cjs` to validate the inventory, manifests, image size limits, mappings and aspect-fit rules.
- The active RPG battle focus panel and target cards now show the mapped mob/boss art; the older arena's boss scene uses the mapped boss roster.
- Not yet visually verified on a live iPhone session: final crop/position per art and the exact appearance of every encounter. GitHub Actions browser/syntax checks are running for the latest commit.
- Remaining art work: four dedicated class illustrations (Dragonkin, Elemental Lord, Duelist, Shaman), one dedicated Crimson Regent boss illustration, and classification of the three extra inbox images above.


### Online implementation commit log

- `bd7534f340ad05b6d3ae59c6db46db0246e1754f` — SQL tables, Supabase online module, Top-100 UI, real ghost lookup and test coverage.
- `5ae1914a927ade8ce9b0b511d16a909dba11e70d` — public leaderboard reads without requiring login and stable publish debounce.
- `13fabb60e90f470bf4166c36e0b207c09b54d3c6` — ghost battle estimate uses fetched opponent stats.
- `379d33a3255e4f6c72a91e4a3ba5e5efcc146359` — README status, migration notes and CI checks.
- `4eb58ca69d41841bf739f23121f07e3405855b07` — global rating tab in map navigation.
- `e83c6786b81c6a6dd62bd40da2f5dea054f37f46` — README follow-up documenting navigation.
- `fe9bb7d46fd50f5b80e5c3fb4fd2e5ce5db6659b` — smoke test updated to reject fake bot fallback.
- `a8ed524d3c26db14e560231c7b8be1ec7e674d5d` — smoke assertion reads the transient sign-in toast.
- `f2569b7e43bc922787f9fe0479ea319225613098` — smoke test returns from the leaderboard view to the systems view before resuming the legacy progression checks.
- Follow-up smoke fix: return from the leaderboard screen to the systems screen before continuing the existing progression test; this preserves the test's original navigation assumptions.

## Global online leaderboard and asynchronous PvP

### Phase 1 online profile / matchmaking — implemented in frontend and SQL

Files:
- `supabase/migrations/202611090002_online_leaderboard_ghosts.sql`
- `towerbound-online.js`
- `towerbound-cloud.js` (exposes the already initialized browser Supabase client/session to the online module)
- `rpg-rework-ui.js` (global Top-100 screen, account panel, real-player matchmaking)
- `rpg-rework-v2.js` (ghost combat estimate uses the fetched opponent's actual HP / attack / defense and skill-loadout score)
- `tests/online-services.test.cjs`

**What the code now does:**
- Global leaderboard reads `leaderboard` with Supabase `select()`, sorts by battle power and max stage, and caps results at 100.
- Signed-in players publish their own active character profile using `upsert()`: nickname, class, battle power and highest stage.
- The same publish operation stores a seven-day ghost snapshot: level, battle power, max HP, attack, defense, branch, skills, talents and gear.
- PvP matchmaking queries active `pvp_ghosts` rows belonging to other users and filters exact battle power range ±15%. It no longer falls back to the local fake bot.
- The duel uses the real opponent's saved build and combat stats for the current automatic ghost-battle estimate. It is not yet a fully interactive remote turn-by-turn battle session.

**RLS / access model:**
- `leaderboard`: public read; authenticated insert/update only when `auth.uid() = user_id`.
- `pvp_ghosts`: authenticated players can read active snapshots; insert/update is restricted to their own `user_id`.
- `pvp_ratings`: authenticated read only; browser roles have no insert/update/delete grants or policies. This is deliberate: client-reported wins must not mint globally trusted PvP rating.

**Important trust boundary / unfinished server work:**
- Leaderboard and ghost stats are currently client-reported snapshots. RLS prevents one player from editing another player's row, but does not prove that a player's own reported battle power or progression is legitimate.
- Current duel result and PvP-store points are still local client-side progression. They are explicitly not written to `pvp_ratings`.
- Do not enable global PvP prizes or treat local PvP points as competitive rating yet. A trusted Supabase Edge Function/server resolver must load both saved builds, validate a match, calculate the result server-side, prevent replay/double claims, and only then update `pvp_ratings` and award points.
- The SQL migration has been committed to GitHub but **has not been confirmed as executed in the Supabase dashboard**. Until it is applied, the new leaderboard and ghost queries will return a missing-table error.

### SQL migration and setup

Apply `supabase/migrations/202611090002_online_leaderboard_ghosts.sql` in Supabase SQL Editor after the cloud-save migration `202611090001_cloud_saves.sql`. It creates:
- `public.leaderboard`
- `public.pvp_ghosts`
- `public.pvp_ratings`

The migration includes the RLS policies, grants, indexes and column constraints. No Supabase service-role key is required or included in the browser.

### 2026-11-09 — Online leaderboard and real ghost matchmaking

- Added the SQL migration for the global Top-100, active PvP ghost builds and server-owned rating ledger.
- Exposed the existing Supabase client/session to the new browser online module without exposing any service-role credential.
- Added Top-100 screen and account-menu entry; profiles publish with upsert after local save changes.
- Added a dedicated **РЕЙТИНГ** tab to the main map navigation (not only inside the account systems panel).
- Added real-player matchmaking with ±15% battle-power filtering, no bot fallback, seven-day ghost expiry, and build data in the opponent card.
- Updated the local ghost battle estimate to use the opponent's saved combat stats rather than synthetic tier stats.
- Added static regression tests and expanded the RPG GitHub Actions workflow to run them.
- Follow-up UI fix: the main map navigation now has a dedicated РЕЙТИНГ entry; regression test asserts its presence.
- Updated the browser smoke test: when signed out, PvP must request account sign-in and must not create a fake opponent; the global leaderboard screen must open. The sign-in prompt is asserted via the transient toast, outside the systems panel.
- Not complete / not verified: Supabase migration execution, live cross-account data flow, iPhone end-to-end UI, trusted PvP result validation and global rating rewards.
## Tests

GitHub Actions checks JavaScript syntax, seven-class expansion, all balance configs, engine rules and the Playwright Chromium browser smoke test. See `tests/`, `.github/workflows/rpg-rework-v2.yml` and `docs/BALANCE-CONTENT-AUDIT.md`.

## Historical baseline

- Preserved rollback point: `backup/balance-pass-before-20261103`.
- The pre-publication baseline is preserved by `backup/balance-pass-before-20261103` and the legacy rollback branches/tags.
- The source feature branch is retained; it is now one merge commit behind `main`.
- Older branches and PR #1 are retained as history; PR #2 is the publication merge.
