# Towerbound Cutout Rig Player — Stage 3

The file `assets/js/character-rig-player.js` implements a dependency-free Canvas2D skeletal renderer for version-1 cutout rigs.

## Runtime API

```js
const canvas = document.querySelector('#actor-rig');
const rig = await fetch('./assets/characters/rigs/heroes/warden.rig.json').then(r => r.json());
const player = TowerboundRigPlayer.create(canvas, rig, {
  onEvent(event) { if (event.id === 'impact') playImpactFx(); }
});
await player.loadPromise;
player.play('attack');
```

The canvas is sized by its host. The player draws only authored transparent part images; it never slices or masks a flattened source portrait at runtime.

## Supported features

- Normalized local pivots and parent-child transforms.
- Independent translation, rotation, scale and opacity tracks per part.
- Keyframe interpolation with linear, step, ease-in, ease-out and ease-in-out timing.
- Deterministic z-index ordering.
- Clip events for anticipation, release, projectile, impact, recovery, footsteps and sound.
- Looping, playback rate, pause, resume, stop and destroy.
- Image loading once per player; no per-frame DOM creation or WebGL.

## Stage boundary

This is the runtime foundation, not a claim that roster art is already separated. Existing full PNG portraits remain the fallback until authored parts and required clips pass QA. Stage 4 will build and validate the four hero rigs before combat integration.
