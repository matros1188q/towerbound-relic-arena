# Towerbound: Relic Arena

A mobile-first, single-file fantasy autobattler prototype. No build tools or external dependencies required.

## Play locally

Open `index.html` in a modern browser. On GitHub Pages, publish the `main` branch from the root folder in **Settings → Pages**.

## Gameplay

- Build a squad of up to six relic towers.
- Buy random relics from the shop and merge identical relics up to three stars.
- Survive 10 increasingly difficult waves, including boss waves.
- Manage gold and health; unlock squad synergies.
- Progress is saved in the browser using localStorage.

Designed as an original game prototype for touch screens. No accounts or paid APIs are required.

## RPG expansion

Seven additional classes, 21 specializations, talent trees, class sets, sockets, stones, refinement, heroic enchantments and silver/diamond shop UI are documented in [docs/RPG-EXPANSION.md](docs/RPG-EXPANSION.md). The legacy class expansion is provided by `rpg-mode.js` and `rpg-expansion.js`; the active seven-class RPG rework is bootstrapped by `rpg-rework-v2.js` and `rpg-rework-ui.js`, with balance and skill data in `configs/`. The rework includes 250 stages, 21 specializations, 420 active skill definitions, talents, equipment progression, heroic mode and three lives per run. Regression and browser smoke tests are in `tests/` and run through GitHub Actions.
