#!/usr/bin/env node

/**
 * Starbhak-PasokTani - Comprehensive E2E Verification Runner
 * Runs Tier 1, Tier 2, Tier 3, and Tier 4 verification suites.
 *
 * Usage:
 *   node test/run_all_tests.mjs [options]
 *
 * Options:
 *   --milestone <M1|M2|M3|M4|M5|all>  Target specific milestone (default: all)
 *   --tier <1|2|3|4|all>              Run specific tier only (default: all)
 *   --strict                          Exit 1 if any component in target milestone is missing
 *   --progressive                     Exit 0 if all currently implemented items pass (default)
 *   --skip-build                      Skip the production build check
 *   --skip-lint                       Skip the ESLint check
 *   --json                            Output results as JSON
 */

import { INVENTORY } from './inventory.mjs';
import { runTier1 } from './tier1_feature_coverage.mjs';
import { runTier2 } from './tier2_boundary_corner.mjs';
import { runTier3 } from './tier3_cross_feature.mjs';
import { runTier4 } from './tier4_real_world_gates.mjs';
import { runAdversarialTests } from './adversarial_verification.mjs';

// Parse arguments
const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return defaultValue;
}
const hasFlag = (name) => args.includes(`--${name}`);

const targetMilestone = (getArg('milestone', 'all')).toUpperCase();
const targetTier = getArg('tier', 'all');
const isStrict = hasFlag('strict');
const isProgressive = hasFlag('progressive') || !isStrict;
const skipBuild = hasFlag('skip-build');
const skipLint = hasFlag('skip-lint');
const outputJson = hasFlag('json');

// Filter items by milestone
let scopedItems = INVENTORY;
if (targetMilestone !== 'ALL') {
  scopedItems = INVENTORY.filter(item => item.milestone === targetMilestone);
}

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const suiteResults = {
  timestamp: new Date().toISOString(),
  targetMilestone,
  targetTier,
  mode: isStrict ? 'strict' : 'progressive',
  tiers: {},
  summary: {
    totalComponents: 92,
    totalFeatures: 93,
    milestones: {
      M1: { total: 18, passed: 0, pending: 0, failed: 0 },
      M2: { total: 19, passed: 0, pending: 0, failed: 0 },
      M3: { total: 18, passed: 0, pending: 0, failed: 0 },
      M4: { total: 37, passed: 0, pending: 0, failed: 0 },
      M5: { total: 1, passed: 0, pending: 0, failed: 0 }
    },
    passed: 0,
    pending: 0,
    failed: 0,
    overallVerdict: 'PENDING'
  }
};

if (!outputJson) {
  console.log(`\n${colors.bold}${colors.cyan}=======================================================`);
  console.log(`  Starbhak-PasokTani - 4-Tier E2E Verification Runner  `);
  console.log(`=======================================================${colors.reset}\n`);
  console.log(`  Scope Milestone: ${colors.bold}${targetMilestone}${colors.reset}`);
  console.log(`  Target Tier:     ${colors.bold}${targetTier}${colors.reset}`);
  console.log(`  Verification Mode: ${isStrict ? colors.red + 'STRICT' : colors.yellow + 'PROGRESSIVE'}${colors.reset}\n`);
}

let hasFatalFailure = false;

// Tier 1: Feature Coverage
if (targetTier === 'all' || targetTier === '1') {
  const t1 = runTier1(scopedItems);
  suiteResults.tiers.tier1 = t1;

  if (!outputJson) {
    console.log(`${colors.bold}[Tier 1: Feature Coverage]${colors.reset}`);
    console.log(`  Components in scope: ${t1.total} | Passed: ${colors.green}${t1.passed}${colors.reset} | Pending: ${colors.yellow}${t1.pending}${colors.reset} | Failed: ${colors.red}${t1.failed}${colors.reset}`);
    if (t1.failed > 0) {
      console.log(`  ${colors.red}Failures:${colors.reset}`);
      t1.results.filter(r => r.status === 'FAIL').slice(0, 5).forEach(f => {
        console.log(`    - [${f.milestone}] ${f.name}: ${f.error}`);
      });
    }
    console.log('');
  }

  if (t1.failed > 0) hasFatalFailure = true;
  if (isStrict && t1.pending > 0) hasFatalFailure = true;
}

// Tier 2: Boundary & Plain Design Guard
if (targetTier === 'all' || targetTier === '2') {
  const t2 = runTier2(scopedItems);
  suiteResults.tiers.tier2 = t2;

  if (!outputJson) {
    console.log(`${colors.bold}[Tier 2: Boundary & Strict Plain Design Guard]${colors.reset}`);
    console.log(`  Components in scope: ${t2.total} | Passed: ${colors.green}${t2.passed}${colors.reset} | Pending: ${colors.yellow}${t2.pending}${colors.reset} | Failed: ${colors.red}${t2.failed}${colors.reset}`);
    if (t2.failed > 0) {
      console.log(`  ${colors.red}Plain Design / Interface Violations:${colors.reset}`);
      t2.results.filter(r => r.status === 'FAIL').slice(0, 5).forEach(f => {
        console.log(`    - [${f.milestone}] ${f.name}: ${f.error}`);
      });
    }
    console.log('');
  }

  if (t2.failed > 0) hasFatalFailure = true;
  if (isStrict && t2.pending > 0) hasFatalFailure = true;

  // Adversarial & Stress Verification
  const adv = runAdversarialTests();
  suiteResults.tiers.adversarial = adv;
  if (!outputJson) {
    console.log(`${colors.bold}[Adversarial & Boundary Stress Verification]${colors.reset}`);
    console.log(`  Tests: ${adv.total} | Passed: ${colors.green}${adv.passed}${colors.reset} | Failed: ${colors.red}${adv.failed}${colors.reset}`);
    adv.results.forEach(r => {
      const badge = r.status === 'PASS' ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
      console.log(`    ${badge} ${r.name}`);
    });
    console.log('');
  }
  if (adv.failed > 0) hasFatalFailure = true;
}

