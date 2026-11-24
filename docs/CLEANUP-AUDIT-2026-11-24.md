# TowerBound cleanup audit — 2026-11-24

## JavaScript entry points and mechanics

- All 17 root JavaScript modules are loaded from `index.html`; the repository integrity test enforces this. No root module was removed because no entry point was proven dead.
- The large RPG/UI modules contain delegated listeners and compatibility paths. A duplicate-looking listener is not sufficient evidence that it is redundant; no gameplay handler or legacy bridge was removed without a full dependency proof.
- The inspected core modules had no repeated local function declaration names. The extension modules scanned for global exports showed no duplicate `window.*` exports.
- Existing combat, save, progression, social, endgame and cloud modules remain intact.

## Asset and work-material separation

- All 550 talent PNG files remain in the active runtime directory `assets/talents/`. The seven-class talent tree currently references 425 distinct icon paths; the remaining atlas PNGs are retained and must not be treated as disposable. `tests/cleanup-boundaries.test.cjs` verifies the 550-file inventory and all 425 referenced paths. The `art-inbox/06-other/talent-atlas-slices/` folder is work-material documentation only and contains no duplicate PNGs.
- `assets/Castoms/images_126_cropped.zip` was a source archive, not a runtime asset; it is preserved in `art-inbox/06-other/`.
- The 16 custom item images in `assets/Castoms/` remain in place because the shop/relic artwork manifest maps them to live game products.
- The six class, enemy, boss, relic, skill and UI artwork manifests remain in their active asset folders.
- 34 groups of identical Git blobs were found. Most are cross-category copies (for example, relic/icon paths or boss/enemy art) and may be referenced under different runtime paths. They were deliberately not deduplicated or deleted.
- Existing `art-inbox/`, `scripts/`, `annotations/` and `docs/` remain separate from runtime entry points.

## Guardrails added

- `tests/cleanup-boundaries.test.cjs` verifies that archived art remains present, active custom shop/relic art is not removed, and runtime sources do not import work-material paths.
- The cleanup-boundary test is appended to `npm run test:polish`, so it runs in the existing regression workflow.
