/**
 * Comment routes for the Buzzy Today API.
 * Top-level comment operations (like). Article-scoped CRUD is in articles route.
 *
 * @module @buzzy/api/routes/comments
 */

import type { FastifyInstance } from 'fastify';
import { parseBody } from '../validators/index.js';
import { commentLikeSchema } from '../validators/comments.validators.js';
import { toggleCommentLike } from '../services/commentService.js';
import { logger } from '../logger.js';

/**
 * Registers top-level comment routes.
 *
 * @param server - Fastify instance
 */
export async function commentRoutes(server: FastifyInstance): Promise<void> {
  /** POST /api/comments/:id/like — Like/unlike a comment */
  server.post<{ Params: { id: string } }>('/:id/like', async (request) => {
    const { id } = request.params;
    const body = parseBody(request, commentLikeSchema);
    logger.info('Comment like toggled', { commentId: id, userId: body.userId, liked: body.liked });

    const result = await toggleCommentLike(id, '', body.userId, body.liked);
    return { success: true, commentId: id, ...result };
  });
}
