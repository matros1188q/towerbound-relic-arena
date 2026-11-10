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

1. Confirmed complete on 2026-11-10: applied `supabase/migrations/202611090001_cloud_saves.sql` and `supabase/migrations/202611090002_online_leaderboard_ghosts.sql` to the connected Supabase project.
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

Keep this section current. Every development session that changes the project must add a dated entry describing what changed, the files/areas affected, the commit SHA, and what remains unverified or unfinished.

### 2026-11-10 — RPG gem socket click delegation

- Fixed the RPG equipment gem actions: the root delegated click selector omitted `data-stone`, `data-extract-gem` and `data-inspect-stone`, so those existing handlers were unreachable. Added all three selectors; inserting a gem now reaches `insertGem`, updates `installedGems` and legacy `sockets`, and removes the consumed stone from the bag.
- Added a regression assertion to `tests/rpg-smoke.cjs` so the delegated selector cannot silently lose these controls again.
- Bumped the RPG UI script query to `v30` and the PWA shell cache to `towerbound-v26` so iPhone/PWA clients do not keep the old handler.
- Commits: `a50fd6df` (UI fix), `6ed96c31` (regression assertion), `f1e82b0b` (script cache-bust), `76220a63` (PWA cache).
- Verification: confirmed the updated selector, regression assertion, script version and service-worker cache directly on `main`. Full Playwright RPG smoke / GitHub Actions result, live Supabase authentication and physical iPhone testing remain unverified in this session. Every development session that changes the project must add a dated entry describing what changed, the files/areas affected, the commit SHA, and what remains unverified or unfinished. Do not record planned work as completed.

### 2026-11-10 — Centered login gate and iPhone header repair

- Replaced the nonfunctional top account control with an embedded login / registration form in the empty character-selection state. Unauthenticated players see **«Вход в игру»** with login, password, remember-me, **ВОЙТИ**, and **Зарегистрироваться**.
- The character-creation action is shown only after a Supabase session is confirmed. The new-character action also checks the session in its click handler.
- Fixed the auth timing race: `signIn` and `signUp` now await cloud-session processing and cloud-save restore before returning; auth state changes trigger a character-screen render. Empty cloud saves leave the player on the create-character state.
- Removed the automatically opened login overlay from startup, so it no longer covers the main screen or intercepts taps. The legacy floating account button is hidden.
- Added mobile header no-wrap rules for the TOWERBOUND wordmark and header controls, with smaller typography and spacing at widths up to 400px.
- Updated PWA cache to `towerbound-v25`; script cache keys: UI `v29`, cloud `v14`, styles `v17`.
- Files: `rpg-rework-ui.js`, `rpg-rework-ui.css.js`, `towerbound-cloud.js`, `progression-24.js`, `index.html`, `service-worker.js`, `tests/online-services.test.cjs`, `tests/full-game-audit.cjs`.
- Verification: JavaScript syntax, regression tests and browser smoke tests are tracked in GitHub Actions. A live Supabase login requires a real account and configured Supabase Auth; an actual iPhone screen was not physically exercised in this environment.

### 2026-11-10 — Character selection account entry and empty-state cleanup

- Added a visible **АККАУНТ** button beside the TOWERBOUND header on the character-selection screen. It opens the existing Supabase account dialog; after authentication it displays the login name / online status and opens sync/sign-out controls.
- Standardized the dialog controls to `loginInput`, `passInput`, and `rememberMe`; sign-in and registration continue to use the virtual email `login.toLowerCase() + '@towerbound.game'`.
- When the cloud account has no save and the local profile has no characters, the game keeps the character-selection screen open and reports: **«Успешный вход. Создайте персонажа»**.
- Removed the top duplicate create-character button and the bottom duplicate create / choose-character buttons. The empty state now has one primary **СОЗДАТЬ ПЕРВОГО ПЕРСОНАЖА** action inside «Башня ждёт своего героя».
- Updated PWA cache to `towerbound-v23`; bumped the UI and cloud script query versions.
- Files: `rpg-rework-ui.js`, `towerbound-cloud.js`, `index.html`, `service-worker.js`, `tests/online-services.test.cjs`, `tests/full-game-audit.cjs`.
- Commits: `d47db626`, `6e033aca`, `e6be177c`, `6911c3a1`, `868207d1`, `162612f5` (plus this documentation commit).
- Verification: static regression assertions were added; browser/device interaction and a live Supabase sign-in still require a real configured account and browser session. Do not treat a static test as proof of successful live authentication.

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
- SQL migrations `202611090001_cloud_saves.sql` and `202611090002_online_leaderboard_ghosts.sql` were applied to the connected Supabase project on 2026-11-10. Live cross-account gameplay and Auth-provider setup still require end-to-end player testing.

### SQL migration and setup

Applied on 2026-11-10 after `202611090001_cloud_saves.sql`. The migration creates:
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
- Not complete / not verified: live cross-account data flow, iPhone end-to-end UI, trusted PvP result validation and global rating rewards. Migration execution and database schema/RLS were verified through the connected Supabase project.
## Tests

GitHub Actions checks JavaScript syntax, seven-class expansion, all balance configs, engine rules and the Playwright Chromium browser smoke test. See `tests/`, `.github/workflows/rpg-rework-v2.yml` and `docs/BALANCE-CONTENT-AUDIT.md`.

## Historical baseline

- Preserved rollback point: `backup/balance-pass-before-20261103`.
- The pre-publication baseline is preserved by `backup/balance-pass-before-20261103` and the legacy rollback branches/tags.
- The source feature branch is retained; it is now one merge commit behind `main`.
- Older branches and PR #1 are retained as history; PR #2 is the publication merge.


### 2026-11-10 — Supabase migrations applied and RLS hardened

