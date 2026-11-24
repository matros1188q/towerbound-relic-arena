# Stage 4 — Hero rig authoring blueprints

This stage defines the authored anatomy and combat choreography for all four playable heroes. It deliberately does **not** claim that flattened portraits have been converted into separated art.

## Art source audit
The hero manifest contains four transparent 1024×1024 PNG portraits. They are single flattened images, not layered files. The repository does not contain independently authored limb/weapon/cloth layers or cutout source files. Automatic rectangular slicing would create visible seams and mismatched fragments, so it is prohibited.

## Blueprint
`assets/characters/rigs/hero-rig-blueprints.json` records:
- character-specific part hierarchy and parent relationships;
- distinct attack choreography, anticipation, release, impact/projectile and recovery events;
- unique idle and hit reactions;
- visual constraints (notably the Reaper retains the sword shown in source art).

These are authoring instructions and animation timing, not loadable rig manifests. They become runtime rigs only after every listed visible part is supplied as a clean transparent PNG with pivots, dimensions and authored overlap/occlusion fixes.

## Hero choreography targets
- **Warden:** shield brace, sword wind-up, diagonal sword swing, follow-through.
- **Ranger:** bow arm extension, draw elbow pull, string release, projectile launch.
- **Arcanist:** staff lift, free-hand energy gathering, spell-core charge and release.
- **Reaper:** broad shoulder wind-up, torso counter-rotation, sword sweep and empowered blade strike.

## Acceptance gate
A hero is not complete until all required parts are present, joints have clean overlap, idle/attack/hit/cast clips render on Canvas2D, events align with combat impact, and the result is visually checked at iPhone portrait viewport. Current status: four blueprints authored; zero hero cutout rigs certified.
