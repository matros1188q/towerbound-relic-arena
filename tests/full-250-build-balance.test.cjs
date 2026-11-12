'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { simulateBuild } = require('./balance-simulation.test.cjs');

const balanceDir = path.join(__dirname, '../configs/balance');
const balance = Object.fromEntries(
  fs.readdirSync(balanceDir)
    .filter(name => name.endsWith('.json'))
    .map(name => [name.slice(0, -5), JSON.parse(fs.readFileSync(path.join(balanceDir, name), 'utf8'))])
);
const classes = balance.classes.classes;
const classIds = ['assassin', 'bishop', 'dragonkin', 'destroyer', 'elemental', 'duelist', 'shaman'];
const builds = [];
for (const classId of classIds) {
  for (const branch of classes[classId].branches) {
    const result = simulateBuild(classId, branch.id, builds.length);
    builds.push({
      classId,
      className: classes[classId].name,
      branchId: branch.id,
      branchName: branch.name,
      cleared: result.cleared,
      deathStage: result.deathStage,
      deathLevel: result.deathLevel,
      deathReason: result.deathReason,
      checkpoints: result.checkpoints,
      averageDps: Number(result.avgDps.toFixed(2)),
      averageBossTurns: Number(result.avgBossTurns.toFixed(2)),
      averageOrdinaryTurns: Number(result.avgOrdinaryTurns.toFixed(2)),
      potionsUsed: result.potions,
      silverNet: result.netSilver
    });
  }
}
console.log(JSON.stringify({
  audit: 'full-250-stage-progression',
  targetStage: 250,
  totalBuilds: builds.length,
  passed: builds.filter(build => build.cleared === 250).length,
  failed: builds.filter(build => build.cleared !== 250).length,
  builds
}, null, 2));
assert.equal(builds.length, 21, 'must simulate all 21 class specializations');
const failures = builds.filter(build => build.cleared !== 250);
assert.deepEqual(
  failures.map(build => ({ class: build.classId, branch: build.branchId, cleared: build.cleared, deathStage: build.deathStage })),
  [],
  'every class specialization must clear all 250 stages'
);