- Applied cloud-save migration `202611090001_cloud_saves` and online leaderboard / ghost / ratings migration `202611090002_online_leaderboard_ghosts` to Supabase project `ygeodzsnldpofylaziel`.
- Verified that the project records both migrations and that `player_saves`, `leaderboard`, `pvp_ghosts` and `pvp_ratings` exist with RLS policies.
- Verified account ownership checks on leaderboard and ghost writes; PvP ratings remain read-only to browser roles.
- Supabase security advisor flagged an infrastructure event-trigger helper, `public.rls_auto_enable()`, as executable by browser roles. Revoked `PUBLIC`, `anon` and `authenticated` execute privileges. This helper remains available to its event-trigger mechanism.
- Optimized owner-check RLS predicates by wrapping `auth.uid()` in scalar subqueries.
- Added matching reproducible migration: `supabase/migrations/202611100001_online_rls_hardening.sql`.
- Remaining: configure/verify Auth providers and Pages redirect URLs; perform real sign-up and two-account cross-device save/leaderboard/ghost tests; deploy a trusted server-side PvP result resolver before awarding global ratings.


### 2026-11-10 — Turn-based combat handoff and first-fight tutorial

- Fixed player-turn recovery: the player actor is authoritative; a stale `battle.busy` flag is cleared before a valid handoff. Pending queue timers are cancelled before a new enemy queue starts.
- Added an enemy-queue token so callbacks from an old queue cannot continue after the turn advances. Enemy queue completion restores the player actor and clears the busy state.
- Enemy phase displays `Противники атакуют...`; an empty enemy queue immediately returns control.
- Made the end-turn button persistently visible, larger and high-contrast gold/orange; it disables and reads `ХОД ПРОТИВНИКА...` while enemies act. Added live guidance and retained the initiative strip.
- Added `Автоатака!` floating feedback when ending a turn without using a skill.
- Added a first-fight tutorial modal with the three requested explanations and a `ПОНЯТНО` button; dismissal is remembered locally.
- Extended browser smoke coverage for tutorial display/dismissal, enemy damage, player-turn restoration and button reactivation.
- Commits: `62378401ba060565c6e71657081851afbd0161d0` (gameplay/UI/test implementation) and `d154794fb3c12cea287a5aa0a8cdbef920677b4e` (smoke-test assertion correction).
- Verified: `node --check rpg-rework-ui.js`, RPG smoke test and endgame progression checks pass on the current `main` commit. Cross-browser screenshot workflow and Pages deployment are still running at the time of this entry. Physical iPhone visual testing remains outstanding.


### 2026-11-10 — Combat screen visual containment and skill detail repair

- Preserved the turn queue safeguards from the previous combat fix: player turn recovery clears `battle.busy`, enemy actions run sequentially with cancellable timers and stale-queue tokens, and the end-turn button is disabled with `ХОД ПРОТИВНИКА...` while enemies act.
- Fixed initiative rendering: Matroscheg now has a small portrait with a gold ring; enemy turns use distinct red-framed markers.
- Fixed the telegraph's incorrect `tb-target-warning` class. It is no longer absolutely positioned as a floating badge and now stays inside the enemy card.
- Reworked the battle grid so the hero status, initiative, mob targets, focused enemy, skills, end-turn button and potion belt each occupy their own explicit grid row. Portrait and target art wrappers clip their contents and use `object-fit: contain`.
- Boss / elite art is constrained to a 150px maximum height; mobile uses a shorter portrait frame. Mob target cards use a four-column / two-row layout on narrow screens, with art, labels and HP indicators constrained to each card.
- Fixed the player HP bar cascade: the hero health fill is green again and its displayed width is clamped to 0–100%.
- Added explicit `damage_multiplier: 1.5`, `resource_cost: 18` and a Russian description for Assassin's `Коварный выпад`; skill detail UI now derives safe descriptions from the effect configuration instead of rendering missing values.
- Expanded `tests/rpg-smoke.cjs` to check the 150% skill description, image containment, telegraph positioning, green hero HP fill, player initiative portrait, and disabled enemy-turn button.
- Commit: `5df7994ec4975886e435e65bcf76a911722df7de` (followed by CSS/test corrections). RPG smoke and RPG rework checks pass on the current `main`; cross-browser verification is still running. Visual browser tests cover the 375×812 portrait viewport; a physical iPhone session is still required for final device-specific confirmation.


### 2026-11-10 — Critical skill availability and stat mapping fix

- Root cause: the battle UI rendered attack slots from both `classes.json` base skills and `catalog.json` specialization skills, but `playerAction()` looked up the clicked ID only in the specialization catalog. Base skill IDs such as `assassin.base.1` therefore resolved to `undefined` and were rejected as unavailable.
- Added a class-aware resolver that checks the selected character's own `base_skills` first, then the 420-entry specialization catalog, and rejects a skill from another class/branch.
- Kept catalog loading awaited before the first render; added HTTP status and payload-shape validation plus a `SKILL CATALOG READY` console summary.
- Added the requested `console.log('SKILL DEBUG:', skillObject)` inside the combat skill-slot render loop. It exposes the actual skill id, class, branch, unlock level, effect template and other source fields in browser DevTools.
- Fixed stat mapping: per-skill `resource_cost` and `damage_multiplier` now take precedence over effect-template defaults and are used by the actual combat calculation. UI displays safe damage/healing/shield/buff percentages, resource cost, cooldown and uses `—` rather than `undefined`.
- Engine skill availability now treats a missing unlock level as level 1, while still enforcing class branch ownership.
- Added regression checks for all seven class base skill sets, all 420 specialization entries, catalog class coverage, and an actual Assassin base-skill click in browser smoke.
- Verification: RPG smoke and RPG rework v2 checks passed on `ef1b35db7d7687dc2dbdd2d4b12b43fd2c7d5dc8`; GitHub Pages deployment succeeded. Cross-browser run was still in progress when this entry was written. Physical iPhone class-by-class testing remains unverified.


