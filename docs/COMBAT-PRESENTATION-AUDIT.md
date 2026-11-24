## Publication addendum — 2026-11-03

**Published source:** `main`  
**Publication merge:** PR [#2](https://github.com/matros1188q/towerbound-relic-arena/pull/2), merge commit `cc863ce94970af7d389456c1a7da8cdc941cfce8`  
**Integrated source branch:** `feature/combat-and-presentation-pass`  
**Rollback:** the pre-existing backup branches and legacy tags remain available.

The audited seven-class implementation is now merged into `main`. The entry page on `main` references `rpg-mode.js`, `rpg-expansion.js`, `rpg-rework-v2.js`, `rpg-rework-ui.css.js` and `rpg-rework-ui.js`. The published `rpg-mode.js` contains all seven classes: Убийца, Епископ, Драконит, Разрушитель, Владыка стихий, Дуэлянт and Шаман. The 34 balance configs and 420-skill catalog are present on `main`.

The full-game audit and RPG CI passed on the exact feature-branch source commit `7e7717d6f6da28a6978ef46c67dad10be5c68237` (run [41703953943](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/41703953943)). The cross-browser run [41703953941](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/41703953941) was initially cancelled and its retry was still running at the time of this addendum; do not interpret that run as a pass. Physical iPhone Safari has not been manually certified.

The original audit text below records the state at the time it was written. Statements there that `main` was unchanged or that publication was pending are historical, superseded by this addendum.

---

# Combat & Presentation Pass — итоговый аудит

Дата: 2026-11-03  
Рабочая ветка: `feature/combat-and-presentation-pass`  
Проверенный runtime commit: `2eed2aecbdf5bd82d75a3c6de3ac0482614b66ba` (первый runtime commit этого прохода: `ed2659949a0658c4d1a3d766a0af9ea0408effa1`)

## Сохранность Git

- `main` не изменялась; проверенный HEAD: `23620ee7bd2a7d4d1488fb97d3a41737843749be`.
- Исходная семиклассовая версия сохранена тегом `legacy-before-combat-pass` → `f1e0f18e0169e6915425add78ccfafc78e24f2b8`.
- Резервная ветка `legacy-pre-combat-pass` указывает на тот же исходный commit.
- Рабочая ветка `feature/combat-and-presentation-pass` содержит проверенный результат; `fix/audit-pass` синхронизирована с ней как ветка аудита.
- Ветка не сливалась в `main`.

## Реализованная боевая система

| Система | Фактическое поведение |
|---|---|
| Боевой ритм | Единый интервал ответа противника — 2.5 секунды; ×2 использует 1.25 секунды и сохраняет действующие ограничения первого прохождения и XP. |
| Телеграфы | Есть типы сильного удара, яда и атаки по площади. Обычное окно — 1.8 секунды; конфигурация задаёт границы 1.5–2 секунды. Боссовые окна могут меняться по фазе. |
| Контр-умения | Все 7 классов имеют собственное контр-умение: Тень, Барьер, Чешуя, Рёв, Замедление, Парирование и Очищение. Неверный ID контр-умения больше не даёт бесплатное снижение урона. |
| Панель навыков | 6 слотов: 4 активных навыка, контр-умение в слоте 5, ультимейт в слоте 6. Слоты используют выбранный loadout. |
| Комбо | Для каждого класса настроены цепочки из 2–3 навыков; завершение применяет настроенный множитель урона и, где указано, гарантированный крит. |
| Цели и роли | Есть выбор живой цели; роли мобов: лекарь, ядовитый, танк и обычный. В стандартной группе первые роли гарантированно идут в порядке лекарь → яд → танк. Боссовый этап содержит одну цель. |
| Фазы босса | 4 фазы определяются долей оставшегося HP. По фазам меняются паттерны телеграфов, скорость атак и множитель урона; финальная фаза — опасная фаза добивания. |
| Ресурс | Обычный запас — 100, у Дуэлянта — 5; стартовый запас — 58%. Базовые стоимости: навык 22, контр 18, ультимейт 42; для Дуэлянта используются классовые стоимости 1/1/2. |
| Стихии | Уязвимость даёт ×1.5 урона, сопротивление — ×0.5. У противников отображаются уязвимость и сопротивление. |
| Классовые проки | Подключены проки Убийцы, Епископа, Драконита, Разрушителя, Владыки стихий, Дуэлянта и Шамана. |
| VFX и UI | Есть телеграфные вспышки, критический shake, цветовые эффекты стихий, индикация фаз босса, комбо и проков; интерфейс перестраивается под узкий экран. |

## Исправления этой итерации

1. Проверка ID контр-умения теперь сверяет его с конфигурацией текущего класса.
2. Очищение Шамана снимает уже действующий яд даже при контрировании неядовитого удара.
3. Прок Разрушителя применяется после переключения на следующего противника, поэтому не исчезает вместе со сбросом состояния цели.
4. Щит Драконита переносится через переход к следующей цели и расходуется на следующий входящий урон.
5. Исправлена пропущенная запятая в массиве CSS-строк `rpg-rework-ui.css.js`, из-за которой падал `node --check`.
6. Добавлен отдельный `tests/combat-runtime.test.cjs` и включён в RPG workflow. Тест покрывает 7 контр-умений, неверный ID, очищение, границы фаз, характеристики мобов/боссов, уязвимости/сопротивления, роли, одиночного босса, бюджет ресурса, структуру комбо и сохранение межцелевых проков.

## Сохранённые RPG-системы

Этот проход не переписывает базовую RPG. Сохранены 7 классов, 21 специализация, каталог 420 навыков, карта 250 этапов, прежние кривые HP/DPS, коэффициенты элиток ×3 HP / ×1.5 урон, боссов ×6 HP / ×2.5 урон, лут, прогрессия, экипировка, авто-бой, экономика и локальные PvP-системы.

## Проверка CI

Успешный GitHub Actions run: `41642015017` (runtime commit `ed2659949a0658c4d1a3d766a0af9ea0408effa1`).

Успешно завершились:
- `node --check` для RPG engine, UI, CSS и legacy-скриптов;
- `tests/rpg-expansion-static.cjs`;
- `tests/rpg-rework-v2.test.cjs`;
- `tests/combat-runtime.test.cjs`;
- Playwright Chromium: `tests/rpg-smoke.cjs`.

Результат workflow: **success**.

## Ограничения проверки

- Playwright smoke выполнялся в headless Chromium. Ручная сертификация на реальном iPhone Safari в этом проходе не выполнялась.
- Это браузерная игра с локальным состоянием; тесты не превращают локальные PvP/аккаунтные данные в серверный глобальный сервис.
- Реальный тайминг и ощущения боя на устройстве следует оценивать отдельно от автоматического smoke; кодовые проверки и браузерный smoke зелёные.

## Follow-up audit and presentation fixes — 2026-11-03

Final audited branch HEAD: `2eed2aecbdf5bd82d75a3c6de3ac0482614b66ba`.

### Additional defects fixed after the initial combat pass

1. Fixed the legacy unique-set drop path: the selected equipment slot now indexes `names[slot]`; the undefined `ix` reference is removed, and missing set/name data safely aborts the drop.
2. Aligned the legacy set system with the shared 2/3/5-piece thresholds: two pieces grant +5% profile damage, three grant +10% damage mitigation, and five grant +15% specialization skill power. The skill-power bonus is restricted to skill attacks.
3. Reworked the mobile combat panel: the six combat slots (four attack skills, counter, ultimate) stack vertically at the bottom; the basic attack remains a separate button; target cards remain above the controls. The mobile breakpoint is below 768px.
4. The `disable_telegraphs` accessibility/hardcore setting now hides the warning itself rather than only blanking its icon and label. The counter remains available as a blind timing action.
5. Boss attacks now trigger screen shake in every boss phase, not only phase four. Lethal damage also triggers the death-overlay shake unless screen shake is disabled.
6. Bumped the UI and CSS script cache versions so clients fetch the updated markup and styles.

### Expanded regression coverage

- Legacy expansion tests assert safe unique-drop indexing and the 2/3/5 set model.
- Combat tests assert telegraph windows (1.5–2.0s), phase-three 1.0s/×1.2 speed, phase-four 1.5s/×5 damage/Easy 10% remaining HP, +50% vulnerability, −50% resistance, 60–90s ultimate cooldowns, 2–3 combos per class, keyboard controls, accessibility settings and VFX hooks.
- Playwright smoke now checks the mobile vertical six-slot stack, target selection, a boss telegraph, counter use, lethal boss damage, death overlay, death shake and loss of exactly one Easy-mode life.

### Final CI

GitHub Actions run `41646530435` completed with **SUCCESS** on commit `2eed2aecbdf5bd82d75a3c6de3ac0482614b66ba`. All syntax checks, RPG static/runtime tests, combat regression tests and Playwright Chromium smoke passed.

### Branches, tag and rollback

- `feature/combat-and-presentation-pass` and `fix/audit-pass` contain the audited implementation.
- `main` remains unchanged at `23620ee7bd2a7d4d1488fb97d3a41737843749be`.
- `legacy-before-combat-pass` and `legacy-pre-combat-pass` both point to `f1e0f18e0169e6915425add78ccfafc78e24f2b8`.
- `legacy-pre-audit` preserves the pre-audit working head `6d9ac752187528a32d0c34cf35082e5f41fdff80` (see branch ref for the exact object ID).

To create a separate working branch from the pre-combat snapshot:
```bash
git fetch origin
git switch -c restore/pre-combat legacy-before-combat-pass
```

To revert the audit/combat follow-up commits from the feature branch without force-pushing:
```bash
git switch feature/combat-and-presentation-pass
git revert --no-edit 6d9ac752187528a32d0c34cf35082e5f41fdff80..HEAD
git push origin feature/combat-and-presentation-pass
```

### Verification boundary

The final smoke ran in headless Chromium at mobile viewport dimensions. It is not a manual certification on a physical iPhone or Safari; that remains unverified.


## Full-game integration audit — 2026-11-03

Added `tests/full-game-audit.cjs` and wired it into the RPG CI. It checks all 34 balance files, the seven classes and 21 specializations, all 210 talent definitions and 3 ranks per talent, all 420 skill catalog entries and their 420 individual JSON files, plus the manifest-to-config mapping. It exhaustively builds 250 map plans for each class (1,750 plans total, including 175 boss plans), validates stage counts and enemy matchups, and round-trips a saved active run for every class. It also validates 54 manifest-backed hero/enemy/boss/skill/synergy assets, the relic PNG collection, achievements, tutorial and equipment thresholds.

The cross-browser workflow now runs actual Playwright journeys in Chromium, Firefox and WebKit at desktop and mobile viewport sizes on the working feature branches. Character-rig asset QA and rig-runtime tests are also enabled on those branches. These are automated desktop browser engines; WebKit mobile viewport emulation is not a physical iPhone Safari certification.


### Cross-browser test correction

The initial cross-browser script was still driving the retired legacy title/hero flow and failed because its old `#enterArenaBtn` is hidden in the current RPG entry. It has been replaced with journeys against the current RPG UI: boot, seven-class creation screen, character creation, persisted reload, 250-stage map, horizontal-overflow check and uncaught/request failure checks across Chromium, Firefox and WebKit at desktop/mobile viewport sizes.


# Battle UI rework — audit and implementation report

Date: 2026-11-03  
Working branch: `fix/battle-ui-rework`  
Pre-change HEAD: `77305b8f6405f7d5a9ba9b8beed158540daab0de`

## Audit findings

- Active screen: `rpg-rework-ui.js`, `battleScreen()`, `render()`, `updateBattleStatus()`.
- Styling: `rpg-rework-ui.css.js`; the RPG root previously used `.tb-v2{position:absolute;inset:0;overflow:auto}`.
- Main jump source: every `render()` replaced `root.innerHTML` with a new battle screen. Combat actions and the 250 ms status loop both called it, destroying and recreating the entire subtree.
- Layout source: mobile CSS converted the combat layout to one column, made targets a horizontal scroll strip and made controls sticky with their own vertical scrolling. The screen was taller than the viewport.
- A source scan of active battle JS found no `scrollIntoView`, `window.scrollTo` or `scrollTop` calls. The jump came from DOM replacement and unconstrained overflow.

## What was / what is now

| Area | Before | After |
|---|---|---|
| Viewport | Auto-height page and scrollable RPG root | Fixed battle root, `100vh/100dvh`, overflow hidden |
| Body | Normal document flow | Fixed body and locked overflow/touch panning during battle |
| Combat updates | Full `root.innerHTML` replacement on attacks and status ticks | Stable battle subtree; HP/resource/target numbers and bars update in place |
| Header | Global RPG header above arena | Hidden in battle; pause and ×2 remain in arena top row |
| Hero HP | Hero block below enemy focus | Compact always-visible top HUD with red HP bar and class resource |
| Enemies | Horizontal scrolling target strip and oversized focus | Responsive compact grid with role, vulnerability, telegraph and HP bars |
| Actions | Vertical/scrollable skill stack | Attack button and six compact skills in a 2×3 grid |
| Potions | Large text buttons | Five compact buttons in one row |
| Combo hints | Persistent text block | Hidden from battle HUD |
| Damage feedback | No layout-independent damage number in this view | Absolute-positioned animated damage labels |
| Landscape | Same tall mobile stack | Enemy area centered with control column on the side |

## Files changed

- `rpg-rework-ui.js` — stable battle render key, in-place status updater, potion/skill/HP refresh and floating damage labels.
- `rpg-rework-ui.css.js` — fixed full-screen battle layout, dark/gold/red HUD, compact target grid, 2×3 skills, potion belt, portrait and landscape rules.
- `ASSUMPTIONS.md` — battle-specific implementation decisions and limitations.

## Verification

- RPG rework CI: **passed** — [run 41712146543](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/41712146543). Includes all five `node --check` checks, RPG static/runtime tests, combat runtime test, full-game audit and Chromium browser smoke.
- RPG expansion/browser smoke: **passed** — [run 41712146553](https://github.com/matros1188q/towerbound-relic-arena/actions/runs/41712146553).
- The Playwright smoke exercised a 375×812 viewport, all six skill buttons, a seven-card target-grid stress layout, portrait/landscape viewport containment, stable battle DOM identity and 20 rapid attack taps with unchanged `window.scrollY`.
- This is automated Chromium coverage, not a physical iPhone Safari certification. The exact real-device tap/rotation check remains manual.