// Tier 3: Cross-Feature Architecture
if (targetTier === 'all' || targetTier === '3') {
  const t3 = runTier3();
  suiteResults.tiers.tier3 = t3;

  if (!outputJson) {
    console.log(`${colors.bold}[Tier 3: Cross-Feature & Folder Architecture]${colors.reset}`);
    console.log(`  Checks: ${t3.total} | Passed: ${colors.green}${t3.passed}${colors.reset} | Failed: ${colors.red}${t3.failed}${colors.reset}`);
    t3.results.forEach(r => {
      const badge = r.status === 'PASS' ? `${colors.green}✓ PASS${colors.reset}` : (r.status === 'PENDING' ? `${colors.yellow}○ PENDING${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`);
      console.log(`    ${badge} ${r.check}${r.error ? ` (${colors.gray}${r.error}${colors.reset})` : ''}`);
    });
    console.log('');
  }

  if (t3.failed > 0) hasFatalFailure = true;
}

// Tier 4: Real-World Gates (Build & Lint)
if (targetTier === 'all' || targetTier === '4') {
  if (targetMilestone === 'ALL' || targetMilestone === 'M5') {
    if (!outputJson) {
      console.log(`${colors.bold}[Tier 4: Real-World Release Gates (npm build & lint)]${colors.reset}`);
    }
    const t4 = runTier4({ skipBuild, skipLint });
    suiteResults.tiers.tier4 = t4;

    if (!outputJson) {
      t4.results.forEach(r => {
        const badge = r.status === 'PASS' ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
        console.log(`    ${badge} ${r.check}${r.error ? ` (${colors.red}${r.error}${colors.reset})` : ''}`);
      });
      console.log('');
    }

    if (t4.failed > 0) hasFatalFailure = true;
    if (t4.passed === t4.total && t4.total > 0) {
      suiteResults.summary.milestones.M5.passed = 1;
    }
  }
}

// Aggregate milestone tallies from Tier 1 & 2
if (suiteResults.tiers.tier1) {
  for (const r of suiteResults.tiers.tier1.results) {
    const m = suiteResults.summary.milestones[r.milestone];
    if (m) {
      if (r.status === 'PASS') m.passed++;
      else if (r.status === 'PENDING') m.pending++;
      else if (r.status === 'FAIL') m.failed++;
    }
  }
}

// Determine overall verdict
let exitCode = 0;
if (hasFatalFailure) {
  suiteResults.summary.overallVerdict = 'FAIL';
  exitCode = 1;
} else if (suiteResults.tiers.tier1 && suiteResults.tiers.tier1.pending > 0 && isStrict) {
  suiteResults.summary.overallVerdict = 'FAIL';
  exitCode = 1;
} else if (suiteResults.tiers.tier1 && suiteResults.tiers.tier1.pending > 0) {
  suiteResults.summary.overallVerdict = 'PROGRESSIVE_PASS';
  exitCode = 0;
} else {
  suiteResults.summary.overallVerdict = 'PASS';
  exitCode = 0;
}

if (outputJson) {
  console.log(JSON.stringify(suiteResults, null, 2));
  process.exit(exitCode);
}

// Summary Table
console.log(`${colors.bold}-------------------------------------------------------`);
console.log(`  Milestone Coverage Breakdown`);
console.log(`-------------------------------------------------------${colors.reset}`);
console.log(`  Milestone | Total | Implemented | Pending | Status`);
console.log(`  ----------+-------+-------------+---------+-----------`);

for (const [mName, mData] of Object.entries(suiteResults.summary.milestones)) {
  const statusStr = mData.failed > 0
    ? `${colors.red}FAIL (${mData.failed})${colors.reset}`
    : (mData.passed === mData.total ? `${colors.green}100% COMPLETE${colors.reset}` : `${colors.yellow}IN_PROGRESS${colors.reset}`);
  console.log(`  ${mName.padEnd(9)} | ${String(mData.total).padEnd(5)} | ${String(mData.passed).padEnd(11)} | ${String(mData.pending).padEnd(7)} | ${statusStr}`);
}

console.log(`${colors.bold}-------------------------------------------------------${colors.reset}`);
const finalBadge = exitCode === 0
  ? `${colors.green}${colors.bold}✓ VERIFICATION PASSED (Exit code: 0)${colors.reset}`
  : `${colors.red}${colors.bold}✗ VERIFICATION FAILED (Exit code: 1)${colors.reset}`;

console.log(`\n  Result: ${finalBadge}`);
console.log(`  Mode:   ${isStrict ? 'Strict full inventory' : 'Progressive milestone gating'}\n`);

process.exit(exitCode);
