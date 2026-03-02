/**
 * Centralized Zod validation helper for Fastify request parsing.
 * Parses request body/query/params against a Zod schema and throws
 * a structured ValidationError on failure.
 *
 * @module @buzzy/api/validators
 */

import type { FastifyRequest } from 'fastify';
import type { ZodSchema, ZodError } from 'zod';

/**
 * Formats Zod validation errors into a user-friendly object.
 *
 * @param error - The Zod error to format
 * @returns Record of field paths to error messages
 */
function formatZodErrors(error: ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    formatted[path] = issue.message;
  }
  return formatted;
}

/**
 * Parses the request body against a Zod schema.
 *
 * @param request - Fastify request
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws Fastify error with 400 status on validation failure
 */
export function parseBody<T>(request: FastifyRequest, schema: ZodSchema<T>): T {
  const result = schema.safeParse(request.body);
  if (!result.success) {
    const error = new Error('Validation failed') as Error & { statusCode: number; code: string; details: Record<string, string> };
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = formatZodErrors(result.error);
    throw error;
  }
  return result.data;
}

/**
 * Parses the request query string against a Zod schema.
 *
 * @param request - Fastify request
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws Fastify error with 400 status on validation failure
 */
export function parseQuery<T>(request: FastifyRequest, schema: ZodSchema<T>): T {
  const result = schema.safeParse(request.query);
  if (!result.success) {
    const error = new Error('Validation failed') as Error & { statusCode: number; code: string; details: Record<string, string> };
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = formatZodErrors(result.error);
    throw error;
  }
  return result.data;
}

/**
 * Parses the request params against a Zod schema.
 *
 * @param request - Fastify request
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws Fastify error with 400 status on validation failure
 */
export function parseParams<T>(request: FastifyRequest, schema: ZodSchema<T>): T {
  const result = schema.safeParse(request.params);
  if (!result.success) {
    const error = new Error('Validation failed') as Error & { statusCode: number; code: string; details: Record<string, string> };
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = formatZodErrors(result.error);
    throw error;
  }
  return result.data;
}
