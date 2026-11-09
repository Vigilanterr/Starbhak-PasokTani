export type DbErrorCode = '23505' | '23503' | '23514' | '23P01';

export class RepoError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
    readonly constraint?: string,
    readonly table?: string,
    readonly detail?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 23505 */
export class UniqueViolationError extends RepoError {}
/** 23503 */
export class ForeignKeyViolationError extends RepoError {}
/** 23514, also raised by the CHECK on quotas and stock */
export class CheckViolationError extends RepoError {}
/** 23P01 */
export class ExclusionViolationError extends RepoError {}

interface PgErrorLike {
  code?: string;
  message?: string;
  constraint?: string;
  table?: string;
  detail?: string;
}

const byCode: Record<DbErrorCode, typeof RepoError> = {
  '23505': UniqueViolationError,
  '23503': ForeignKeyViolationError,
  '23514': CheckViolationError,
  '23P01': ExclusionViolationError,
};

/** Returns a typed error for known SQLSTATEs and the original error otherwise. */
export function mapDbError(error: unknown): unknown {
  if (error instanceof RepoError) return error;
  const e = error as PgErrorLike | null;
  const Cls = e?.code ? byCode[e.code as DbErrorCode] : undefined;
  if (!Cls) return error;
  return new Cls(e!.message ?? 'database error', error, e!.constraint, e!.table, e!.detail);
}
