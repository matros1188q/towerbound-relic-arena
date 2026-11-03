# Assumptions — RPG expansion

- The existing four archetypes remain playable; the seven requested classes are additional.
- This repository has no account backend or database. Character progression, currency, inventory and premium state remain in localStorage, matching the current game.
- Diamond packs are displayed with exact prices but cannot safely credit currency until a server-side payment provider verifies receipts. No client-only payment shortcut is implemented.
- Existing six equipment slots are retained. Each item supports up to three sockets and stones are class/specialization-specific.
- A full glow requires all six equipment slots filled and every item to meet the threshold.
- Silver drops: 18 normal, 42 elite, 110 boss. This is an initial economy baseline to tune with telemetry.
- Refinement: +0–2 guaranteed; +3–4 80%; +5–9 60%; +10–15 50% with failure reset to +10; +16–19 50% with destruction on failure.
- This is a browser prototype: local save data is not cheat-resistant. Production economy and purchases require authenticated server-side persistence.
