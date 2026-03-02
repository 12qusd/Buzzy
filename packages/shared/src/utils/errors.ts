/**
 * Custom error classes for the Buzzy Today platform.
 * All errors extend BuzzyError for consistent structured logging and handling.
 *
 * @module @buzzy/shared/utils/errors
 */

/**
 * Base error class for all Buzzy Today errors.
 * Provides structured error information for logging and API responses.
 */
export class BuzzyError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  /**
   * @param message - Human-readable error description
   * @param code - Machine-readable error code (e.g., 'ARTICLE_NOT_FOUND')
   * @param statusCode - HTTP status code (default 500)
   * @param details - Additional structured context for logging
   */
  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BuzzyError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  /** Serialize to a structured JSON-friendly object */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/** Resource not found (404) */
export class NotFoundError extends BuzzyError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

/** Validation error for bad input (400) */
export class ValidationError extends BuzzyError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/** Duplicate resource conflict (409) */
export class DuplicateError extends BuzzyError {
  constructor(resource: string, identifier: string) {
    super(`Duplicate ${resource}: ${identifier}`, 'DUPLICATE', 409, { resource, identifier });
    this.name = 'DuplicateError';
  }
}

/** Authentication required (401) */
export class AuthenticationError extends BuzzyError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_REQUIRED', 401);
    this.name = 'AuthenticationError';
  }
}

/** Insufficient permissions (403) */
export class AuthorizationError extends BuzzyError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_FAILED', 403);
    this.name = 'AuthorizationError';
  }
}

/** External service failure (502) */
export class ExternalServiceError extends BuzzyError {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(`External service error (${service}): ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, {
      service,
      ...details,
    });
    this.name = 'ExternalServiceError';
  }
}

/** Rate limit exceeded (429) */
export class RateLimitError extends BuzzyError {
  constructor(retryAfterSeconds?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, {
      retryAfterSeconds,
    });
    this.name = 'RateLimitError';
  }
}
