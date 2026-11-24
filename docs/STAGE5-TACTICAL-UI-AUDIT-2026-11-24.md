# TowerBound Stage 5 — tactical combat UI audit
Date: 2026-11-24
Branch: main

## Delivered in this pass

- The battle panel now warns at 30% HP and switches to a stronger critical state at 15% HP.
- Recovery guidance reflects the actual healing-potion count and potion cooldown; otherwise it directs the player to use defensive cards.
- The first low-health threshold crossing is recorded in the active run's expedition history.
- Elite and boss enemy cards receive distinct threat labels; existing attack countdowns, enemy intents and boss phase markers remain in place.
- The battle journal now reads from a run-persistent `expeditionLog` (last 40 events), while the current combat event list remains bounded separately.
- Stage entry, stage completion, boss phase changes and existing combat events are written into the expedition history.
- Mobile styling was added for warning and threat states. Stylesheet and script cache versions were bumped, and the PWA cache was refreshed.

## Existing stage-5 systems retained

- Current/max hero HP and health bars.
- Enemy attack intent and countdown indicators.
- Boss phase progression and phase event messages.
- Mobile card hand, potion controls and visible End Turn control.
- Existing fixed-height mobile arena layout.

## Regression coverage added

`tests/rpg-smoke.cjs` now checks the expedition log, HP guidance, threat labels and mobile warning styles. The RPG and cross-browser workflows are configured to run on changes to the UI and tests.

## Validation boundary

The repository changes are committed on `main`. This audit does not claim a physical iPhone Safari playthrough. The live two-account social flow remains a separate Stage 4 manual check.
