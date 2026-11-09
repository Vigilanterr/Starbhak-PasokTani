/**
 * Tier 4: Real-World Scenarios & Release Gates
 * Verifies:
 * 1. TypeScript compilation check (0 errors)
 * 2. Next.js production build (`npm --prefix frontend run build` completes with 0 errors)
 * 3. ESLint linting (`npm --prefix frontend run lint` completes with 0 errors)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');

/**
 * Runs Tier 4 verification: executing real build and lint commands.
 * @param {Object} options - { skipBuild, skipLint }
 * @returns {Object} { passed, total, results: [ { check, status, error, output } ] }
 */
export function runTier4(options = {}) {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  // Gate 1: ESLint Check
  if (!options.skipLint) {
    try {
      const lintOutput = execSync('npm run lint', {
        cwd: FRONTEND_DIR,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });

      results.push({
        check: 'Lint Gate (npm run lint)',
        status: 'PASS',
        error: null,
        output: lintOutput.trim()
      });
      passedCount++;
    } catch (err) {
      const output = (err.stdout || '') + '\n' + (err.stderr || '');
      // Check if there are actual ERRORS (warnings are acceptable if zero errors)
      const hasErrors = /✖\s+[1-9]\d*\s+problems?\s+\([1-9]\d*\s+errors?/.test(output) || err.status !== 0;

      if (hasErrors) {
        results.push({
          check: 'Lint Gate (npm run lint)',
          status: 'FAIL',
          error: `Lint gate failed with exit code ${err.status}`,
          output: output.trim()
        });
        failedCount++;
      } else {
        results.push({
          check: 'Lint Gate (npm run lint)',
          status: 'PASS',
          error: null,
          output: output.trim()
        });
        passedCount++;
      }
    }
  }

  // Gate 2: Next.js Production Build Gate
  if (!options.skipBuild) {
    try {
      const buildOutput = execSync('npm run build', {
        cwd: FRONTEND_DIR,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });

      results.push({
        check: 'Build Gate (npm run build)',
        status: 'PASS',
        error: null,
        output: 'Compiled successfully with zero errors'
      });
      passedCount++;
    } catch (err) {
      const output = (err.stdout || '') + '\n' + (err.stderr || '');
      results.push({
        check: 'Build Gate (npm run build)',
        status: 'FAIL',
        error: `Build gate failed with exit code ${err.status}`,
        output: output.trim()
      });
      failedCount++;
    }
  }

  return {
    tier: 'Tier 4: Real-World Gates (Build & Lint)',
    passed: passedCount,
    failed: failedCount,
    total: results.length,
    results
  };
}
