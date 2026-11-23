'use strict';

const CACHE = 'towerbound-v510';
/* Three-zone card battle arena and post-battle loot layout */
const SHELL = [
  './',
  './index.html',
  './configs/talents_tree.json',
  './manifest.json',
  './juice-pwa.css',
  './native-pwa.css',
  './juice-pwa.js',
  './rpg-mode.js',
  './rpg-expansion.js',
  './rpg-rework-v2.js',
  './styles.css',
  './rpg-rework-ui.js',
  './towerbound-polish.js',
  './towerbound-engine.js',
  './combat-visuals.js',
  './progression-24.js',
  './social-endgame.js',
  './supabase-config.js',
  './towerbound-cloud.js',
  './towerbound-online.js',
  './rpg-2000h.css',
  './card-codex.css',
  './assets/ui/logo.jpeg',

  './assets/ui/art-sprites.css',
  "./assets/characters/bosses/void-hunter-boss.png",
  "./assets/characters/bosses/soul-devourer.png",
  "./assets/characters/bosses/root-titan.png",
  "./assets/characters/bosses/bone-colossus.png",
  "./assets/characters/bosses/abyss-queen.png",
  "./assets/characters/heroes/warden.png",
  "./assets/characters/heroes/reaper.png",
  "./assets/characters/heroes/ranger.png",
  "./assets/characters/heroes/arcanist.png",
  "./assets/skills/image_17.png",
  "./assets/relics/image 19.png",
  "./assets/relics/image 17.png",
  "./assets/relics/image 16.png",
  "./assets/relics/image_15.png",
  "./assets/relics/image 13.png",
  "./assets/relics/image 11.png",
  "./assets/characters/heroes/image-Photoroom.png",
  "./assets/characters/heroes/image_2-Photoroom(1).png",
  "./assets/characters/heroes/image_3-Photoroom.png",
  "./assets/characters/heroes/image_4-Photoroom.png",
  "./assets/characters/heroes/image_5-Photoroom.png",
  "./assets/characters/heroes/image_6-Photoroom.png",
  "./assets/characters/heroes/image_7-Photoroom.png",
  "./assets/characters/enemies/image_2.png",
  "./assets/characters/enemies/image_3.png",
  "./assets/characters/enemies/image_4.png",
  "./assets/characters/enemies/image_5.png",
  "./assets/characters/enemies/image_6.png",
  "./assets/characters/enemies/image_7.png",
  "./assets/characters/enemies/image_8.png",
  "./assets/characters/enemies/image_9.png",
  "./assets/characters/enemies/image_10.png",
  "./assets/characters/enemies/image_11.png",
  "./assets/characters/enemies/image_12.png",
  "./assets/characters/enemies/image_13.png",
  "./assets/characters/enemies/image_14.png",
  "./assets/characters/enemies/image_15.png",
  "./assets/characters/enemies/image_16.png",
  "./assets/characters/enemies/image_17.png",
  "./assets/characters/enemies/image_18.png",
  "./assets/characters/enemies/image_20.png",
  "./assets/characters/enemies/image.png",
  "./assets/characters/enemies/grave-archer.png",
  "./assets/characters/bosses/mirror-executioner.png",
  "./assets/characters/bosses/image_3.png",
  "./assets/characters/bosses/image_4.png",
  "./assets/characters/bosses/image_11.png",
  "./assets/characters/bosses/image_12.png",
  "./assets/chapters/image_2.jpeg",
  "./assets/chapters/image_3.jpeg",
  "./assets/chapters/image_4.jpeg",
  "./assets/chapters/image_5.jpeg",
  "./assets/chapters/image.jpeg",
  "./assets/relics/image_2.png",
  "./assets/relics/image_3.png",
  "./assets/relics/image_4.png",
  "./assets/relics/image_5.png",
  "./assets/relics/image_6.png",
  "./assets/relics/image_7.png",
  "./assets/relics/image_8.png",
  "./assets/relics/image_9.png",
  "./assets/relics/image_10.png",
  "./assets/relics/image_12.png",
  "./assets/relics/image_14.png",
  "./assets/relics/image_18.png",
  "./assets/icons/image_5.png",
  "./assets/icons/image_11.png",
  "./assets/icons/image_13.png",
  "./assets/icons/image 14.png",
  "./assets/icons/image_15.png",
  "./assets/icons/image_16.png",
  "./assets/icons/image_17.png",
  "./assets/icons/image_19.png",
  "./assets/icons/image.png",
  "./assets/ui/art-manifest.json",
  "./configs/cards/art_manifest.json",
  "./assets/cards/strike.png",
  "./assets/cards/defend.png",
  "./assets/cards/dash.png",
  "./assets/cards/precise_shot.png",
  "./assets/cards/iron_skin.png",
  "./assets/cards/backstab.png",
  "./assets/cards/heavy_blow.png",
  "./assets/cards/focus.png",
  "./assets/cards/ghost_step.png",
  "./assets/cards/x_barrage.png",
  "./assets/cards/vengeance_x.png",
  "./assets/cards/dagger.png",
  "./assets/cards/summon_daggers.png",
  "./assets/cards/inspiration.png",
  "./assets/cards/rampage.png",
  "./assets/cards/gear_sword_cleave.png",
  "./assets/cards/gear_staff_bolt.png",
  "./assets/cards/gear_iron_wall.png",
  "./assets/cards/gear_evasion.png",
  "./assets/cards/gear_power_surge.png",
  "./assets/cards/curse_wound.png",
  "./assets/cards/curse_doubt.png",
  "./assets/cards/status_slime.png",
  "./assets/cards/assassin_poison_blade.png",
  "./assets/cards/assassin_bleed.png",
  "./assets/cards/assassin_shadow.png",
  "./assets/cards/assassin_bleed_edge.png",
  "./assets/cards/assassin_bleed_mastery.png",
  "./assets/cards/assassin_poison_edge.png",
  "./assets/cards/assassin_poison_mastery.png",
  "./assets/cards/assassin_execution_edge.png",
  "./assets/cards/assassin_execution_mastery.png",
  "./assets/cards/assassin_bleed_core.png",
  "./assets/cards/assassin_bleed_utility.png",
  "./assets/cards/assassin_poison_core.png",
  "./assets/cards/assassin_poison_utility.png",
  "./assets/cards/assassin_execution_core.png",
  "./assets/cards/assassin_execution_utility.png",
  "./assets/cards/destroyer_crush.png",
  "./assets/cards/destroyer_warcry.png",
  "./assets/cards/destroyer_fists_edge.png",
  "./assets/cards/destroyer_fists_mastery.png",
  "./assets/cards/destroyer_greatsword_edge.png",
  "./assets/cards/destroyer_greatsword_mastery.png",
  "./assets/cards/destroyer_wand_shield_edge.png",
  "./assets/cards/destroyer_wand_shield_mastery.png",
  "./assets/cards/destroyer_fists_core.png",
  "./assets/cards/destroyer_fists_utility.png",
  "./assets/cards/destroyer_greatsword_core.png",
  "./assets/cards/destroyer_greatsword_utility.png",
  "./assets/cards/destroyer_wand_shield_core.png",
  "./assets/cards/destroyer_wand_shield_utility.png",
  "./assets/cards/bishop_prayer.png",
  "./assets/cards/bishop_divine_shield.png",
  "./assets/cards/bishop_smite.png",
  "./assets/cards/bishop_exorcism_edge.png",
  "./assets/cards/bishop_exorcism_mastery.png",
  "./assets/cards/bishop_healing_edge.png",
  "./assets/cards/bishop_healing_mastery.png",
  "./assets/cards/bishop_buffs_edge.png",
  "./assets/cards/bishop_buffs_mastery.png",
  "./assets/cards/bishop_exorcism_core.png",
  "./assets/cards/bishop_exorcism_utility.png",
  "./assets/cards/bishop_healing_core.png",
  "./assets/cards/bishop_healing_utility.png",
  "./assets/cards/bishop_buffs_core.png",
  "./assets/cards/bishop_buffs_utility.png",
  "./assets/cards/dragonkin_flame.png",
  "./assets/cards/dragonkin_frost.png",
  "./assets/cards/dragonkin_meteor.png",
  "./assets/cards/dragonkin_fire_dragon_edge.png",
  "./assets/cards/dragonkin_fire_dragon_mastery.png",
  "./assets/cards/dragonkin_ice_dragon_edge.png",
  "./assets/cards/dragonkin_ice_dragon_mastery.png",
  "./assets/cards/dragonkin_black_dragon_edge.png",
  "./assets/cards/dragonkin_black_dragon_mastery.png",
  "./assets/cards/dragonkin_fire_dragon_core.png",
  "./assets/cards/dragonkin_fire_dragon_utility.png",
  "./assets/cards/dragonkin_ice_dragon_core.png",
  "./assets/cards/dragonkin_ice_dragon_utility.png",
  "./assets/cards/dragonkin_black_dragon_core.png",
  "./assets/cards/dragonkin_black_dragon_utility.png",
  "./assets/cards/elemental_chain.png",
  "./assets/cards/elemental_storm.png",
  "./assets/cards/elemental_meditation.png",
  "./assets/cards/elemental_darkness_edge.png",
  "./assets/cards/elemental_darkness_mastery.png",
  "./assets/cards/elemental_water_edge.png",
  "./assets/cards/elemental_water_mastery.png",
  "./assets/cards/elemental_earth_edge.png",
  "./assets/cards/elemental_earth_mastery.png",
  "./assets/cards/elemental_darkness_core.png",
  "./assets/cards/elemental_darkness_utility.png",
  "./assets/cards/elemental_water_core.png",
  "./assets/cards/elemental_water_utility.png",
  "./assets/cards/elemental_earth_core.png",
  "./assets/cards/elemental_earth_utility.png",
  "./assets/cards/duelist_parry.png",
  "./assets/cards/duelist_riposte.png",
  "./assets/cards/duelist_dual_swords_edge.png",
  "./assets/cards/duelist_dual_swords_mastery.png",
  "./assets/cards/duelist_sword_shield_edge.png",
  "./assets/cards/duelist_sword_shield_mastery.png",
  "./assets/cards/duelist_rapier_edge.png",
  "./assets/cards/duelist_rapier_mastery.png",
  "./assets/cards/duelist_dual_swords_core.png",
  "./assets/cards/duelist_dual_swords_utility.png",
  "./assets/cards/duelist_sword_shield_core.png",
  "./assets/cards/duelist_sword_shield_utility.png",
  "./assets/cards/duelist_rapier_core.png",
  "./assets/cards/duelist_rapier_utility.png",
  "./assets/cards/shaman_totem.png",
  "./assets/cards/shaman_spirit.png",
  "./assets/cards/shaman_nature.png",
  "./assets/cards/shaman_spirits_edge.png",
  "./assets/cards/shaman_spirits_mastery.png",
  "./assets/cards/shaman_dark_gods_edge.png",
  "./assets/cards/shaman_dark_gods_mastery.png",
  "./assets/cards/shaman_nature_edge.png",
  "./assets/cards/shaman_nature_mastery.png",
  "./assets/cards/shaman_spirits_core.png",
  "./assets/cards/shaman_spirits_utility.png",
  "./assets/cards/shaman_dark_gods_core.png",
  "./assets/cards/shaman_dark_gods_utility.png",
  "./assets/cards/shaman_nature_core.png",
  "./assets/cards/shaman_nature_utility.png",
  './endgame-systems.js',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL.map(path => new Request(path, { cache: 'reload' })).map(request => request)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('towerbound-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML documents must prefer the network so an installed PWA sees releases.
  // The service-worker script itself is fetched by the browser's update
  // algorithm, not intercepted here; updateViaCache: 'none' handles that path.
  const isHtml = request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html');

  if (isHtml) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Other same-origin assets remain cache-first for fast repeat launches.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => Response.error());
    })
  );
});
