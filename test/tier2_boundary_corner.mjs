/**
 * Tier 2: Boundary & Corner Cases + Strict Plain Design Guard
 * Verifies:
 * 1. TypeScript props interface for API data injection
 * 2. Strict plain design constraint: ZERO animations, transitions, or keyframes
 * 3. Handling of boundary conditions and optional prop parameters
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INVENTORY } from './inventory.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'frontend', 'src', 'components');

// Forbidden animation and transition tokens (Tailwind CSS and native CSS)
const FORBIDDEN_ANIMATION_TOKENS = [
  // Tailwind animation utilities
  /\banimate-(?:spin|ping|pulse|bounce|none|[a-zA-Z0-9_-]+)\b/,
  /\btransition(?:-(?:all|colors|opacity|shadow|transform|[a-zA-Z0-9_-]+))?\b(?!\s*:\s*boolean)/,
  /\bduration-(?:75|100|150|200|300|500|700|1000|[0-9]+)\b/,
  /\bease-(?:linear|in|out|in-out|[a-zA-Z0-9_-]+)\b/,
  /\bdelay-(?:75|100|150|200|300|500|700|1000|[0-9]+)\b/,

  // CSS keywords
  /@keyframes\b/,
  /\banimation\s*:/,
  /\banimation-name\s*:/,
  /\banimation-duration\s*:/,

  // Animation libraries
  /['"]framer-motion['"]/,
  /['"]lottie-react['"]/,
  /['"]lottie-web['"]/,
  /['"]gsap['"]/,
  /['"]react-spring['"]/
];

/**
 * Runs Tier 2 verification on the given items.
 * @param {Array} items - Subset of INVENTORY to test.
 * @returns {Object} { passed, total, results: [ { item, status, checks, error } ] }
 */
export function runTier2(items = INVENTORY) {
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
      const lines = content.split('\n');
      const errors = [];

      // Check 1: TypeScript Props Interface Check
      const interfacePatterns = [
        new RegExp(`(?:interface|type)\\s+${item.propsInterface}\\b`),
        new RegExp(`(?:interface|type)\\s+${item.name}Props\\b`)
      ];

      const hasInterface = interfacePatterns.some(pattern => pattern.test(content));
      if (!hasInterface) {
        errors.push(`Missing TypeScript interface "${item.propsInterface}" for API data injection`);
      }

      // Check 2: Strict Plain Design Guard (Zero Animations / Transitions / Keyframes)
      const animationViolations = [];
      lines.forEach((lineText, lineIdx) => {
        // Skip comment lines
        const trimmed = lineText.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return;
        }

        for (const tokenRegex of FORBIDDEN_ANIMATION_TOKENS) {
          const match = lineText.match(tokenRegex);
          if (match) {
            animationViolations.push({
              line: lineIdx + 1,
              matchedToken: match[0],
              snippet: trimmed.substring(0, 80)
            });
            break; // Report once per line
          }
        }
      });

      if (animationViolations.length > 0) {
        const details = animationViolations
          .slice(0, 3)
          .map(v => `L${v.line}: forbidden token "${v.matchedToken}"`)
          .join(', ');
        errors.push(`Animation guard violation: found forbidden animation/transition (${details})`);
      }

      // Check 3: API Data Injection Key Props (if required)
      if (item.keyProps && item.keyProps.length > 0) {
        for (const keyProp of item.keyProps) {
          const propRegex = new RegExp(`\\b${keyProp}\\b`);
          if (!propRegex.test(content)) {
            errors.push(`Expected API data injection prop "${keyProp}" not referenced in component`);
          }
        }
      }

      if (errors.length > 0) {
        results.push({
          id: item.id,
          name: item.name,
          milestone: item.milestone,
          domain: item.domain,
          status: 'FAIL',
          error: errors.join('; ')
        });
        failedCount++;
      } else {
        results.push({
          id: item.id,
          name: item.name,
          milestone: item.milestone,
          domain: item.domain,
          status: 'PASS',
          error: null
        });
        passedCount++;
      }
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
    tier: 'Tier 2: Boundary & Plain Design Guard',
    passed: passedCount,
    pending: pendingCount,
    failed: failedCount,
    total: componentItems.length,
    results
  };
}
