'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium, firefox, webkit } = require('playwright');

const root = process.cwd();
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2'
};

function startServer() {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const requestPath = decodeURIComponent(url.pathname);
      const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
      const filename = path.resolve(root, relative);
      if (filename !== root && !filename.startsWith(root + path.sep)) {
        res.writeHead(403).end('Forbidden'); return;
      }
      fs.readFile(filename, (error, data) => {
        if (error) { res.writeHead(404).end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
      });
    } catch {
      res.writeHead(400).end('Bad request');
    }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function testJourney(browserType, engine, viewport) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ viewport, colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  // Phaser and font CDN outages must not prevent the DOM fallback or core game from working.
  await page.route(/^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//, route => route.abort());
  try {
    await page.goto(globalThis.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#enterArenaBtn').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('#enterArenaBtn').click();
    await page.locator('#heroChoices [data-hero="warden"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#heroChoices [data-hero="warden"]').click();
    await page.waitForFunction(() => document.body.dataset.tbScreen === 'prep', null, { timeout: 10000 });

    await page.locator('#tbReadyBtn').click();
    await page.waitForFunction(() => document.body.dataset.tbScreen === 'map', null, { timeout: 10000 });
    assert.equal(await page.locator('#routeMap .tb-map-row').count(), 7, engine + ' should show all seven map rows');

    const eventNode = page.locator('#routeMap .tb-map-row.is-current [data-mapnode="event"]');
    await eventNode.waitFor({ state: 'visible', timeout: 10000 });
    await eventNode.click();
    await page.locator('#modalback.show [data-room-choice="merchant"]').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('#modalback.show [data-room-choice="merchant"]').click();
    await page.waitForFunction(() => window.state && window.state.mapStep === 2 && window.state.wave === 2 && !window.state.battle, null, { timeout: 10000 });

    await page.locator('#routeMap .tb-map-row.is-current [data-mapnode="enemy"]').click();
    await page.waitForFunction(() => window.state && window.state.battle === true, null, { timeout: 10000 });
    await page.locator('#activeSkillBtn').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#activeSkillBtn').click();
    await page.waitForFunction(() => window.tbActiveCombat && window.tbActiveCombat.skillCooldown > 0, null, { timeout: 5000 });

    const diagnostics = await page.evaluate(() => window.TowerboundDiagnostics && window.TowerboundDiagnostics.run());
    assert.ok(diagnostics, engine + ' must expose runtime diagnostics');
    assert.equal(diagnostics.checks.sevenMapRows, true, engine + ' seven-row map diagnostic');
    assert.equal(diagnostics.checks.unifiedProgress, true, engine + ' progress counters must match');
    assert.equal(diagnostics.checks.flowStages, true, engine + ' flow screens must be mounted');
    assert.equal(diagnostics.checks.noHorizontalOverflow, true, engine + ' no horizontal overflow at ' + viewport.width + 'px');
    assert.deepEqual(pageErrors, [], engine + ' must not throw uncaught page errors');
    process.stdout.write('PASS ' + engine + ' ' + viewport.width + 'x' + viewport.height + ' — title → hero → prep → map/event → combat/skill\n');
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  const server = await startServer();
  const address = server.address();
  globalThis.baseUrl = 'http://127.0.0.1:' + address.port + '/';
  try {
    for (const [engine, type] of [['Chromium', chromium], ['Firefox', firefox], ['WebKit', webkit]]) {
      await testJourney(type, engine, { width: 1280, height: 900 });
      await testJourney(type, engine, { width: 390, height: 844 });
    }
    process.stdout.write('All six cross-browser viewport journeys passed. WebKit desktop emulation is not a physical iOS Safari device test.\n');
  } catch (error) {
    process.stderr.write((error && error.stack) || String(error));
    process.exitCode = 1;
  } finally {
    server.close();
  }
})();
