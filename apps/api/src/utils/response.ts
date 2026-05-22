import type { Context } from 'hono';
import { AppError } from './errors.js';

type SuccessResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

type PaginatedResponse<T> = SuccessResponse<T> & {
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

/**
 * Send a success response
 */
export function success<T>(c: Context, data: T, status = 200) {
  return c.json({ success: true, data } as SuccessResponse<T>, status as 200);
}

/**
 * Send a paginated response
 */
export function paginated<T>(
  c: Context,
  data: T,
  page: number,
  perPage: number,
  total: number,
) {
  return c.json({
    success: true,
    data,
    meta: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
    },
  } as PaginatedResponse<T>);
}

/**
 * Send an error response from an AppError
 */
export function errorResponse(c: Context, err: AppError) {
  return c.json(err.toJSON() as ErrorResponse, err.statusCode as 400);
}

/**
 * Global error handler for Hono
 */
export function errorHandler(err: Error, c: Context) {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  if (err instanceof AppError) {
    return errorResponse(c, err);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const zodErr = err as unknown as { issues: Array<{ path: (string | number)[]; message: string }> };
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: Object.fromEntries(
            zodErr.issues.map((i) => [i.path.join('.'), i.message]),
          ),
        },
      } as unknown as ErrorResponse,
      400,
    );
  }

  // Unknown errors
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          c.env?.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message || 'Internal server error',
      },
    } as ErrorResponse,
    500,
  );
}
