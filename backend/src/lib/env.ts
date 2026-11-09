import { z } from 'zod';

/**
 * Validated once at startup. No defaults for secrets: a missing value fails the boot.
 * Only what the Phase 1 skeleton uses is declared here; later phases add their own keys.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, 'must be a Postgres connection string'),
  NEON_AUTH_BASE_URL: z.string().url(),
  CRON_SECRET: z.string().min(32, 'must be at least 32 characters'),
  FRONTEND_URL: z.string().url().optional(),
  REDIS_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment:\n${problems.join('\n')}`);
  }
  return parsed.data;
}
