/**
 * Category routes for the Buzzy Today API.
 * Provides endpoints for listing, detail, and follow/unfollow.
 *
 * @module @buzzy/api/routes/categories
 */

import type { FastifyInstance } from 'fastify';
import { parseBody } from '../validators/index.js';
import { categoryFollowSchema } from '../validators/categories.validators.js';
import {
  getAllCategories,
  getCategoryBySlug,
  toggleCategoryFollow,
} from '../services/categoryService.js';
import { logger } from '../logger.js';

/**
 * Registers category routes.
 *
 * @param server - Fastify instance
 */
export async function categoryRoutes(server: FastifyInstance): Promise<void> {
  /** GET /api/categories — List all categories */
  server.get('/', async () => {
    const categories = await getAllCategories();
    return { categories };
  });

  /** GET /api/categories/:slug — Category detail */
  server.get<{ Params: { slug: string } }>('/:slug', async (request) => {
    const { slug } = request.params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      const error = new Error(`Category not found: ${slug}`) as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return { category };
  });

  /** POST /api/categories/:id/follow — Follow/unfollow category */
  server.post<{ Params: { id: string } }>('/:id/follow', async (request) => {
    const { id } = request.params;
    const body = parseBody(request, categoryFollowSchema);
    logger.info('Category follow toggled', { categoryId: id, userId: body.userId, following: body.following });
    const result = await toggleCategoryFollow(id, body.userId, body.following);
    return { success: true, categoryId: id, ...result };
  });
}
