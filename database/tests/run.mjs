// Runs database/tests/*.sql (or the files named as arguments) against MIGRATE_URL.
// Each file manages its own transaction; data tests end in ROLLBACK.
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const files = process.argv.length > 2
  ? process.argv.slice(2).map((f) => join(here, basename(f)))
  : readdirSync(here).filter((f) => f.endsWith('.sql')).sort().map((f) => join(here, f));

for (const file of files) {
  const client = new pg.Client({ connectionString: process.env.MIGRATE_URL });
  client.on('notice', (n) => console.log(`  ${n.message}`));
  await client.connect();
  try {
    await client.query(readFileSync(file, 'utf8'));
    console.log(`PASS ${basename(file)}`);
  } catch (err) {
    console.error(`FAIL ${basename(file)}: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
