/**
 * Structured JSON logger for the Buzzy Today API.
 * Uses winston with JSON transport for production and colorized console for development.
 *
 * Required context fields: timestamp, service_name, request_id, user_id (if applicable).
 * Never logs PII or API keys.
 *
 * @module @buzzy/api/logger
 */

import winston from 'winston';

const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'info';
const NODE_ENV = process.env['NODE_ENV'] ?? 'development';

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: 'buzzy-api' },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    NODE_ENV === 'production'
      ? new winston.transports.Console()
      : new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
  ],
});
