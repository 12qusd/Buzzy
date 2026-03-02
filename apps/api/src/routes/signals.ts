/**
 * Signal routes for the Buzzy Today API.
 * Handles batch recording of user engagement signals for the personalization engine.
 *
 * @module @buzzy/api/routes/signals
 */

import type { FastifyInstance } from 'fastify';
import { parseBody } from '../validators/index.js';
import { batchSignalsSchema } from '../validators/signals.validators.js';
import { logger } from '../logger.js';

/**
 * Registers signal routes.
 *
 * @param server - Fastify instance
 */
export async function signalRoutes(server: FastifyInstance): Promise<void> {
  /** POST /api/signals — Batch record engagement signals */
  server.post('/', async (request) => {
    const { signals } = parseBody(request, batchSignalsSchema);
    logger.info('Recording engagement signals', { count: signals.length });

    // TODO: Batch write to Firestore signals collection
    // TODO: Update user interest graph for each signal
    // TODO: Update article engagement points

    return {
      success: true,
      recorded: signals.length,
    };
  });
}
