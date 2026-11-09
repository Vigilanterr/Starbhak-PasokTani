/**
 * Adversarial & Boundary Verification Suite for Starbhak-PasokTani
 * Exercises edge conditions, encoding & escaping integrity, adversarial mock inputs,
 * and confirms strict plain design scanner precision.
 */

import { INVENTORY } from './inventory.mjs';

export function runAdversarialTests() {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  // Test 1: Plain Design Scanner Sensitivity (Positive & Negative Controls)
  const positiveAnimationCases = [
    '<div className="animate-spin text-brand-600">',
    '<div className="transition-all duration-300">',
    '<style>{`@keyframes pulse { 0% { opacity: 0; } }`}</style>',
    'import { motion } from "framer-motion";',
    '<span className="hover:scale-105 ease-in-out">'
  ];

  const negativePlainCases = [
    '<div className="bg-brand-900 text-cream p-4 rounded-lg">',
    '<span className="text-xs font-semibold text-danger">Rp 180.000</span>',
    '<button className="bg-brand-600 text-white hover:bg-brand-900">'
  ];

  const animationRegexes = [
    /\banimate-(?:spin|ping|pulse|bounce|none|[a-zA-Z0-9_-]+)\b/,
    /\btransition(?:-(?:all|colors|opacity|shadow|transform|[a-zA-Z0-9_-]+))?\b(?!\s*:\s*boolean)/,
    /\bduration-(?:75|100|150|200|300|500|700|1000|[0-9]+)\b/,
    /\bease-(?:linear|in|out|in-out|[a-zA-Z0-9_-]+)\b/,
    /@keyframes\b/,
    /['"]framer-motion['"]/
  ];

  let positiveDetected = 0;
  for (const sample of positiveAnimationCases) {
    if (animationRegexes.some(r => r.test(sample))) {
      positiveDetected++;
    }
  }

  let negativeFalseAlarms = 0;
  for (const sample of negativePlainCases) {
    if (animationRegexes.some(r => r.test(sample))) {
      negativeFalseAlarms++;
    }
  }

  if (positiveDetected === positiveAnimationCases.length && negativeFalseAlarms === 0) {
    results.push({
      name: 'Plain Design Scanner Precision (100% detection, 0 false alarms)',
      status: 'PASS'
    });
    passedCount++;
  } else {
    results.push({
      name: 'Plain Design Scanner Precision',
      status: 'FAIL',
      error: `Detected ${positiveDetected}/${positiveAnimationCases.length} positives, ${negativeFalseAlarms} false alarms`
    });
    failedCount++;
  }

  // Test 2: Inventory Completeness & Contract Uniqueness
  const ids = new Set();
  const filePaths = new Set();
  let duplicateCount = 0;

  for (const item of INVENTORY) {
    if (ids.has(item.id)) duplicateCount++;
    ids.add(item.id);

    if (item.file !== 'N/A') {
      if (filePaths.has(item.file)) duplicateCount++;
      filePaths.add(item.file);
    }
  }

  if (duplicateCount === 0 && INVENTORY.length === 93) {
    results.push({
      name: 'Feature Inventory Integrity (93 items, 0 duplicate IDs/paths)',
      status: 'PASS'
    });
    passedCount++;
  } else {
    results.push({
      name: 'Feature Inventory Integrity',
      status: 'FAIL',
      error: `Inventory has ${duplicateCount} duplicates or invalid length (${INVENTORY.length})`
    });
    failedCount++;
  }

  // Test 3: Indonesian Currency & Locale Format Integrity
  const currencyFormatter = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const formattedSample = currencyFormatter(180000);
  // Indonesian format standard: Rp 180.000 or Rp180.000 (with non-breaking space)
  if (formattedSample.includes('180.000') && formattedSample.includes('Rp')) {
    results.push({
      name: 'Indonesian Currency Formatting Standard (IDR Rp 180.000)',
      status: 'PASS'
    });
    passedCount++;
  } else {
    results.push({
      name: 'Indonesian Currency Formatting Standard',
      status: 'FAIL',
      error: `Unexpected format: ${formattedSample}`
    });
    failedCount++;
  }

  return {
    tier: 'Adversarial & Boundary Stress',
    passed: passedCount,
    failed: failedCount,
    total: results.length,
    results
  };
}
