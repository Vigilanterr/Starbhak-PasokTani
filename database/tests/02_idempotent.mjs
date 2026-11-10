// T2: a second run of the runner applies nothing
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const runner = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrate.mjs');
const out = execFileSync('node', [runner], { encoding: 'utf8' });
if (!/^0 applied$/m.test(out)) {
  console.error(`FAIL 02_idempotent: ${out}`);
  process.exit(1);
}
console.log('PASS 02_idempotent');
