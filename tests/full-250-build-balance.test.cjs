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
    const buildIndex = builds.length;
    const seedRuns = [];
    for (const seedOffset of [0, 1, 2]) {
      const result = simulateBuild(classId, branch.id, buildIndex, seedOffset);
      seedRuns.push({
        seedOffset,
        cleared: result.cleared,
        deathStage: result.deathStage,
        deathLevel: result.deathLevel,
        deathReason: result.deathReason,
        averageDps: Number(result.avgDps.toFixed(2)),
        averageBossTurns: Number(result.avgBossTurns.toFixed(2)),
        averageOrdinaryTurns: Number(result.avgOrdinaryTurns.toFixed(2)),
        damageTaken: result.totalDamageTaken,
        potionsUsed: result.potions,
        silverNet: result.netSilver
      });
    }
    const result = seedRuns[0];
    const clears = seedRuns.map(run => run.cleared).sort((a,b)=>a-b);
    builds.push({
      classId,
      className: classes[classId].name,
      branchId: branch.id,
      branchName: branch.name,
      cleared: result.cleared,
      worstSeedClear: Math.min(...clears),
      medianSeedClear: clears[1],
      bestSeedClear: Math.max(...clears),
      failedSeedRuns: seedRuns.filter(run => run.cleared < 250).length,
      deathStage: result.deathStage,
      deathLevel: result.deathLevel,
      deathReason: result.deathReason,
      checkpoints: result.checkpoints,
      averageDps: result.averageDps,
      averageBossTurns: result.averageBossTurns,
      averageOrdinaryTurns: result.averageOrdinaryTurns,
      damageTaken: result.damageTaken,
      potionsUsed: result.potionsUsed,
      silverNet: result.silverNet,
      seedRuns
    });
  }
}
const summary = {
  audit: 'full-250-build-progression',
  targetStage: 250,
  seedsPerBuild: 3,
  totalBuilds: builds.length,
  totalSeedRuns: builds.reduce((sum, build) => sum + build.seedRuns.length, 0),
  passed: builds.filter(build => build.worstSeedClear >= 250).length,
  failed: builds.filter(build => build.worstSeedClear < 250).length,
  passedSeedRuns: builds.reduce((sum, build) => sum + build.seedRuns.filter(run => run.cleared >= 250).length, 0),
  builds: builds.map(({ className, branchName, worstSeedClear, medianSeedClear, bestSeedClear, failedSeedRuns, seedRuns }) => ({
    className,
    branchName,
    worstSeedClear,
    medianSeedClear,
    bestSeedClear,
    failedSeedRuns,
    seedRuns: seedRuns.map(({ seedOffset, cleared, deathStage, deathLevel, deathReason }) =>
      ({ seedOffset, cleared, deathStage, deathLevel, deathReason }))
  }))
};
console.log(JSON.stringify(summary));
assert.equal(builds.length, 21, 'must simulate all 21 class specializations');
assert.equal(summary.totalSeedRuns, 63, 'must run three deterministic seeds for every specialization');
assert.ok(builds.every(build => build.damageTaken > 0), 'every build must take incoming damage in simulation');
const failures = builds.flatMap(build => build.seedRuns
  .filter(run => run.cleared < 250)
  .map(run => ({
    class: build.classId,
    branch: build.branchId,
    seedOffset: run.seedOffset,
    cleared: run.cleared,
    deathStage: run.deathStage,
    deathReason: run.deathReason
  })));
assert.deepEqual(
  failures,
  [],
  'every one of the 63 specialization seed runs must clear all 250 stages; failures: ' + JSON.stringify(failures)
);
