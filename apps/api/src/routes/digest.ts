/**
 * Daily Digest routes for the Buzzy Today API.
 * Provides endpoints for retrieving generated daily digests.
 *
 * @module @buzzy/api/routes/digest
 */

import type { FastifyInstance } from 'fastify';
import { getLatestDigest, getDigestByDate } from '../services/digestService.js';
import { logger } from '../logger.js';

/**
 * Registers daily digest routes.
 *
 * @param server - Fastify instance
 */
export async function digestRoutes(server: FastifyInstance): Promise<void> {
  /** GET /api/digest/latest — Latest published digest */
  server.get('/latest', async (_request, reply) => {
    logger.info('Fetching latest digest');
    const digest = await getLatestDigest();

    if (!digest) {
      void reply.status(404);
      return { error: { message: 'No digest available', code: 'NOT_FOUND', statusCode: 404 } };
    }

    return { digest };
  });

  /** GET /api/digest/:date — Get digest by date (YYYY-MM-DD) */
  server.get<{ Params: { date: string } }>('/:date', async (request, reply) => {
    const { date } = request.params;
    logger.info('Fetching digest by date', { date });

    const digest = await getDigestByDate(date);

    if (!digest) {
      void reply.status(404);
      return { error: { message: `Digest not found for ${date}`, code: 'NOT_FOUND', statusCode: 404 } };
    }

    return { digest };
  });
}
