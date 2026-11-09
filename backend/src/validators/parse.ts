import type { Context } from 'hono';
import type { ZodIssue, ZodTypeAny, z } from 'zod';
import { AppError } from '../lib/app-error';

/** Maps zod issues to the `fields` map the UI shows next to each input. The first issue per field wins. */
export function issuesToFields(issues: ZodIssue[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join('.') || '_';
    fields[key] ??= issue.message;
  }
  return fields;
}

/** Reads and validates a JSON body. Any failure is a 400 validation_failed with per-field messages. */
export async function parseBody<T extends ZodTypeAny>(c: Context, schema: T): Promise<z.infer<T>> {
  const raw: unknown = await c.req.json().catch(() => undefined);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields = issuesToFields(parsed.error.issues);
    throw new AppError(400, 'validation_failed', 'Data yang dikirim tidak valid', fields);
  }
  return parsed.data;
}

/** Reads and validates query-string parameters. Same 400 shape as parseBody. */
export function parseQuery<T extends ZodTypeAny>(c: Context, schema: T): z.infer<T> {
  const parsed = schema.safeParse(c.req.query());
  if (!parsed.success) {
    throw new AppError(400, 'validation_failed', 'Parameter tidak valid', issuesToFields(parsed.error.issues));
  }
  return parsed.data;
}

/** Validates one path parameter, such as a uuid. A bad id is a 400, never a query. */
export function parseParam<T extends ZodTypeAny>(value: string, schema: T, nama: string): z.infer<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new AppError(400, 'validation_failed', `${nama} tidak valid`, { [nama]: 'Format tidak valid' });
  }
  return parsed.data;
}
