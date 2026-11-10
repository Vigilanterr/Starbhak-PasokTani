// Applies database/migrations/*.sql in order, each in its own transaction.
// Usage: MIGRATE_URL=<unpooled connection string> node database/migrate.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

if (!process.env.MIGRATE_URL) {
  console.error('MIGRATE_URL is not set');
  process.exit(1);
}

const dir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');
const client = new pg.Client({ connectionString: process.env.MIGRATE_URL });
await client.connect();

let applied = 0;
try {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const { rows } = await client.query('SELECT version FROM schema_migrations');
  const done = new Set(rows.map((r) => r.version));

  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    const version = file.replace(/\.sql$/, '');
    if (done.has(version)) continue;
    await client.query('BEGIN');
    try {
      await client.query(readFileSync(join(dir, file), 'utf8'));
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`FAILED ${file}: ${err.message}`);
      process.exitCode = 1;
      break;
    }
    console.log(`applied ${version}`);
    applied += 1;
  }
  console.log(`${applied} applied`);
} finally {
  await client.end();
}