### 2026-11-10 — Skill cache refresh and seven-class availability verification

- Bumped the rpg-rework-ui.js query version in index.html from v=15 to v=16 so mobile browsers do not keep a previously cached battle UI after the base-skill resolver fix.
- Expanded the browser smoke test to exercise the engine's level-2 base-skill availability rule for all seven classes and print the result as SKILL AVAILABILITY BY CLASS.
- The root cause and fix are recorded above. The current automated smoke already confirms an Assassin base-skill click; the new check covers Bishop, Dragonkin, Destroyer, Elemental, Duelist and Shaman availability as well.
- Live iPhone testing and a real player's DevTools console remain outside the hosted CI environment; CI captures the browser's emitted SKILL DEBUG object.


### 2026-11-10 — Cache-bust engine and skill data

- Bumped the RPG engine script URL to v10 and added v10 cache-busting to all balance JSON fetches so mobile browsers receive the current skill availability logic and class skill definitions.
- Added v2 cache-busting to the 420-skill catalog request. The request remains relative to index.html and is awaited before the first UI render.
- Extended smoke coverage to verify all 448 skills (28 class base skills + 420 specialization skills) resolve to known effect templates and have safe cost/effect fallbacks.


### 2026-11-10 — Final skill-fix verification

- `SKILL AVAILABILITY BY CLASS` browser test returned `available: true` for level-2 base skills in all seven classes.
- `SKILL DEBUG CAPTURE` confirmed Assassin's `Коварный выпад` resolves to `assassin.base.1`, unlock level 1, strike effect, 150% damage multiplier and 18 resource cost.
- RPG smoke, full game audit, online-service tests, combat runtime/visual tests, character-art tests, progression tests and RPG rework checks passed on commit `ef1b35db7d7687dc2dbdd2d4b12b43fd2c7d5dc8`.
- GitHub Pages deployment for that commit succeeded. Cross-browser screenshot suite was still running at report time.


### 2026-11-10 — Combat handoff and skill catalogue regression gate

- Preserved the class-aware base-skill resolver and awaited aggregated `configs/skills/catalog.json` load; bumped its cache key to v3 and the UI script to v17 so deployed browsers fetch the current catalog.
- Enemy phase now waits 500 ms before the first enemy action and keeps the 500 ms stagger between subsequent enemies. `endPlayerTurn()` continues to clear the stale timer and busy flag before queueing opponents; `advanceToPlayerTurn()` invalidates the queue and restores player input.
- Added regression assertions for all 420 catalog entries, seven-class coverage, unlock-level defaults, effect IDs, and both 500 ms enemy-turn delays. This block does not change combat damage, initiative, skill costs, or round resolution.


### 2026-11-10 — Combat audio and hit feedback

- Verified the existing Web Audio synthesizer presets for click, hit, critical and incoming damage; added an explicit MUTE / ВКЛ control beside the persisted volume sliders.
- Enemy hits now show floating damage above the hero, play the hurt cue and shake the arena on hits of at least 10% max HP (the existing boss/phase-four shake path remains intact).
- Normal damage numbers are now white; critical numbers remain gold and healing remains green. Existing float-up and shake animations are reused, with no combat math or turn-state changes.


### 2026-11-10 — Per-character starter kit and 24-hour daily chest

- Every newly created character now receives 100 silver and three basic healing potions. The one-time account starter flag still gates only the 24-hour premium welcome bonus, so the bonus cannot be farmed by creating characters.
- Added a character-owned daily chest cooldown timestamp and engine methods to inspect/claim it. The reward is one of: 50–100 silver, one healing potion, or 10 crafting materials; a second claim is rejected until 24 hours have elapsed.
- The timestamp and reward history live inside the character save object, so the existing local cache and Supabase cloud snapshot persist them together.


### 2026-11-10 — Explicit cloud save/load and settings sync

- Formalized `loadGame()` and `saveGame()` around the existing Supabase `player_saves` row and version-checked `save_player_game(p_save_data, p_expected_revision)` RPC. The game continues to load from localStorage immediately, while a signed-in session restores/compares the remote snapshot and saves changes to Supabase; localStorage remains the offline cache.
- Exposed `queueSave`, `loadGame`, `saveGame`, `syncNow` and `open` through `TowerboundCloud`. UI saves now explicitly queue cloud persistence after updating the local cache; the storage listener remains as a compatibility safety net.
- Added account and forced-sync controls to Settings. Manual sync waits for an in-flight save and reports unauthenticated, conflict and network errors instead of claiming success.
- The existing Supabase `player_saves` table, owner RLS and optimistic revision RPC are reused; no service-role key is exposed and no schema relaxation was made.


### 2026-11-10 — Daily chest map integration and release cache refresh

- Added a gold-accented daily chest button to the 250-stage map. It displays READY or a live hours/minutes cooldown, disables itself after a claim, and reports the exact reward.
- Reward timestamp is stored in the character's save state and therefore follows the player between devices through the existing cloud snapshot. Engine tests cover all three reward outcomes and the 24-hour lockout; browser smoke checks the map button and persisted timestamp.
- Bumped engine/UI/CSS/cloud script cache keys so GitHub Pages clients load the complete update instead of stale mobile assets.


## 2026-11-10 — skill and turn-handoff hardening
- Normalize every resolved base/catalog skill into numeric `damage`, `cost`, and `unlock_level`; missing unlock levels default to 1 and missing numeric effects/costs fall back to 0 or the configured effect template.
- Keep the original specialization catalog (420 skills) and class base-skill source; no catalog flattening or combat-rule rewrite is needed.
- Skill damage now consumes the normalized value when the explicit multiplier is absent. Ordinary mob damage numbers are white; critical numbers remain gold and healing numbers green.
- Added smoke assertions for numeric skill normalization, default unlock level, the 500ms enemy queue, and clearing `battle.busy` before player control returns.

