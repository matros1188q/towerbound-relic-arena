# RPG expansion — seven additional classes

This layer adds seven classes alongside the original Warden, Ranger, Arcanist and Reaper. It is loaded after `rpg-mode.js` and keeps existing local saves compatible.

## Classes and specializations

| Class | Resource | Specializations |
|---|---|---|
| Assassin | Combo (100) | Bleed, poison, execution |
| Bishop | Faith (100) | Exorcism, healing, buffs |
| Dragonkin | Dragon essence (100) | Fire damage, ice tank, black-dragon magic |
| Destroyer | Rage (100) | Fast low-damage fists, slow heavy two-handed sword, wand + shield battle mage |
| Elemental Lord | Elemental charge (100) | Darkness curses, fast low-damage water, earth stun/control |
| Duelist | Tactical charges (5) | Dual-sword combo, sword-and-shield defense/counter, rapier parry/riposte |
| Shaman | Spirit bond (100) | Spirit possession/healing, dark-god curses, nature-infused dual maces |

Each of the 21 specializations has ten active skills, three passive effects and ten talents with three ranks each. Skill unlock names are tied to the existing 5-level unlock cadence. Combat hooks manage resource generation/spending, branch damage profiles, control, damage-over-time and defensive reactions.

## Забег, жизни и прогресс

- В забеге у персонажа три жизни. Каждая подтверждённая смерть расходует одну жизнь и снимает 30% опыта, заработанного в текущем забеге.
- После первой и второй смерти герой продолжает с текущего этапа с полным HP; экипировка и ранее сохранённый прогресс башни остаются на месте.
- После третьей смерти забег завершается, текущий этап возвращается к первому, а лимит жизней восстанавливается до трёх.
- Повторное прохождение даёт 50% базового опыта. Ускорение ×2 недоступно при первом прохождении этапа.
- Этапы 1–250 используют гаунтлеты на 3, 5 или 7 противников; каждый десятый этап — отдельный бой с одним боссом. Шанс элитного противника — 12%.

## Class gear

Each class has three specialization sets. Each set has six item slots and bonuses at 2, 4 and 6 pieces:
- 2 pieces: +5% specialization damage.
- 4 pieces: +10% damage mitigation.
- 6 pieces: +15% specialization power.

Specialization-themed legendary items can drop from elites and bosses and contribute to their set. A full six-piece set is needed for the final bonus.

## Sockets and stones

- Chisel: 2% drop chance from enemies; opens a socket (up to three sockets per item).
- Enhancement stones: 5% drop chance from map stage 100 onward. Drops are level I only.
- There are 42 stone variants: weapon and armor stones for each of the 21 class branches.
- Five stones of the same branch/type and level merge into one stone of the next level, up to level V.
- A socket accepts only a stone matching the current class and specialization.
- Weapon stones improve attack; armor stones improve defense. Socket effects scale with stone level.

## Refinement

Refinement uses a refinement stone, which drops at 10% from stage 30 onward. Maximum level is +20.

| Current refinement | Success | Failure |
|---|---:|---|
| +0 to +2 | 100% | — |
| +3 to +4 | 80% | −1 |
| +5 to +9 | 60% | −1 |
| +10 to +15 | 50% | reset to +10 |
| +16 to +19 | 50% | item destroyed |

The diamond-store safety potion protects one attempt from both downgrade and destruction. Chance potions add 10 or 20 percentage points. Full equipped glow requires six occupied gear slots: green +6–11, vivid green +12–15, blue +16–19, red at +20.

## Heroic enchantment

Enchant scrolls drop only in heroic mode: armor/accessory scroll 2%, weapon scroll 1%. Non-weapon equipment offers four choices (+5% magic damage, physical damage, magic defense or physical defense). Weapons offer four choices (+15% magic attack, physical attack, attack speed or critical chance). The player chooses one result per scroll.

## Economy

Silver drops per enemy: 18 normal, 42 elite, 110 boss. Silver shop contains the requested XP, healing and drop potions, five-plus convenience items, and a 7-day premium for 25,000 silver. Diamond shop contains the requested items and five convenience/power items. The listed donation packages are 100/100 RUB, 300/269 RUB, 500/449 RUB, 1,000/900 RUB and 5,000/4,500 RUB.

The browser build intentionally does not mint paid diamonds. There is no server or verified payment provider in this project; enabling real-money top-ups requires receipt verification and server-side currency crediting. See [ASSUMPTIONS.md](../ASSUMPTIONS.md).
