# Assumptions — RPG expansion

- The existing four archetypes remain playable; the seven requested classes are additional.
- This repository has no account backend or database. Character progression, currency, inventory and premium state remain in localStorage, matching the current game.
- Diamond packs are displayed with exact prices but cannot safely credit currency until a server-side payment provider verifies receipts. No client-only payment shortcut is implemented.
- Existing six equipment slots are retained. Each item supports up to three sockets and stones are class/specialization-specific.
- A full glow requires all six equipment slots filled and every item to meet the threshold.
- Silver drops: 18 normal, 42 elite, 110 boss. This is an initial economy baseline to tune with telemetry.
- Refinement: +0–2 guaranteed; +3–4 80%; +5–9 60%; +10–15 50% with failure reset to +10; +16–19 50% with destruction on failure.
- This is a browser prototype: local save data is not cheat-resistant. Production economy and purchases require authenticated server-side persistence.


## Balance and content pass — decisions and boundaries

- The active seven-class implementation is on `feature/balance-and-content-pass`. At the start of this pass its HEAD was `16bb1fcc63a24b3b476d9ff44024fb66eb6cf419`; `main` remained the older four-class prototype and was not changed.
- A precise rollback branch for that starting HEAD is `backup/balance-pass-before-20261103`. The name `legacy-pre-balance-pass` was already occupied by an older rework revision and was not moved. The connected GitHub action set does not expose a Git-tag creation operation, so `legacy-before-balance-pass` could not truthfully be reported as created.
- The HP/DPS curve is treated as gear-inclusive and divided by 1.5 before item bonuses. The requirement's example base DPS 2925 is approximate: 4400 / 1.5 = 2933.33. Six ilvl120 items yield 50.4%, as explicitly specified.
- Exact per-mob silver brackets (4/6/9/12/16) take precedence over the broad 13–14k whole-run estimate. The latter depends on random group sizes and is not a second drop rule.
- A season with `swift_enemies` changes each foe response interval to `2.5 / 1.2` seconds. Under `cursed_levels`, every fifth map stage (5,15,…,245) has doubled foe HP and damage. This is a deterministic interpretation of “cursed levels ×2”.
- A 250-stage clear does not auto-enter heroic under 15,000 BP. The final stage remains replayable to allow the character to increase BP.
- PvP ghost records, account PvP points, stash, cosmetics and weekly rating are browser-local in this prototype. They do not provide globally shared matchmaking, cross-device account sync, anti-cheat or a true public top-100 without an authenticated backend.
- Purchases with real money are not credited by browser code; diamond pack display is not proof of a completed payment.

## Combat & presentation follow-up — 2026-11-03

- Mobile combat layout uses a vertical bottom stack for the six configured slots; basic attack is separate and target cards stay above the panel.
- `disable_telegraphs` hides the telegraph warning visual while leaving the counter input available for blind timing.
- Screen shake is disabled by `disable_screen_shake`; boss-hit and death shake use the same accessibility setting.
- Skill flashes are disabled by `disable_skill_flashes`.
- Legacy set bonuses are aligned to 2/3/5 pieces and unique-set drops use the selected slot index.
- The follow-up branch is verified by GitHub Actions run `41646530435`; real-device iPhone Safari behavior is not claimed as tested.


## Battle UI rework — 2026-11-03

1. The active battle UI is rendered by `rpg-rework-ui.js` inside `#tbRpg`; the legacy arena in `index.html` is not the active RPG battle view.
2. The six action buttons are the four configured loadout skills plus the class counter ability (slot 5) and ultimate (slot 6). Five potion slots remain governed by existing potion-belt and difficulty rules.
3. Battle is a full-screen game mode. The global RPG header is hidden while active; pause and ×2 remain in the arena header.
4. Target cards remain selectable. Three columns are used up to 768px; wider layouts can fit four. Seven targets use compact rows, never an inner scroll list.
5. Combat state changes that do not change selected target, roster, pause state, boss phase or telegraph presence update the existing DOM in place. Structural transitions may rebuild once.
6. Document scrolling and touch panning are locked during battle and restored when leaving it.
7. The requested annotated Git tag could not be created because no create-tag/ref action is exposed by the connected GitHub integration. A rollback branch, `legacy-pre-battle-ui-rework`, was created at the exact pre-change HEAD `77305b8f6405f7d5a9ba9b8beed158540daab0de`; it is a branch, not a tag.
8. Physical iPhone Safari cannot be driven by the available GitHub connector. Automated browser checks and final real-device verification must be reported separately.
