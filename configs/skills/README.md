# Rework v2: skill catalog

The data catalog defines 420 skills (7 classes × 3 specializations × 20 entries). Skill levels are distributed between character levels 10 and 100. Each entry references an effect template in `configs/balance/skill_effects.json`; numerical balance remains configurable.

The records are kept in one generated JSON catalog to keep Git tree writes atomic and avoid hundreds of independent API updates. The IDs are stable and each record can be split into an individual JSON file without changing identifiers.
