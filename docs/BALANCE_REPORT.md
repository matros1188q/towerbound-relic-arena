# Towerbound balance audit

Baseline: `fd532313e01199d7ce28d2e5fa398646760d7d70` (main).

## Method
- 1,000 deterministic simulations for each of 7 classes × 5 stages × 3 enemy types (105,000 encounters).
- Character level is interpolated from `character_curves.level_to_stage_anchors`.
- Medium gear: six Rare pieces at 48% of stage item level (capped at 120), with no refine/socket/set bonuses.
- Uses `createEngine`, `getCombatStats`, `getEnemyStats`, `basicAttackStats`, `mitigationMultiplier`, `damageTypeMultiplier`, `resolveReaction`, and `capBossDamage` from the game core.
- Economy run uses `beginStage` and `finishEnemy` for the real XP and silver awards, and the same encounter model for combat/potion usage.

## Combat results
Simulator output is recorded after its GitHub Actions run; do not assume target values are met before reviewing it.

| Class | Stage | Enemy | Win rate | Avg. turns | Avg. remaining HP | Potion use |
|---|---:|---|---:|---:|---:|---:|
| Pending CI run | — | — | — | — | — | — |

## Economy results
| Class | Cleared | Level | XP | Silver | Potions | Potion cost | 5-day silver | Premium |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Pending CI run | — | — | — | — | — | — | — | — |

## Changes
Pending measured results. Values will be listed as before → after with rationale.

## Assumptions and limitations
- Average gear is an explicit ilvl-only proxy, not a claim about a particular drop distribution.
- Encounter simulation models standard enemy stats and one counter/skill/ultimate action cycle; it does not reproduce every elite affix, all status effects, or the browser UI.
- Five-day premium affordability extrapolates the measured run duration and net silver over 25 hours of play. It is an estimate, not a guaranteed player outcome.
