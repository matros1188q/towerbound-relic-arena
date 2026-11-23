/* New TowerBound battle arena: isolated Flexbox/Grid styles. */
(function(){
 "use strict";
 var cssText = [
 '#tbRpg .tb-v2:has(.new-battle-wrap){box-sizing:border-box;width:100%;max-width:none;height:100dvh;min-height:0;margin:0;padding:0;overflow:hidden}',
 '#tbRpg .new-battle-wrap{box-sizing:border-box;position:relative;display:flex!important;flex-direction:column!important;width:100%;height:100dvh!important;min-height:0;overflow:hidden!important;background:#0a0c10!important;color:#fff;padding:10px 10px calc(10px + env(safe-area-inset-bottom))!important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
 '#tbRpg .new-battle-top{display:flex!important;align-items:center;justify-content:space-between;gap:8px;flex:0 0 auto;padding:0 0 10px;color:#fff;font-size:12px;border-bottom:1px solid #333}',
 '#tbRpg .new-round-label{font-weight:800;white-space:nowrap}#tbRpg .new-battle-relics{display:flex;align-items:center;gap:4px;min-width:0;overflow:hidden}#tbRpg .new-battle-relic{font-size:16px}#tbRpg .new-battle-actions{display:flex;align-items:center;gap:6px}',
 '#tbRpg .new-battle-actions button{min-height:32px;padding:5px 9px;border:1px solid #555;border-radius:7px;background:#1a1e26;color:#fff;font-weight:800}',
 '#tbRpg .new-battle-middle{display:flex!important;flex:1 1 auto!important;min-height:0;gap:10px;overflow:hidden;margin-top:10px}',
 '#tbRpg .new-hero-side{box-sizing:border-box;width:35%;min-width:0;flex:0 0 35%;display:flex!important;flex-direction:column!important;align-items:center;justify-content:center;gap:5px;border-right:1px solid #333;padding:4px 10px 4px 0;overflow:hidden}',
 '#tbRpg .new-hero-img{display:block;width:100%;height:150px;max-height:38%;object-fit:contain;flex:0 1 auto}#tbRpg .new-hero-name{color:#fff;font-size:13px;font-weight:900;text-align:center;overflow-wrap:anywhere}',
 '#tbRpg .new-hp-bar,#tbRpg .new-enemy-hp-bar{display:block;width:100%;height:7px;flex:0 0 7px;overflow:hidden;border-radius:8px;background:#343434}#tbRpg .new-hp-bar>div{height:100%;background:#36bd72}',
 '#tbRpg .new-hero-hp-text,#tbRpg .new-hero-resource-text{font-size:10px;color:#d7d7d7;text-align:center}#tbRpg .new-hero-potions{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;font-size:9px;color:#aaa}',
 '#tbRpg .new-enemies-side{box-sizing:border-box;width:65%;min-width:0;flex:1 1 65%;display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;justify-content:center;align-content:center;align-items:center;gap:12px;overflow-y:auto;overflow-x:hidden;padding:5px}',
 '#tbRpg .new-enemy-item{box-sizing:border-box;position:relative;display:flex!important;flex:0 1 88px;flex-direction:column!important;align-items:center;justify-content:flex-start;width:88px;min-width:72px;max-width:110px;gap:3px;padding:3px;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;color:#fff;text-align:center;cursor:pointer;outline-offset:3px}',
 '#tbRpg .new-enemy-item.selected{outline:1px solid #d7b56d;border-radius:7px;background:rgba(215,181,109,.08)!important}#tbRpg .new-enemy-item.defeated{opacity:.28}#tbRpg .new-enemy-img{display:block;width:100%;height:90px;object-fit:contain}',
 '#tbRpg .new-enemy-name{color:#fff;font-size:11px;font-weight:800;line-height:1.2;text-align:center;overflow-wrap:anywhere}#tbRpg .new-enemy-intent{color:#e78b76;font-size:11px;font-weight:800;line-height:1.2;text-align:center}',
 '#tbRpg .new-enemy-countdown,#tbRpg .new-enemy-statuses,#tbRpg .new-enemy-status{color:#bfc5ce;font-size:9px;line-height:1.2;text-align:center}#tbRpg .new-enemy-hp-bar{height:5px;flex-basis:5px}#tbRpg .new-enemy-hp-bar>div{height:100%;background:#e74c3c}#tbRpg .new-enemy-hp-text{font-size:9px;color:#ccc}',
 '#tbRpg .new-battle-bottom{box-sizing:border-box;display:flex!important;flex:0 0 auto!important;flex-direction:column!important;gap:7px;margin-top:10px;min-height:0}#tbRpg .new-turn-guidance{min-height:13px;color:#c7c7c7;font-size:10px;text-align:center}',
 '#tbRpg .new-stats-row{box-sizing:border-box;display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:7px;color:#fff;font-size:11px;padding:6px 9px;background:#1a1e26;border-radius:6px}#tbRpg .new-energy-summary,#tbRpg .new-deck-controls{display:flex;align-items:center;gap:7px;min-width:0}#tbRpg .new-deck-controls{flex-wrap:wrap;justify-content:flex-end}#tbRpg .new-deck-counts{font-size:9px;color:#bbb}',
 '#tbRpg .new-stats-row button{border:1px solid #565656;border-radius:5px;background:#252b35;color:#f5d99d;padding:4px 7px;font-size:10px;font-weight:800}',
 '#tbRpg .new-hand-row{box-sizing:border-box;display:flex!important;flex:0 0 142px!important;align-items:flex-end;justify-content:flex-start;gap:6px;width:100%;height:142px;min-height:142px;overflow-x:auto;overflow-y:hidden;padding:7px 4px 4px;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}#tbRpg .new-hand-row .v2-card{flex:0 0 76px!important;width:76px!important;min-width:76px!important;height:120px!important;min-height:120px!important}',
 '#tbRpg .new-log-row{box-sizing:border-box;height:42px;min-height:42px;overflow-y:auto;font-size:10px;color:#aaa;background:#111;padding:5px;border-radius:5px}#tbRpg .new-log-row .tb-combat-log{max-height:100%;overflow-y:auto}',
 '#tbRpg .new-end-turn{box-sizing:border-box;display:flex!important;align-items:center;justify-content:center;width:100%;min-height:46px;padding:11px;background:#2c3e50;color:#fff;border:1px solid #657386;border-radius:8px;font-weight:900;font-size:15px}#tbRpg .new-end-turn:disabled{opacity:.55}',
 '@media(max-width:560px){#tbRpg .new-battle-wrap{padding:8px 7px calc(8px + env(safe-area-inset-bottom))!important}#tbRpg .new-battle-middle{gap:6px}#tbRpg .new-hero-side{width:34%;flex-basis:34%;padding-right:6px}#tbRpg .new-hero-img{height:125px}#tbRpg .new-enemies-side{gap:8px;padding:2px}#tbRpg .new-enemy-item{flex-basis:76px;width:76px;min-width:68px}#tbRpg .new-enemy-img{height:78px}#tbRpg .new-battle-bottom{gap:5px;margin-top:7px}#tbRpg .new-hand-row{height:130px;min-height:130px;flex-basis:130px!important}#tbRpg .new-hand-row .v2-card{height:112px!important;min-height:112px!important}#tbRpg .new-log-row{height:34px;min-height:34px}#tbRpg .new-end-turn{min-height:42px;font-size:14px}}',
 '@media(max-height:650px){#tbRpg .new-hero-img{height:100px}#tbRpg .new-enemy-img{height:65px}#tbRpg .new-hand-row{height:112px;min-height:112px;flex-basis:112px!important}#tbRpg .new-hand-row .v2-card{height:100px!important;min-height:100px!important}#tbRpg .new-log-row{height:28px;min-height:28px}}'
 ].join("\n");
 var style=document.getElementById("towerbound-new-arena-css");
 if(!style){style=document.createElement("style");style.id="towerbound-new-arena-css";document.head.appendChild(style);}
 style.textContent=cssText;
})();

/* Map screen width recovery — scoped away from the new battle arena. */
#tbRpg .tb-v2:not(:has(.new-battle-wrap)),
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-map-screen,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-stage-panel,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-chapter-card{
 box-sizing:border-box!important;
 width:100%!important;
 min-width:100%!important;
 max-width:100%!important;
}
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-chapter-card,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-map-screen,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-stage-panel{
 display:flex!important;
 flex-direction:column!important;
 padding:15px!important;
}
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-chapter-card .tb-eyebrow,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-chapter-card h2,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-chapter-card p,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-map-screen .tb-eyebrow,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-map-screen h2,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-map-screen p,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-stage-panel .tb-eyebrow,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-stage-panel h2,
#tbRpg .tb-v2:not(:has(.new-battle-wrap)) .tb-stage-panel p{
 box-sizing:border-box!important;
 width:100%!important;
 min-width:100%!important;
 white-space:normal!important;
 word-break:normal!important;
 writing-mode:horizontal-tb!important;
 text-align:left!important;
 overflow-wrap:normal!important;
}
#tbRpg .tb-v2:not(:has(.new-battle-wrap)){
 width:100%!important;
 min-width:0!important;
 max-width:100%!important;
}
