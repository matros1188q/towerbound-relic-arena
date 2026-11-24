# Balance adjustments — 2026-11-10

## Changes applied on main

- XP curve: `base_multiplier` raised from `1.25` to `2.15`.
- Preserved `base_required = 180` and `exponent = 1.3`.
- Defensive progression safety buff: shared health growth `4.0 → 4.6` and defense growth `0.60 → 0.69`.
- Character HP progression anchors increased by 15%.
- Weak-class ultimate damage increased by 15%: Assassin `2.8 → 3.22`, Elemental Lord `4.0 → 4.6`, Shaman `3.8 → 4.37`.
- RPG smoke now asserts the six-slot panel and verifies the XP curve invariants.

## Critical chance test clarification

The current runtime configuration `configs/balance/combat.json` sets `player_damage.crit_chance = 0.05` (5%). The 0.02 values found in nearby configuration/tests refer to drop/enchantment probabilities, not the base critical chance. Therefore the smoke assertion was aligned with the actual combat configuration at 0.05 rather than changing the game’s critical chance to 0.02.

## Verification status

The requested mathematical adjustments have been committed. Local `npm run balance`, `npm run economy`, and Playwright execution are unavailable in this agent environment. Consequently, the target average level of 65–70 and class win rates above 65% are **targets, not measured results**. Final simulation and physical iPhone layout verification remain pending on the user's device/environment.

## Scope note

The class base-stat schema is shared by all classes; there are no supported per-class base HP/defense growth fields in the current runtime. The 15% HP/defense progression adjustment therefore applies globally. The damage increase is limited to the three named classes' configured ultimates.