- Browser smoke now treats `net::ERR_ABORTED` image requests during normal SPA screen transitions as expected cancellations, while continuing to fail on 404/network errors. Manual cloud sync also reports failure if any write in a multi-save flush fails.


### 2026-11-10 — cloud sync reliability and sound/art verification
- Fixed the Sync Now button inside the Supabase account dialog: it now awaits the same version-checked remote write as Settings and reports completion only after Supabase confirms it. It no longer clears an unresolved revision conflict or silently schedules a background write.
- Added automatic retry of queued local-cache changes when the browser comes back online; the cloud session and conflict guard remain authoritative.
- Explicitly capped both desktop and mobile mob/boss artwork frames at 150px with hidden overflow and contained images.
- Browser smoke now exercises master volume and Mute on/off; static checks cover all four synthesized sound presets and cloud sync conflict/error behavior.


### 2026-11-10 — neutral skill multiplier and final UI cache refresh
- Skills without a damage multiplier now receive a neutral 1.0 multiplier instead of a zero multiplier, preventing a missing optional config field from suppressing attack damage.
- Mute control text reflects the current enabled/disabled state.
- Bumped the UI and cloud cache keys and extended smoke assertions for the fallback and visible Mute state.

### 2026-11-10 — iPhone-first character hub, navigation and safe-area pass

The following four UI commits are now part of `main`:

- `96ac5fea9b93872efcb7600263a9b1cf0a03fa6c` — clarified the character hub and added a specialization preview/description area. The selected branch description is exposed through an accessible live region so the player can understand a specialization before choosing it.
- `5da2a73cec0866841239add2de93ea2bbab5b6f5` — hardened iPhone safe-area handling and compact mobile layout, including the battle tutorial's action area near the home indicator.
- `05575d4514e54126f658398b854814e53d7d3bbc` — consolidated mobile navigation and compact map layout. The stage action/summary toolbar is positioned before the map; the map uses a constrained five-column stage grid on mobile.
- `6c8340cb5ecfb85f2195cee8da7331876ac046be` — preserved the existing account-tab contract while completing the character-hub navigation changes.

Related supporting commits in the same UI pass:

- `386aceebedad2997ef08f2c7420301c76f58f1ae` removed the remaining header and screen-navigation shortcuts so the bottom navigation is the global navigation surface.
- `bc675c241ef4aae24b5f4ae18f40f2b90e69a54b` fixed a bottom-navigation tab action collision.
- `699d8dec8aa0b7cde038b757af8ccd7a4ea3449c` fixed daily-chest availability inside the character/account hub; browser smoke coverage was moved to that hub.
- `da97415ce9c885cd34046a57655ce86c0f96d9ae` keeps the tutorial action visible above the iPhone home indicator.
- `b936db58943413f75476741e626290ac6ecf2dc9` moves the battle tutorial outside the clipped arena container so it is not cut off by arena overflow.
- `d898ad47281bca1809e8e924b325ad2317949519` refreshes the PWA cache version for the mobile UI release.
- Follow-up commits corrected the tutorial layout audit, portal assertion, combat/navigation overlap, and browser recovery fixture so pagehide autosave does not destroy the intentionally corrupted recovery test state.

Implementation areas:
- `rpg-rework-ui.js`: character/profile hub, specialization preview and account-tab behavior.
- `native-pwa.css`: iPhone safe areas, compact empty gear slots, stage toolbar/map ordering, mobile navigation, tutorial positioning and touch targets.
- `tests/browser-smoke.cjs`: regression coverage for mobile navigation, tutorial structure/visibility, account-hub daily chest and persisted recovery state.

Current UI details documented by the implementation:
- Empty equipment slots use their equipment type (weapon, chest, helmet, legs, gloves, accessory) and a compact empty-state label rather than generic numbered slots.
- Specialization descriptions wrap within the mobile layout and are announced through an accessible live region.
- The stage toolbar sits above the map; the stage grid is constrained to five columns to avoid mobile horizontal overflow.
- The bottom navigation remains above page content and uses touch-friendly controls; old header shortcuts are removed.
- Tutorial content is portalled outside the clipped battle arena and its action remains reachable above the iPhone home indicator.

Verification boundary:
- The browser smoke workflow is configured to exercise mobile layouts, including 390×844 and 430×932 viewports, alongside cross-browser checks. These are automated browser viewport tests, not a physical-device certification.
- Do not claim that every screen has been visually validated on a real iPhone until a hands-on device pass is completed. Record the final GitHub Actions result for the exact release commit separately; a running workflow is not a passing test.
- The four UI commits above are the current documented UI-pass head: `6c8340cb5ecfb85f2195cee8da7331876ac046be`.

### 2026-11-10 — Basic attack, real equipment drops and boss damage cap

Implemented directly on `main`:

