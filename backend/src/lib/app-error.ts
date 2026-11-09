/**
 * Error a service throws on a rule failure. The error handler turns it into the envelope.
 * `code` is stable for the UI, `message` is Indonesian and safe to show.
 */
export class AppError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 503,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (what: string) => new AppError(404, 'not_found', `${what} tidak ditemukan`);
export const stateConflict = () => new AppError(409, 'state_conflict', 'Status saat ini tidak mengizinkan aksi ini');
