import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { flushProductDayCounters, findCounterDrift, rollupSalesForDay, rollupSubscriptionsForDay } from './admin/admin.repo';
import {
  expireDueBatches, lockBatchesForSurplusPass, releaseExpiredReservations, setBatchSurplusDiscount,
} from './catalog/catalog.repo';
import { claimOutboxEvents } from './comms/comms.repo';
import { awardBadge, revokeBadge } from './farmers/farmers.repo';
import { listStalePendingMedia, markMediaDeleted, markUsersSeen } from './identity/identity.repo';
import { lockOverdueConfirmedOrders, lockUnpaidOrders } from './orders/orders.repo';
import { lockEscrowReleaseCandidates } from './payments/payments.repo';
import { lockOverdueRemainders } from './waitlist/waitlist.repo';

const REPO_DIR = import.meta.dir;
const DOC_PATH = join(REPO_DIR, '../../../docs/database/documentation.md');

/** The queries each job in section 7 of the database documentation runs. Direct imports, so a rename fails tsc. */
const JOB_QUERIES: Record<string, unknown[]> = {
  'Reservation sweeper': [releaseExpiredReservations, lockUnpaidOrders],
  'Surplus and expiry': [lockBatchesForSurplusPass, setBatchSurplusDiscount, expireDueBatches],
  'Remainder deadline': [lockOverdueRemainders],
  'Escrow auto-release': [lockEscrowReleaseCandidates],
  'Auto-cancel': [lockOverdueConfirmedOrders],
  'Outbox sweep': [claimOutboxEvents],
  'Badge evaluation': [awardBadge, revokeBadge],
  'Analytics rollup + reconciliation': [flushProductDayCounters, rollupSalesForDay, rollupSubscriptionsForDay, findCounterDrift],
  'Media cleanup': [listStalePendingMedia, markMediaDeleted],
  'Presence flush': [markUsersSeen],
};

function generatedTables(): string[] {
  const source = readFileSync(join(REPO_DIR, 'db.generated.ts'), 'utf8');
  const body = source.match(/export interface DB \{([\s\S]*?)\n\}/)?.[1] ?? '';
  return [...body.matchAll(/^\s+"?([\w.]+)"?:/gm)].map((m) => m[1]!);
}

/** Every .repo.ts source joined, comments removed so a table named only in a comment does not count. */
function repoSources(): string {
  const files = readdirSync(REPO_DIR, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.repo.ts'));
  return files
    .map((f) => readFileSync(join(REPO_DIR, f), 'utf8'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function isQueried(source: string, table: string): boolean {
  const builder = new RegExp(`(?:selectFrom|insertInto|updateTable|deleteFrom|innerJoin|leftJoin)\\(\\s*'${table}(?: as \\w+)?'`);
  const raw = new RegExp(`\\b(?:from|join|into|update)\\s+"?${table}"?\\b`);
  return builder.test(source) || raw.test(source);
}

function documentedJobs(): string[] {
  const doc = readFileSync(DOC_PATH, 'utf8');
  const section = doc.slice(doc.indexOf('## 7.'), doc.indexOf('## 8.'));
  const table = section.slice(section.indexOf('| Job | Frequency | Does |'));
  return table.split('\n')
    .slice(2)
    .filter((line) => line.startsWith('|'))
    .map((line) => line.split('|')[1]!.trim());
}

describe('repo coverage', () => {
  test('every table in the generated schema is queried by a .repo.ts file', () => {
    const tables = generatedTables();
    expect(tables.length).toBeGreaterThanOrEqual(61); // guards against the parser finding nothing
    const source = repoSources();
    expect(tables.filter((t) => !isQueried(source, t))).toEqual([]);
  });

  test('every job in documentation.md section 7 is mapped to its queries, and nothing else is', () => {
    expect(documentedJobs().sort()).toEqual(Object.keys(JOB_QUERIES).sort());
  });

  test('every mapped query is a function', () => {
    for (const [job, queries] of Object.entries(JOB_QUERIES)) {
      expect(queries.length, job).toBeGreaterThan(0);
      for (const query of queries) expect(typeof query, job).toBe('function');
    }
  });
});