- Added a separate **АТАКА** control above the six existing skill/counter/ultimate slots. It uses no resource, deals weapon-based damage and restores up to **15 resource on a successful hit**. The control is available once per player turn and remains separate from the skill loadout.
- Basic attack scaling: Assassin / Duelist / Destroyer = 100%; Bishop / Elemental Lord = 50%; Dragonkin / Shaman = 75% by default. Dragonkin's Fire Dragon and Shaman's Nature branches use 100%; Black Dragon and Dark Gods use 50%.
- Increased Duelist's resource pool to 100 so the same +15 regeneration rule is meaningful for that class; its base skill costs 22 resource, while counter and ultimate use their configured 18 / 42 costs.
- Replaced generic trophy-style equipment drops with typed equipment items. Gear now rolls a real slot (weapon, chest, head or accessory), rarity, item level, generated name and non-zero stats. Weapon rolls attack/crit; chest rolls defense/HP; helmet rolls defense/HP; accessories roll mixed offensive stats.
- Normal equipment can drop throughout the tower; the normal equipment chance is 40%, elite equipment chance is 35%, and first-clear boss rewards guarantee an epic weapon. Boss rare/epic and pity-based legendary/godlike rewards now use the same equipment generator. Crafting materials, stones and scrolls remain separate non-equipment inventory items.
- Added per-slot equipment scoring and **ЭКИПИРОВАТЬ ЛУЧШЕЕ**. It compares the sum of weighted stats across equipped and bag items, equips the best item in each slot, and returns replaced gear to the bag.
- Added **РАЗОБРАТЬ ВЕСЬ СЕРЫЙ МУСОР**. It salvages only common/gray equipment from the bag, converts it to crafting materials, and preserves rare-or-better items and boss loot.
- Bag cards now show item stats and compare each stat with the equipped item for that slot: green for an improvement, red for a downgrade. Materials do not receive an Equip button.
- Profile sub-tabs now use horizontal touch scrolling on narrow screens.
- Ultimate attacks are resolved as three hits. Against bosses, the three hits share a **35% maximum-HP cap per player action**, preventing a single skill/ultimate action from deleting a full-health boss. Ordinary enemies retain their normal damage rules.
- The new UI is arranged as one full-width thumb-reachable basic attack above the original six-slot skill grid, preserving the two-row layout of the existing six skills/counter/ultimate controls.

**Regression coverage:** `tests/loot-combat-update.test.cjs` checks real equipment drops, stat generation, all seven class multipliers and hybrid branches, +15 resource restoration, boss damage caps, best-in-slot equipment and gray salvage. `tests/rpg-smoke.cjs` also exercises the basic attack in a browser battle. The RPG workflow now runs the new loot/combat regression file.

**Implementation commit log (all on `main`):**
- `df28aa03cf1c95029a379fecb6b52eeb09667d98` — free basic attack and boss damage guard.
- `d36bc54b514a815949859908e874ec7869e71e5a` — stat-bearing equipment generator and equipment automation.
- `5a7824d17506b1497a30cc00359c684492424912` — inventory stat comparison and quick equipment actions.
- `af9505c72faaadc551a057fa801f264b16ebb242` — swipeable tabs and gear comparison colors.
- `973f317ef526eba08d4ca4e43a1fde44c955a249` — increased equipment drop frequency.
- `f404cb776a1af60b8a3eaa61ae8d1a2c221d0441` — Duelist resource pool update for +15 regeneration.
- `154dd53efec55021b1bc6d6dfc4b3254c398a56c` — loot/combat regression test added.
- `04af32155276bacbd12da441b57e20b801317dc9` — CI includes the new regression test.
- `1b98a8a36a321bd63b1911d7f2d0e28d91954bde` — attack button moved above the six-slot grid.
- `30ff84f32e521c208838ac578e7fe7141ed75580` — Duelist resource budget test updated.
- `5bb79ea0b3972e7d7b4ef1bc93d57186d25d21ca` — browser test verifies basic attack damage and resource gain.
- `bb5a6e86e1724e229f586c2766b059801c4a3a99` — mobile smoke expects the basic attack.
- `10727e0d276c86a7fca006c3ce6d9d47b683f130` — tutorial assertion updated for the new attack action.
- `32ae78223ee6a39e2d6965c0e6794985e366d792` — final tutorial-regex correction in the smoke test.

The final GitHub Actions result for the exact `main` release commit must be checked in the Actions links after the workflows finish. Passing automated viewport tests is not a substitute for a hands-on physical iPhone test.

### 2026-11-10 — Follow-up fixes and release verification

- Refined generated equipment names so rarity adjectives agree with the masculine item names (for example, `Эпический Клинок тьмы`, `Эпический Доспех бастиона`, `Эпический Шлем затмения`).
- The Duelist now has a 100-point resource pool, a 22-point base-skill cost and the standard 18 / 42 counter / ultimate costs, so a +15 basic-attack return is useful without making skills free.
- Expanded browser regression to click the new basic attack in a live battle and verify both the selected target's HP decreases and resource increases to 15. It also clicks **ЭКИПИРОВАТЬ ЛУЧШЕЕ** and **РАЗОБРАТЬ ВЕСЬ СЕРЫЙ МУСОР**, verifies the selected best weapon/chest, confirms common items convert to materials, and confirms a rare-or-better item remains available for individual salvage.
- Fixed the mobile battle panel's vertical budget after adding the extra attack control. At 390×844 the automated browser geometry check measured the attack control at y=522–566, skill grid at y=576–681, End Turn at y=725–777, and potion belt at y=791–829; the End Turn hit target no longer overlaps the potion belt.
- Refreshed the engine, combat UI and stylesheet cache keys in `index.html` to v12 / v20 / v9 respectively.

**Verified on `main` commit `3b9e3201ec523f74b1b7cc85595a1d5f49e010a3`:**
- RPG regression suite, including the new `tests/loot-combat-update.test.cjs`: passed.
- Playwright RPG smoke, including the basic attack, loot inventory controls and 390×844 / 430×932 mobile map checks: passed (run [42834373275](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/42834373275)).
- GitHub Pages deployment: passed (run [42834505077](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/42834505077)).
- Cross-browser Chromium / Firefox / WebKit smoke: still running at the time this note was written (run [42834505065](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/42834505065)).
- A physical iPhone session has not been performed; the viewport checks are Playwright browser emulation.

