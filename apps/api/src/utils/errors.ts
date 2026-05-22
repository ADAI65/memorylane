/**
 * Custom error classes for the API
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
    this.name = 'RateLimitError';
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = 'Payment required for this action') {
    super(402, 'PAYMENT_REQUIRED', message);
    this.name = 'PaymentRequiredError';
  }
}

export class AIServiceError extends AppError {
  constructor(provider: string, message: string) {
    super(502, `AI_${provider.toUpperCase()}_ERROR`, `AI provider ${provider}: ${message}`);
    this.name = 'AIServiceError';
  }
}

export class DailyLimitError extends AppError {
  constructor(limit: number) {
    super(
      429,
      'DAILY_LIMIT_REACHED',
      `Daily limit of ${limit} free restorations reached. Upgrade to Pro for unlimited.`,
    );
    this.name = 'DailyLimitError';
  }
}
