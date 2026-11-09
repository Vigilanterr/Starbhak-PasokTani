/**
 * Tier 1: Feature Coverage (Smoke & Component Inventory)
 * Verifies component file existence, valid exports, and basic React component structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INVENTORY } from './inventory.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'frontend', 'src', 'components');

/**
 * Runs Tier 1 verification on the given items.
 * @param {Array} items - Subset of INVENTORY to test.
 * @returns {Object} { passed, total, results: [ { item, status, error } ] }
 */
export function runTier1(items = INVENTORY) {
  const componentItems = items.filter(item => item.milestone !== 'M5');
  const results = [];
  let passedCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  for (const item of componentItems) {
    const fullPath = path.join(COMPONENTS_DIR, item.file);

    if (!fs.existsSync(fullPath)) {
      results.push({
        id: item.id,
        name: item.name,
        milestone: item.milestone,
        domain: item.domain,
        status: 'PENDING',
        error: `File not found at: frontend/src/components/${item.file}`
      });
      pendingCount++;
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');

      // Check export of component
      const exportPatterns = [
        new RegExp(`export\\s+(?:default\\s+)?(?:function|const)\\s+${item.name}\\b`),
        new RegExp(`export\\s*\\{[^}]*\\b${item.name}\\b[^}]*\\}`),
        /export\s+default\s+(?:function|[A-Za-z0-9_]+)/
      ];

      const hasExport = exportPatterns.some(pattern => pattern.test(content));

      if (!hasExport) {
        results.push({
          id: item.id,
          name: item.name,
          milestone: item.milestone,
          domain: item.domain,
          status: 'FAIL',
          error: `Component export "${item.name}" not found in ${item.file}`
        });
        failedCount++;
        continue;
      }

      // Check JSX / TSX element return
      const hasJsx = /return\s*\(?|<[a-zA-Z]/.test(content);
      if (!hasJsx) {
        results.push({
          id: item.id,
          name: item.name,
          milestone: item.milestone,
          domain: item.domain,
          status: 'FAIL',
          error: `No JSX/TSX rendering found in ${item.file}`
        });
        failedCount++;
        continue;
      }

      results.push({
        id: item.id,
        name: item.name,
        milestone: item.milestone,
        domain: item.domain,
        status: 'PASS',
        error: null
      });
      passedCount++;
    } catch (err) {
      results.push({
        id: item.id,
        name: item.name,
        milestone: item.milestone,
        domain: item.domain,
        status: 'FAIL',
        error: err.message
      });
      failedCount++;
    }
  }

  return {
    tier: 'Tier 1: Feature Coverage',
    passed: passedCount,
    pending: pendingCount,
    failed: failedCount,
    total: componentItems.length,
    results
  };
}
