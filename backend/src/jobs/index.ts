import type { Executor } from '../repo/executor';

/**
 * Names must match `.github/workflows/scheduled-jobs.yml`. Anything the workflow calls
 * but the registry does not know is a 404, so a typo in the workflow shows up.
 */
export const JOB_NAMES = [
  'reservation-sweeper',
  'remainder-deadline',
  'outbox-sweep',
  'presence-flush',
  'escrow-auto-release',
  'auto-cancel',
  'surplus-expiry',
  'analytics-rollup',
  'media-cleanup',
  'badge-evaluation',
] as const;

export type JobName = (typeof JOB_NAMES)[number];

export interface JobContext {
  db: Executor;
  requestId: string;
  now: Date;
}

export type JobHandler = (ctx: JobContext) => Promise<Record<string, unknown>>;

/**
 * Jobs are added here as their phases land. Names without a handler return 200 with
 * `skipped: true`, because the workflow runs under `curl --fail` with `set -e`, and an error
 * would stop the other jobs in the same run.
 */
const handlers: Partial<Record<JobName, JobHandler>> = {};

export function isJobName(name: string): name is JobName {
  return (JOB_NAMES as readonly string[]).includes(name);
}

export function jobHandler(name: JobName): JobHandler | undefined {
  return handlers[name];
}