Additional implementation / verification commits after the initial feature block:
- `d4e4c3b83bdfdad3c4d0c84bf8430bc8f2b4804b` — distribute ultimate damage across three hits while preserving the 35% boss action cap.
- `d9b3a8860d19435f7442297b410dd69abea7ff42` — prevent equipment changes from restoring a dead character to positive HP.
- `f404cb776a1af60b8a3eaa61ae8d1a2c221d0441` and `821f34c5d7ff3da10ac0ffac1036694a5500930f` — Duelist resource capacity and skill cost balance.
- `69ee28695694033fc1736037a9ad6c3c71258ee0` — consistent Russian equipment naming.
- `2c1cca81e3f25bd85cb79dafab4be44a8dc3ff69`, `9eab3965b9ecd9b58bfea9a7b237cf5a267162db`, and `ee8b8bbe7c1877d172f05b0c01421735e220722b` — mobile battle control sizing and stylesheet correction.
- `f2791fd5aa3f09f9d8103b335e3c065cb1cf3f40` — cache-bust the engine, combat UI and mobile stylesheet.
- `3df3da84a2627c7777bcc0ae8175401a40a2090d`, `a09768097b9f6c7e48d27ec2c6dd15da8fd083d5`, `e994ad59f7e5f8f05afe44e37c1fbae39db381bc`, and `3b9e3201ec523f74b1b7cc85595a1d5f49e010a3` — browser coverage for Equip Best, bulk gray salvage, basic attack turn flow and refreshed asset cache keys.


## 2026-11-10 — Battle timer NaN recovery

- Root cause: the pause/resume path assumed `battle.telegraph.until` always existed. Player-turn telegraphs are created without an `until` timestamp, so subtracting `Date.now()` from `undefined` produced `NaN`, which was passed into `setTimeout`. Browsers coerce a NaN timeout to an immediate callback; countdown consumers could also render an invalid seconds value. A non-finite enemy speed modifier could independently propagate into `attackIntervalMs`.
- Added finite, bounded millisecond normalization for enemy-turn timers and numeric timer state at battle start. Pause/resume now treats a missing or invalid telegraph deadline as a zero-length optional countdown instead of calculating with `undefined`.
- Added guarded recovery around both enemy-turn processing and the player's end-turn action. Any exception clears the pending timer, invalidates the old queue token, resets `battle.busy`, restores `battle.isPlayerTurn`, and returns the UI to an enabled player turn.
- Normalized enemy attack interval and speed modifier inputs to finite positive numbers with a 1-second fallback.
- Added browser regression checks for absence of `NaN сек`, finite enemy attack interval, and numeric timer recovery.

## 2026-11-10 — account, gems, localization and iPhone layout hardening

- Kept the Supabase username/password gate and synthetic login@towerbound.game address flow. The tb-remember-me flag controls whether a persisted Supabase session is accepted at the next launch; without the flag, the stored session is signed out and the login gate remains in front of character selection.
- Preserved the existing LocalStorage save keys and the versioned cloud-save conflict flow.
- Kept the Russian labels for healing_potion and craft_material, removed repeated item-type/rarity labels from inventory and equipment names, and expanded percentage formatting for crit/evasion key variants.
- Added a public insertGem engine method (with socketStone retained as a compatibility alias). It validates the equipment, inventory stone, free socket count, class/specialization and weapon/armor slot, writes installedGems, mirrors legacy sockets, and consumes the inventory stone only after validation.
- Inventory stone cards now show the configured catalog description; installed stones can still be extracted back into the bag.
- Added explicit iPhone profile-name wrapping, horizontal swipe tabs, flexible inventory cards and compact bag-tool buttons.
- Refreshed browser cache keys: cloud v8, engine v16, profile UI v26, mobile stylesheet v14.
- Added regression assertions in tests/online-services.test.cjs and a GitHub Actions workflow .github/workflows/towerbound-checks.yml for JavaScript syntax and static regression checks.

**Verification boundary:** GitHub Actions is configured to run the checks on this push. A physical iPhone Safari session and visual touch-swipe verification are not performed from this repository-editing session; Playwright/device results must be taken from the Actions/browser test run, not inferred from CSS assertions. Supabase registration requires Confirm Email disabled for synthetic @towerbound.game logins, as documented in TOWERBOUND_CLOUD_SETUP.md.

## 2026-11-10 — Final account, inventory, gem and iPhone release record

This section records the complete follow-up implementation that closes the account/login, item localization, gem socket and narrow-screen UI tasks. All implementation commits below were made directly on `main`.

### Account and session gate

- The game now blocks character selection behind the **Вход в игру** dialog until a Supabase session is verified.
- Login names are normalized to lowercase and mapped to the synthetic Supabase email format `login@towerbound.game`; login and registration use Supabase password authentication.
- **Запомнить меня** is stored as `tb-remember-me`. A persisted Supabase session is accepted on the next launch only when this flag is enabled. Without it, the previous session is not silently reused and the player must enter the password again.
- Existing local save keys and the versioned cloud-save conflict/migration flow are preserved.
- Supabase setup requirement: Email provider must have **Confirm Email disabled** for this synthetic address scheme. Email-based password recovery is not available for these unowned addresses; configure a verified recovery channel before production use. See [TOWERBOUND_CLOUD_SETUP.md](TOWERBOUND_CLOUD_SETUP.md).

### Russian inventory labels and stat presentation

- Added/retained Russian display names for raw inventory IDs, including `healing_potion` → **Зелье исцеления** and `craft_material` → **Материал для крафта**.
- Item display falls back to the localized item-type dictionary when an item has only a raw ID, rather than exposing the internal identifier.
- Critical chance, evasion and their supported key aliases are formatted as percentages instead of fractional decimals (for example, `0.05` → `5%`).
- Removed repeated rarity adjectives from item titles and removed the redundant second item-type line from bag cards.
- Gem catalog descriptions are localized and scale with gem level; the inventory stone card exposes its effect description directly.

