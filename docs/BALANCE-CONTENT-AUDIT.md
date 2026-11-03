# Balance & Content Pass — final audit

## Final verification

<badge>Green · GitHub Actions</badge>

- Successful workflow run: `41636072851`.
- Verified code head for that run: `7cd961478491b43c2517bffa66ed95b35eb2f4bf`.
- All steps succeeded: `node --check` for the RPG engine/UI/CSS and legacy scripts; static seven-class expansion checks; full engine/config regression suite; Playwright Chromium browser smoke.
- The later documentation-only commit does not alter runtime code. The most recent runtime code exercised by CI is the successful head above.

## Implemented and checked

| Requirement | Final status |
|---|---|
| Combat cadence and ×2 | One configured 2.5-second base enemy interval; ×2 sets 1.25 seconds and retains the 0.8 XP multiplier; first-clear speed restriction remains enforced. |
| HP/DPS curves | Gear-inclusive character curves use the configured 1.5 divisor and per-item-level bonus; engine and arena UI consume the same enemy-stat source. |
| Normal / elite / boss | Elite uses ×3 HP and ×1.5 damage; boss uses ×6 HP and ×2.5 damage; stage-10 newbie boss exception is retained. |
| Enemy groups | Bosses remain solo every tenth stage. Seven-enemy gauntlets are permitted only on configured ranges 51–100 and 200–250; tests avoid boss floors when sampling gauntlet rules. |
| Item level and BP | Item level is capped at 120, +0.07% main stat per item level; BP anchors and five tiers are regression-tested; heroic requires 15,000 BP. |
| Potion belt | Five quick slots, assigned-stack consumption, one potion per enemy and +40% maximum HP; Hardcore disables the belt; elite/boss healing-skill restrictions are enforced. |
| Economy and vampirism | Stage silver brackets 4/6/9/12/16; consumable and premium prices are config-driven; vampirism applies to actual direct and DoT damage with class fractions. |
| Difficulty and death | Easy / Normal / Hardcore rules for lives, XP loss, checkpoints, auto-battle and belt; backpack item loss is rarity-weighted; equipped and boss-loot items are protected. |
| Materials and equipment drops | 20 crafting materials create a level-I specialization stone; five matching stones merge to the next rank; elite/boss material rewards are 10/50; salvage converts equipment into materials. |
| Chisel, enhancement stones and scrolls | Source eligibility is centralized and tested: chisel from any enemy; enhancement stones from elite/boss from stage 100; armor scrolls from heroic enemies; weapon scrolls from heroic elite/boss. |
| PvP | Seven-day ghost snapshots, tier-window matching with bot fallback, daily limits, account PvP points, duel simulation, PvP store and one class epic per class/account. |
| Seasons and dailies | Quarterly season modifier locked at run start; daily modifier and three quests; elite-kill and branch-skill metrics feed daily progress; daily boss is available once per day; local weekly top-100 list. |
| Account and supporting systems | Account level/cap, one-time starter grant, five-character cap, 20-slot shared stash and transfer binding, double-confirm reset/delete, six-step tutorial, 30 achievements, 25 unique lore entries, 20-event combat log, settings, focus pause and paragon. |
| Regression and browser verification | 30 runtime config files load in engine tests; seven classes / 21 branches / 420 skills; browser smoke covers creation, persistence, map, branch/talent, equip/refine, salvage/craft, shop, settings, tutorial, PvP and ×2. |

## Preserved branch state

- Work branch: `feature/balance-and-content-pass`.
- Exact pre-pass rollback branch: `backup/balance-pass-before-20261103` → `16bb1fcc63a24b3b476d9ff44024fb66eb6cf419`.
- `main` remained at `23620ee7bd2a7d4d1488fb97d3a41737843749be` during verification.
- GitHub compare showed the work branch ahead of `main`; no merge was performed.
- The pre-existing `legacy-pre-balance-pass` branch was not moved because it already referred to an older revision.
- A Git tag was not created: the connected GitHub actions expose branch creation/commit updates but not a Git-tag creation operation. The exact rollback branch is the available restore point.
- The older open draft PR #1 remains untouched and targets a different head branch.

## Boundaries that are not represented as production services

- Account data, PvP ghosts, matchmaking, PvP currency, stash and weekly ranking are browser-local. They do not provide cross-device sync, protected global competition or anti-cheat.
- The daily boss is currently resolved by a deterministic prototype combat-power/round calculation from the account screen, not by a separate full animated arena encounter.
- Real-money diamond payments are not integrated. Displayed package prices do not prove or grant a payment.
- Browser UI smoke is executed in headless Chromium at a mobile-sized viewport; this is not a manual iPhone Safari certification.
- GitHub Pages deployment settings were not changed. To serve this branch, configure Pages to publish `feature/balance-and-content-pass` from the root; publishing `main` still serves the preserved baseline until an explicit merge.
