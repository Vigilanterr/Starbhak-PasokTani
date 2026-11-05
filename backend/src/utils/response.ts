import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, unknown>;
}

export interface PaginatedResponse<T = unknown> {
  success: true;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const sendSuccess = <T,>(
  c: Context,
  data: T,
  message = 'Success',
  statusCode: ContentfulStatusCode = 200,
  meta?: Record<string, unknown>
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return c.json(response, statusCode);
};

export const sendError = (
  c: Context,
  message: string,
  statusCode: ContentfulStatusCode = 400,
  errors?: Record<string, unknown>
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return c.json(response, statusCode);
};

export const sendPaginated = <T,>(
  c: Context,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success',
  statusCode: ContentfulStatusCode = 200
): Response => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
  return c.json(response, statusCode);
};