### Gem catalog, socket insertion and extraction

- The gem catalog includes named stones and explicit effect descriptions, including fire-damage and defensive/stat bonuses.
- Clicking/inspecting a stone in the bag shows its description.
- The engine exposes `insertGem(characterId, itemId, stoneId)`; the older `socketStone` entry point remains as a compatibility alias.
- Insertion validates that the equipment exists, a free socket remains (`sockets > installed gems`), the selected enhancement stone is actually in the bag, and its class, specialization and weapon/armor slot are compatible.
- On successful insertion, the stone's ID/data and stats are stored in `installedGems` (with the legacy socket representation kept in sync) and the consumed stone is removed from the bag. Failed validation does not consume it.
- **ИЗВЛЕЧЬ КАМЕНЬ** returns an installed stone to the bag and frees the socket so it can be reused.

### iPhone layout corrections

- Profile names no longer break at arbitrary character boundaries: normal word wrapping, safe overflow wrapping and disabled hyphenation are applied, with a responsive heading size.
- Profile sub-tabs use horizontal touch scrolling, preserve single-line tab labels and hide the scrollbar.
- Inventory cards and their text can shrink without collapsing into a one-character column; item labels wrap at word boundaries.
- **ЭКИПИРОВАТЬ ЛУЧШЕЕ** and **РАЗОБРАТЬ ВЕСЬ МУСОР** use compact, constrained button widths rather than occupying the full viewport.
- Updated asset cache keys in `index.html`: cloud/auth bundle **v8**, RPG engine **v16**, profile/inventory UI **v26**, mobile stylesheet **v14**.

### Files changed for this release

- `towerbound-cloud.js` — Supabase login/session persistence and remember-me gate.
- `rpg-rework-v2.js` — validated gem insertion/extraction engine API.
- `rpg-rework-ui.js` — localized inventory names, stat formatting, gem descriptions/actions and duplicate-label cleanup.
- `rpg-rework-ui.css.js` — responsive profile title, swipeable tabs, flexible bag cards and compact inventory actions.
- `index.html` — cache-busting versions for the updated bundles.
- `tests/online-services.test.cjs` — account gate, localized UI, bundle-version and gem insertion/extraction regression assertions.
- `.github/workflows/towerbound-checks.yml` — Node 20 syntax and regression workflow.
- `TOWERBOUND_CLOUD_SETUP.md` — synthetic email / Supabase Confirm Email setup warning.
- `README.md` — this release record.

### Implementation commit log

All commits below are on `main` and form the account / gem / localization / mobile follow-up series:

- `f6e4074120a8be7020d2466e0fc379b0434816b2` — block game startup until the account session is verified.
- `7621c8a7bd9d15f9b355922780123012da9cc5d0` — format item stats and display inventory stone descriptions.
- `603b64a9d4455fb76f49ceaac62cadd23059ab1f` — add localized gem catalog descriptions.
- `022e63c19fbed2f35f2e3e8fadf7634c6ca5d7e2` — refresh account, gem and mobile UI asset versions.
- `7710ca4d643ed2b4d0ecf23a98f5dfcd309b945a` — render elemental item damage as flat stats.
- `c70e27a7ecaebd71c444a5191f97ac01ba8e2435` — ensure the login overlay remains visible on mobile browsers.
- `953bcade1552a485f56c108b8662ac6296b0e501` — refresh login overlay cache.
- `ec26caacb66e4a6f2543d5d9b3990e951403b237` — assert the visible login overlay asset version.
- `56a800739f398b57b47c6ab01a65921b42aa4534` — scale stone descriptions with gem level.
- `7f7980625c6bdac57b7d4855f56c5d86e68a8cb7` — cover account gate and gem installation in regression tests.
- `323064094f2f94a7154dff6158ad224318ce908d` — rerun login and gem browser journeys.
- `d5df65e61466932a667eb1d47a82b38028f27601` — localize raw item names and remove duplicate rarity labels.
- `c0e56270c4d3f9824c6a00785da03ff8c6368b05` — document synthetic-email confirmation requirements.
- `9481c0b23de380478b08339c81dda86906e5ff05` — cover localized item-name fallback.
- `fb43ff771e350e1eeb0b9b43e1e3ac570fe1c392` — refresh login and localized inventory bundles.
- `2cdb6b7bcb4d3a77f123fb45b659ec38e59730ac` — assert current login/inventory bundle versions.
- `c19c22227b5ee2ae11bad72c36890135dc04f8d7` — clarify the Supabase Confirm Email setting.
- `681111579310f2fa9a54f512bfd8ebcdd80d18b6` — harden gem insertion and socket validation.
- `148fdd3c32b5d656177ce1a9781c11b89e4689e5` — improve inventory localization and gem UI.
- `794357924279f29b7a4df7c7b4125343436f2e3b` — harden iPhone profile and inventory layout.
- `d6b4c4bce89204576cb54545cd2f2668ba2b09ba` — refresh account, inventory and mobile UI cache keys.
- `ebc85946646ccbfaf1af733a00537e62f24e6589` — add account, gem and iPhone regression assertions.
- `4dd5d17c9a2fff0e42aba0d75b5eaa57439a1abc` — add the Towerbound regression/syntax GitHub Actions workflow.
- `cc8a2d2980af1eca4138d3ffbfeec89b2bff9f99` — document the implementation and verification boundary.
- `32ca5efc204775eff3e2445c1ad7c3da9d3d48da` — exercise gem insertion/extraction round trips and invalid insertion cases.

### Verification status for release commit `32ca5efc204775eff3e2445c1ad7c3da9d3d48da`

