# Balance & Content Pass — audit before changes

Audit baseline: `d7e32d188962dc610c566da0e2c9f9c787515cc2` (the current `feature/rework-v2` build). This is the actual latest RPG rework available through the connected GitHub repository. The repository's `main` branch is older and PR #1 is still a draft; the user statement that the rework was already merged into `main` did not match GitHub state.

Legend: **Implemented** = behavior exists; **Missing** = no implementation found; **Different** = an implementation exists but does not satisfy the supplied target.

| Step | Audit result before changes | Evidence / gap |
|---|---|---|
| 2. Combat speed, ×2, attack interval | **Different** | `combat_speed_base=0.5`, ×2 and ×0.8 XP penalty exist. Enemy response is scheduled from `base_response_ms=1800`; at 0.5× that produces 3.6 s, not the required 2.5 s. No single authoritative attack interval governs enemy attacks, DoT/HoT and all animation timing. |
| 3. Player / mob stat curves | **Missing / Different** | No requested HP/DPS anchor curves exist. Player HP and attack use linear `100 + 4/level` and `12 + 1.5/level`; enemy HP/damage use linear stage formulas. No item-inclusive curve model exists. |
| 4. Bosses and elites | **Different** | Current enemy config uses elite HP ×2 / damage ×1.3 and boss HP ×10 / damage ×1.8. Required values are elite ×3 / ×1.5 and boss ×6 / ×2.5. |
| 5. 3/5/7 gauntlets | **Different** | Boss is solo every tenth stage, but 7 enemies are assigned deterministically to every stage divisible by 25, including disallowed 25/50/125/150/175. No 50/30/20 distribution exists. |
| 6. Item level | **Missing** | Equipment drops have flat rarity/level stats but no item-level field, no 120 cap and no 0.07% per-item-level stat scaling. |
| 7. BP and PvP tiers | **Different** | Current BP is `attack×3 + defense×2 + HP×0.3 + level×5`; it does not meet the supplied level/gear anchors or tier thresholds. Heroic mode is unlocked by stage completion only, not BP 15,000. |
| 8. Potion belt | **Different** | One healing potion per enemy and 25% max-HP healing already exist; stack limit is 25. There is no five-slot quick-access belt. Healing skills and potion use are not fully gated for elite/boss fights. |
| 9. Silver / vampirism | **Different** | Silver currently pays 18 normal / 42 elite / 110 boss, rather than the stage brackets 4/6/9/12/16. Healing items do not match the 40-silver price. Premium only has a 25,000 silver 7-day offer. There is no shared, data-driven damage-based vampirism rule for all classes. |
| 10. Easy / Normal / Hardcore | **Missing** | No selectable run difficulty or ruleset exists. A three-life rule had been added, but it is not the requested Easy/Normal/Hardcore model. |
| 11. Death item loss | **Different** | Loss chance is a single 30% value and the chosen item is uniform from run-found backpack items. It is not weighted by rarity, and Hardcore/Easy variants do not exist. Equipped gear is naturally excluded; boss loot is protected. |
| 12. Stone crafting | **Different** | Five matching stones merge into the next tier. There is no 20-material → level-I recipe and no elite/boss material drops at 10/50. |
| 13. Chisel / stones / scroll sources | **Different** | Chisel 2% from any enemy exists. Enhancement stones 5% from stage 100 currently drop from any enemy; required source is elite/boss only. Armor scroll 2% heroic-only is close; weapon scroll 1% currently drops from any heroic enemy, not only elite/boss. |
| 14. Async PvP | **Missing / Different** | A PvP stat snapshot helper exists, but `pvp.enabled=false`. No seven-day ghost snapshots, matching, daily duel limits, account PvP points or PvP shop exist. |
| 15. Seasons / dailies | **Different** | Daily boss, three daily quests and a daily-selected modifier exist. Quest targets are currently 20 elite kills / 10 stages / 5 skills, versus 10 / 15 / 5 branch skills. There are only three modifiers; no quarterly season lock, first-clear seasonal cosmetic or actual weekly top-100 payout. |
| 16. Critical supporting systems | **Different / Missing** | Character-level premium/XP basics exist, but account level, one-time starter grant, 20-slot shared stash, five-character cap, confirm-by-name deletion/reset, tutorial, 30 achievements, 25 lore entries, persistent 20-event combat log, pause/focus behavior, full settings UI, elemental/physical resist model and paragon are absent. Critical base chance is 5%, but multiplier is 1.8 instead of 1.5. Armor reduction is not the requested attacker-level formula. HP regeneration between stages exists. |

## Preservation and branch state

- Backup branch created: `legacy-pre-balance-pass`, at the audit baseline SHA above.
- Work branch created: `feature/balance-and-content-pass`, from the same SHA.
- A Git tag named `legacy-before-balance-pass` was not created: the connected GitHub tool exposes branch/ref movement but no Git tag creation operation. The backup branch is an exact rollback point; it is not misrepresented as a tag.
- No changes have been made to `main`.
