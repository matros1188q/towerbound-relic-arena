# Каталог изображений меню персонажа

Все 17 исходных JPG визуально проверены и распределены. Файлы перемещены в `assets/ui/sections/` без перекодирования и без изменения пикселей; Git сохраняет исходную историю.

| Новый файл | Что изображено | Назначение |
|---|---|---|
| [reward-treasure-chest.jpg](../../assets/ui/sections/reward-treasure-chest.jpg) | Treasure chest with green gems | Reward and treasure illustration |
| [profile-assassin-closeup.jpg](../../assets/ui/sections/profile-assassin-closeup.jpg) | Hooded assassin close-up portrait | Character category card art |
| [talents-hourglass.jpg](../../assets/ui/sections/talents-hourglass.jpg) | Hourglass surrounded by green magic | Talent tree / progression screen art |
| [forge-lava-hall.jpg](../../assets/ui/sections/forge-lava-hall.jpg) | Wide forge hall with glowing lava floor | Crafting screen background |
| [profile-armored-knight.jpg](../../assets/ui/sections/profile-armored-knight.jpg) | Armored hooded knight beneath a moonlit castle | Secondary hero/profile illustration |
| [talents-crystal-tree.jpg](../../assets/ui/sections/talents-crystal-tree.jpg) | Tree with golden and emerald crystal leaves | Talent and growth category art |
| [merchant-emerald-coins.jpg](../../assets/ui/sections/merchant-emerald-coins.jpg) | Pile of gold coins with green gems | Card merchant / currency section art |
| [profile-crystal-corridor.jpg](../../assets/ui/sections/profile-crystal-corridor.jpg) | Stone corridor illuminated by crystal clusters | Character stats screen backdrop |
| [talents-archivist.jpg](../../assets/ui/sections/talents-archivist.jpg) | Hooded archivist studying a map | Talent lore / progression secondary art |
| [forge-workshop-wide.jpg](../../assets/ui/sections/forge-workshop-wide.jpg) | Wide blacksmith workshop with anvils | Crafting section backdrop |
| [forge-blacksmith.jpg](../../assets/ui/sections/forge-blacksmith.jpg) | Blacksmith hammering a glowing blade | Crafting feature illustration |
| [stash-gold-vault.jpg](../../assets/ui/sections/stash-gold-vault.jpg) | Open vault filled with gold | Stash / treasury screen art |
| [forge-glowing-ingot.jpg](../../assets/ui/sections/forge-glowing-ingot.jpg) | Glowing hot ingot on an anvil | Forge action illustration |
| [inventory-adventurer-pack.jpg](../../assets/ui/sections/inventory-adventurer-pack.jpg) | Leather backpack with green potions and maps | Inventory / backpack screen art |
| [collection-armor-set.jpg](../../assets/ui/sections/collection-armor-set.jpg) | Complete dark steel armor set laid out | Collection / equipment category art |
| [profile-assassin-fullbody.jpg](../../assets/ui/sections/profile-assassin-fullbody.jpg) | Hooded dual-blade fighter with green spectral blades | Full-body assassin illustration |
| [card-library-floating-cards.jpg](../../assets/ui/sections/card-library-floating-cards.jpg) | Four magical cards floating in a library | Card library category art |

## Подключение в интерфейсе

- Пять карточек главного меню профиля получают иллюстрированные фоны: герой, таланты, библиотека карт, коллекция, развитие.
- Внутренние экраны используют тематические изображения: характеристики, древо талантов, экипировка, рюкзак, реликвии, торговец картами и кузница.
- Дополнительные портреты и иллюстрации сокровищ оставлены в каталоге как тематические ресурсы для следующих экранов.
- Точные пути, SHA и роли перечислены в `assets/ui/sections/profile-art-manifest.json`.

## Примечания

- В коде четыре группы вкладок (`ГЕРОЙ`, `КОЛОДА`, `КОЛЛЕКЦИЯ`, `РАЗВИТИЕ`) и пять карточек-переходов на главном экране профиля. Новая игровая вкладка не добавлялась.
- Портреты семи классов остаются прежними; новые JPG не подменяют `classPortraits`.
- Изменения ограничены визуальными ресурсами и CSS. Бой, баланс, прогресс, сохранения и игровые данные не менялись.