- **Passed:** JavaScript syntax checks for the engine, UI, stylesheet, cloud and online service scripts.
- **Passed:** `tests/online-services.test.cjs`, including gem insertion, stone consumption, extraction, missing socket, missing stone, wrong specialization and wrong equipment slot cases. GitHub Actions run [42867010168](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/42867010168).
- **Passed:** GitHub Pages deployment for this exact commit. Run [42867010411](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/42867010411).
- **Passed locally in the repository-editing session:** the regression test file executed with mocked file reads and the engine's gem insert/extract round trip.
- **Pending at the time of this README update:** RPG rework workflow [42867010312](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/42867010312) and cross-browser smoke [42867010418](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/42867010418).
- **Not claimed as verified:** a hands-on physical iPhone Safari session, real Supabase registration/login against the production project, and visual touch-swipe behavior on a physical device. Automated viewport/browser checks do not replace those checks.

**Release branch:** `main`  
**Release commit before this documentation-only update:** `32ca5efc204775eff3e2445c1ad7c3da9d3d48da`


## 2026-11-10 — iOS PWA automatic update release

- Updated `service-worker.js` to cache the app shell as `towerbound-v22`, call `self.skipWaiting()` during install and `self.clients.claim()` during activation.
- Changed document requests (`/`, navigations and `index.html`) to **Network First**, with the cached HTML used only when the network is unavailable. Other same-origin assets remain cache-first for fast launches.
- Registered the worker from `juice-pwa.js` with `updateViaCache: 'none'`. The browser's service-worker update algorithm fetches the worker script separately; it is not intercepted by the worker's own fetch handler.
- Added an immediate update check after registration, an hourly `registration.update()` check, and another check when the PWA returns to the foreground.
- When a replacement worker reaches `installed` while an existing controller is active, the app displays a compact **Обновить сейчас** toast. The button reloads the page with `window.location.reload()`.
- Added regression assertions for the worker lifecycle, Network First HTML handling, cache-bypass registration, hourly checks and reload toast. CI now syntax-checks both PWA scripts.

### Files changed
- `service-worker.js`
- `juice-pwa.js`
- `tests/online-services.test.cjs`
- `.github/workflows/towerbound-checks.yml`
- `README.md`

### Commits on main
- `a62d36dccdfa3fab1672a8494b056628176c226a` — Network First HTML and SW lifecycle/cache version.
- `ca192a2b0844855b87a0c1c30959cb06229707d7` — iOS update checks and reload toast.
- `b70639b52797db4f88fe0e9610e43e7ce0e2461d` — PWA update regression assertions.
- `f5b04f80d8fc6f2fb1633df427209b0f4a9a6d34` — PWA syntax checks in CI.

**Verification boundary:** GitHub Actions and Pages deployment are triggered by these `main` commits. A real installed iPhone PWA session is not available from this repository workflow; the first launch after deployment should fetch the new worker, and the in-app toast is the manual fallback if a page reload is needed.


## 2026-11-10 — iPhone RPG UI and account access fixes

- Added `renderWithScrollSave()`: all existing `render()` calls now pass through a wrapper that captures the active `.tb-v2` scroll position and restores it immediately and on the next animation frame after DOM replacement.
- Localized the talent effect keys `attack`, `health`, `critical`, `defense`, and `attack_speed` to Russian labels. Quest/talent cards now keep Russian words intact and use fixed-width action buttons.
- Added iPhone safe-area top padding and scroll padding for the RPG root/header.
- Reworked the active skill loadout to persist up to six skill IDs in `c.activeSkills` (with backward compatibility for `skillLoadout`). Selecting a seventh skill opens a replacement dialog listing the six current slots. The battle panel and number-key shortcuts now address six active skill slots.
- Sanitized raw specialization/class tags in skill descriptions.
- Added an inline account panel to the «Аккаунт» profile tab. It exposes login/password, remember-me, sign-in/register, and signed-in sync/sign-out states through the existing Supabase client. The existing required Supabase sign-in gate is preserved; its sign-in form and the account-tab form use the same Supabase auth API.
- Bumped UI/CSS/cloud script cache versions and added static regression assertions.

### Files changed
- `rpg-rework-ui.js`
- `rpg-rework-ui.css.js`
- `towerbound-cloud.js`
- `index.html`
- `tests/online-services.test.cjs`
- `README.md`

**Code commit on `main`:** `9b5f8e70dcab814b7633d08048d3e033bb5de240`.

**Verification boundary:** source-level regression assertions were added. The actual Playwright iPhone viewport run, physical iPhone Safari/PWA interaction, live Supabase registration/login, and real skill selection inside a running battle must be confirmed by the triggered CI/browser jobs and/or a device session; they are not claimed as physically tested here.


## 2026-11-10 — Supabase username login validation and Russian errors

- New registrations and primary sign-ins now map normalized usernames to the syntactically standard synthetic address `login@towerbound.com`; the old `@towerbound.game` address is tried only as a sign-in compatibility fallback for accounts created before this fix.
- Registration always uses the new `.com` address. Supabase Email **Confirm Email must remain disabled** for synthetic usernames because these addresses are not player mailboxes.
- Mapped Supabase authentication errors to Russian: invalid credentials, invalid email, duplicate account and password-too-short cases. The cloud login dialog marks errors red.
- Added the registration hint below the form and localized/red error styling in the profile account form.
- Added regression assertions for the new address mapping, legacy sign-in fallback, Russian error messages and registration hint. Updated the cloud/UI asset cache keys to v16/v31.
- Live Supabase registration/login with `Test123` and `123456` was not executed: this repository session does not have a test Supabase user/session or permission to create an account in the project's Auth service. The automated source regression checks must be confirmed in GitHub Actions.
