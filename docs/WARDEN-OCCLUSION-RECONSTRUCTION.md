# Warden — occlusion and reconstruction specification

This is an authoring specification, not a finished rig or generated artwork. It records the anatomy that must exist behind the Warden's large foreground shield before any limb can rotate without exposing holes.

## Source-space anchors

All anchors use the existing 1024×1024 Warden annotation coordinates. The right shoulder → elbow → wrist chain is anchored at (565,212) → (588,370) → (648,474). The pelvis center is (431,565). These are pivot guides, not claims that the hidden anatomy is visible in the source.

## Required reconstruction, in order

1. **Pelvis backfill** — continuous underpainting below the waist skirt, connecting both thigh roots.
2. **Right upper arm** — reconstruct from pauldron/shoulder to elbow, behind the shield.
3. **Right forearm** — reconstruct elbow to wrist, fully extending under the shield.
4. **Right hand/grip** — restore the hidden hand/handle contact without changing the shield silhouette.
5. **Boot edge cleanup** — refine both feet and provide shin overlap at the ankle.

The exact machine-readable regions, anchors, draw order and acceptance checks are in `assets/characters/rigs/warden-occlusion-plan.json`.

## Layer order and constraints

The cape and rear limbs sit behind the torso. Reconstructed right-arm segments sit behind the shield. The shield remains a single clean foreground layer. The pelvis patch must continue under the skirt and thigh roots. Joint cuts must overlap under armor plates; splitting exactly on a visible edge is not acceptable.

## Current state

The existing polygon and SegFormer semantic masks are only candidates. They do not contain the missing pixels hidden by the shield. The semantic model's tiny `right-arm` result is not a usable anatomical segment. No Warden cutout rig is approved, and this specification does not mark any animation as complete.

## Acceptance gate

Do not build a production rig until all critical reconstruction PNGs exist, composites show no holes during ±20° joint tests, the shield remains foreground through every clip, and the result passes visual review at iPhone portrait scale.
