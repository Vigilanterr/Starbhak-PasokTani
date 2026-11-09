import type { Context, ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { AppError } from '../lib/app-error';
import {
  CheckViolationError,
  ExclusionViolationError,
  ForeignKeyViolationError,
  UniqueViolationError,
} from '../repo/errors';
import type { AppBindings } from '../types/env';

type Mapped = { status: 400 | 403 | 404 | 409 | 500 | 503; code: string; message: string };

/**
 * Named constraints the UI can explain. Anything not listed is a 500 and gets logged,
 * so an unexpected constraint never leaks its name to a client.
 */
const constraintMap: Record<string, Mapped> = {
  chk_quota_not_exceeded: { status: 409, code: 'quota_full', message: 'Kuota sudah penuh' },
  chk_reserved_le_on_hand: { status: 409, code: 'out_of_stock', message: 'Stok tidak mencukupi' },
  chk_no_negative_wallet: { status: 409, code: 'insufficient_balance', message: 'Saldo tidak mencukupi' },
};

const SERVER_ERROR: Mapped = { status: 500, code: 'internal_error', message: 'Terjadi kesalahan pada server' };

function mapRepoError(error: unknown): Mapped | undefined {
  if (error instanceof CheckViolationError || error instanceof UniqueViolationError || error instanceof ForeignKeyViolationError) {
    const constraint = (error as { constraint?: string }).constraint;
    return constraint ? constraintMap[constraint] : undefined;
  }
  if (error instanceof ExclusionViolationError) return undefined;
  // SQLSTATE 40P01 (deadlock) is not mapped by the repo; it arrives as the raw pg error.
  if ((error as { code?: string } | null)?.code === '40P01') {
    return { status: 503, code: 'busy', message: 'Sistem sedang sibuk, coba lagi' };
  }
  return undefined;
}

export function errorEnvelope(
  c: Context,
  mapped: { status: ContentfulStatusCode; code: string; message: string; fields?: Record<string, string> },
) {
  return c.json(
    {
      success: false,
      error: { code: mapped.code, message: mapped.message, ...(mapped.fields ? { fields: mapped.fields } : {}) },
    },
    mapped.status,
  );
}

/** Turns thrown errors into the envelope. Only AppError and known repo errors reach the client. */
export const errorHandler: ErrorHandler<AppBindings> = (error, c) => {
  const requestId = c.get('requestId');

  if (error instanceof AppError) {
    return errorEnvelope(c, { status: error.status, code: error.code, message: error.message, fields: error.fields });
  }

  if (error instanceof HTTPException) {
    return errorEnvelope(c, {
      status: error.status,
      code: error.status === 401 ? 'unauthorized' : 'http_error',
      message: error.message || 'Permintaan tidak valid',
    });
  }

  const mapped = mapRepoError(error);
  if (mapped) return errorEnvelope(c, mapped);

  console.error(JSON.stringify({ level: 'error', requestId, message: 'unhandled', name: (error as Error)?.name }), error);
  return errorEnvelope(c, SERVER_ERROR);
};

export const notFoundHandler = (c: Context<AppBindings>) =>
  errorEnvelope(c, { status: 404, code: 'route_not_found', message: 'Alamat tidak ditemukan' });
