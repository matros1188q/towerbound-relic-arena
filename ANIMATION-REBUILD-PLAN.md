# Towerbound — 10-stage character animation rebuild

## Goal
Replace whole-image bobbing with authored 2D cutout rigs and readable attack choreography for all 4 heroes, 20 enemies and 9 boss artworks (plus the crimson-regent boss profile, which currently has no dedicated artwork).

## Animation architecture
- Preserve the current illustrated PNGs as the visual source of truth.
- Build per-character layered cutout rigs with transparent body parts, explicit pivots and z-order. Never stretch or slice a flattened sprite at runtime as a substitute for real parts.
- Use a shared runtime rig player, but per-character rig manifests and authored clips.
- Each attack clip has anticipation, action, impact/recoil and recovery markers. Gameplay damage timing is tied to the impact marker.
- Character-specific secondary motion: cloth, hair, capes, wings, tentacles, limbs, weapons, bows, staffs, spell hands and cores as applicable.
- Provide reduced-motion and low-performance fallbacks without changing combat logic.

## Ten implementation stages
1. **Asset and runtime audit** — inventory every character image, identify visible anatomy/equipment, confirm current actor rendering and combat hooks, define rig naming/pivot conventions. No claims of rigging until layers exist.
2. **Rig format and tooling** — add a versioned JSON rig schema, transparent-part export convention, pivot/z-order validation and a repeatable asset QA script.
3. **Animation runtime** — implement a lightweight mobile-safe 2D cutout rig renderer/player with parent-child transforms, pivot rotation, clip timelines, event markers, cancellation and cleanup.
4. **Hero rigging** — create independent rigs for Warden, Ranger, Arcanist and Reaper; author idle, move, attack, cast, hit, dodge and victory clips.
5. **Enemy rigging I** — rig the first 10 enemies, prioritizing humanoids, melee, ranged and caster archetypes; author individual attacks and reactions.
6. **Enemy rigging II** — rig the remaining 10 enemies, including beasts, spiders and large creatures; author anatomy-specific locomotion and attacks.
7. **Boss rigging I** — rig and animate the first four bosses with distinct multi-phase telegraphs, attacks, hit reactions and defeat clips.
8. **Boss rigging II** — rig the remaining five dedicated boss artworks and resolve the missing crimson-regent artwork/profile deliberately.
9. **Combat integration and polish** — synchronize hit markers with damage, projectile release, enemy telegraphs, active skills, status effects, death and victory; remove placeholder whole-sprite combat movement.
10. **Full QA and balance pass** — test all 4 heroes, 20 enemies and 9+ boss encounters on desktop and mobile; validate animation interruption, reduced motion, long fights, memory/DOM cleanup and combat timing.

## Stage 1 audit findings (2026-11-02)
- Character source art currently consists of single transparent PNGs, not separated limb/weapon layers: 4 heroes, 20 enemies and 9 dedicated boss images, generally 1024x1024 (some enemy art is 768x1024).
- Character manifests describe the artwork and IDs but do not contain rig parts, pivots, skeletons or animation clips.
- Character QA report lists 33 unique art roles and one boss profile without dedicated art: `boss.crimson-regent`.
- The existing visible actor fallback creates only two DOM images (`hero-illustrated.svg` and `foe-illustrated.svg`), so it does not display the 33 character PNGs as articulated rigs.
- Existing combat code has profile labels and whole-image movement; these are not articulated animation.
- The previous stage-5 choreography changes remain provisional whole-image/effect animation and must be replaced as the rigged runtime comes online.

## Acceptance gate
A character is not marked complete merely because it has an animation profile. It must have validated transparent part assets, pivots, at least idle/attack/hit clips, correct impact event timing, and a visual QA result at phone viewport size.
