import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Layers from CLAUDE.md and ApiPlan.md: routes -> services -> repo, and SQL only in repo. */
const SRC = join(import.meta.dir, '..', 'src');

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

/** Runtime imports only. `import type` is erased and runs no code, so it is allowed across layers. */
const importsOf = (file: string) =>
  [...readFileSync(file, 'utf8').matchAll(/(import|export)\s+(type\s+)?[^;]*?from\s*['"]([^'"]+)['"]/g)]
    .filter((m) => !m[2])
    .map((m) => m[3]!);

const relPath = (file: string) => relative(SRC, file);
const inside = (file: string, dir: string) => relPath(file).startsWith(`${dir}/`);

describe('layer rules', () => {
  const files = filesUnder(SRC);

  test('services import no Hono', () => {
    const offenders = files
      .filter((f) => inside(f, 'services'))
      .filter((f) => importsOf(f).some((spec) => spec === 'hono' || spec.startsWith('hono/')))
      .map(relPath);
    expect(offenders).toEqual([]);
  });

  test('routes call services, not the repo', () => {
    const offenders = files
      .filter((f) => inside(f, 'routes'))
      .filter((f) => importsOf(f).some((spec) => /(^|\/)repo\//.test(spec)))
      .map(relPath);
    expect(offenders).toEqual([]);
  });

  test('nothing outside src/repo imports pg', () => {
    const offenders = files
      .filter((f) => !inside(f, 'repo'))
      .filter((f) => importsOf(f).some((spec) => spec === 'pg' || spec.startsWith('pg/')))
      .map(relPath);
    expect(offenders).toEqual([]);
  });

  test('nothing outside src/repo uses kysely sql (SQL lives in the repo)', () => {
    const sqlImport = /import\s*(type\s*)?\{[^}]*\bsql\b[^}]*\}\s*from\s*['"]kysely['"]/;
    const offenders = files
      .filter((f) => !inside(f, 'repo'))
      .filter((f) => sqlImport.test(readFileSync(f, 'utf8')))
      .map(relPath);
    expect(offenders).toEqual([]);
  });

  test('services do not import the legacy schema or the legacy auth lib', () => {
    const offenders = files
      .filter((f) => inside(f, 'services'))
      .filter((f) => importsOf(f).some((spec) => /neon-auth|controllers|modules/.test(spec)))
      .map(relPath);
    expect(offenders).toEqual([]);
  });
});
