# TowerBound arena background mapping
Date: 2026-11-24
Branch: main

The 18 files in `assets/Fon/` are assigned in their existing numeric order to the 18 arena locations. Each location owns a contiguous stage range; together the ranges cover stages 1–250 with no gaps or overlaps.

| Chapter | Stages | Location | Asset |
|---|---:|---|---|
| 1 | 1–16 | Затопленный сток | `image 25.jpeg` |
| 1 | 17–33 | Тюрьма | `image 26.jpeg` |
| 1 | 34–50 | Разрушенная комната с колоннами | `image 27.jpeg` |
| 2 | 51–63 | Руины с деревьями | `image 28.jpeg` |
| 2 | 64–76 | Грибное болото | `image 29.jpeg` |
| 2 | 77–88 | Ледяная пещера | `image 30.jpeg` |
| 2 | 89–100 | Раскаленная кузня | `image 31.jpeg` |
| 3 | 101–112 | Библиотека | `image 32.jpeg` |
| 3 | 113–125 | Святилище Света | `image 33.jpeg` |
| 3 | 126–137 | Обсерватория с шестеренками | `image 34.jpeg` |
| 3 | 138–150 | Гнездо пауков | `image 35.jpeg` |
| 4 | 151–166 | Алтарь Крови | `image 36.jpeg` |
| 4 | 167–183 | Разлом Пустоты | `image 37.jpeg` |
| 4 | 184–200 | Тронный Зал Теней | `image 38.jpeg` |
| 5 | 201–212 | Сердце Башни | `image 39.jpeg` |
| 5 | 213–224 | Небесная Бездна | `image 40.jpeg` |
| 5 | 225–237 | Логово Дракона (Золото) | `image 42.jpeg` |
| 5 | 238–250 | Финальные Врата | `image 43.jpeg` |

## Loading and transition behavior

- At battle entry, the UI identifies the location from `battle.stage`.
- It creates two background layers and crossfades their opacity over one second.
- The previous background is retained in memory across the map intermission so the next battle can fade from the prior location rather than flashing from an empty layer.
- Only the three or four files belonging to the active chapter are preloaded. Chapter 2 is not requested until a stage 51+ battle begins; the same rule applies at each later chapter boundary.
- The active chapter's preloads are replaced when the chapter changes. Images for future chapters are not requested at game startup.
- Reduced-motion preferences disable the fade animation.

The mapping follows the existing numeric order of the files in `assets/Fon`; it is not based on a visual inspection of each JPEG's contents.
