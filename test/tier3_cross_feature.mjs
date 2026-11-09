/**
 * Tier 3: Cross-Feature Architecture & Directory Layout Compliance
 * Verifies:
 * 1. Clean folder structure under frontend/src/components/ grouped by domain/feature
 * 2. Dedicated subdirectories for shared reusable elements
 * 3. No rogue or unorganized files in frontend/src/components/ root
 * 4. Toko submodule hierarchy compliance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DOMAINS, TOKO_SUBDOMAINS, INVENTORY } from './inventory.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'frontend', 'src', 'components');

const ALLOWED_ROOT_DOMAINS = new Set([
  ...DOMAINS,
  'landingpage' // Existing landing page components
]);

/**
 * Runs Tier 3 verification on directory architecture and cross-module organization.
 * @returns {Object} { passed, total, results: [ { check, status, error } ] }
 */
export function runTier3() {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  if (!fs.existsSync(COMPONENTS_DIR)) {
    return {
      tier: 'Tier 3: Cross-Feature & Architecture',
      passed: 0,
      failed: 1,
      total: 1,
      results: [{
        check: 'Components Directory Exists',
        status: 'FAIL',
        error: `Components directory not found at: ${COMPONENTS_DIR}`
      }]
    };
  }

  // Check 1: No rogue files in frontend/src/components root
  const rootEntries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });
  const rogueFiles = rootEntries
    .filter(entry => entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')))
    .map(entry => entry.name);

  if (rogueFiles.length > 0) {
    results.push({
      check: 'No Rogue Files in Components Root',
      status: 'FAIL',
      error: `Found loose files directly under frontend/src/components/: ${rogueFiles.join(', ')}. All components must be organized into domain directories.`
    });
    failedCount++;
  } else {
    results.push({
      check: 'No Rogue Files in Components Root',
      status: 'PASS',
      error: null
    });
    passedCount++;
  }

  // Check 2: All root directories belong to recognized domain modules
  const subdirs = rootEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);
  const unknownDirs = subdirs.filter(dir => !ALLOWED_ROOT_DOMAINS.has(dir));

  if (unknownDirs.length > 0) {
    results.push({
      check: 'Valid Domain Directory Separation',
      status: 'FAIL',
      error: `Unrecognized directories found under frontend/src/components/: ${unknownDirs.join(', ')}`
    });
    failedCount++;
  } else {
    results.push({
      check: 'Valid Domain Directory Separation',
      status: 'PASS',
      error: null
    });
    passedCount++;
  }

  // Check 3: Toko submodule hierarchy compliance
  const tokoDir = path.join(COMPONENTS_DIR, 'toko');
  if (fs.existsSync(tokoDir)) {
    const tokoEntries = fs.readdirSync(tokoDir, { withFileTypes: true });
    const tokoSubdirs = tokoEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);
    const unknownTokoSubdirs = tokoSubdirs.filter(dir => !TOKO_SUBDOMAINS.includes(dir));

    if (unknownTokoSubdirs.length > 0) {
      results.push({
        check: 'Toko Subdomain Organization',
        status: 'FAIL',
        error: `Unrecognized subdirectories in toko/: ${unknownTokoSubdirs.join(', ')}. Expected: ${TOKO_SUBDOMAINS.join(', ')}`
      });
      failedCount++;
    } else {
      results.push({
        check: 'Toko Subdomain Organization',
        status: 'PASS',
        error: null
      });
      passedCount++;
    }
  } else {
    results.push({
      check: 'Toko Subdomain Organization',
      status: 'PENDING',
      error: 'toko/ directory not yet created (Milestone 4)'
    });
  }

  // Check 4: Layout and Common modules exist or are properly targeted
  const commonDir = path.join(COMPONENTS_DIR, 'common');
  const layoutDir = path.join(COMPONENTS_DIR, 'layout');
  const m1DirsExist = fs.existsSync(commonDir) || fs.existsSync(layoutDir);

  results.push({
    check: 'Core Architecture Primitives Subdirectories (common/, layout/)',
    status: m1DirsExist ? 'PASS' : 'PENDING',
    error: m1DirsExist ? null : 'common/ and layout/ subdirectories are in progress (Milestone 1)'
  });
  if (m1DirsExist) passedCount++;

  return {
    tier: 'Tier 3: Cross-Feature Architecture',
    passed: passedCount,
    failed: failedCount,
    total: results.length,
    results
  };
}
