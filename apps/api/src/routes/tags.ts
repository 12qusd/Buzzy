/**
 * Topic Tag routes for the Buzzy Today API.
 * Provides endpoints for search, detail, trending, category tags, and follow/unfollow.
 *
 * @module @buzzy/api/routes/tags
 */

import type { FastifyInstance, FastifyReply } from 'fastify';
import { parseBody, parseQuery } from '../validators/index.js';
import { tagSearchSchema, tagFollowSchema } from '../validators/tags.validators.js';
import {
  searchTags,
  getTrendingTags,
  getTagsByCategory,
  getTagBySlug,
  toggleTagFollow,
} from '../services/tagService.js';
import { logger } from '../logger.js';

/**
 * Registers topic tag routes.
 *
 * @param server - Fastify instance
 */
export async function tagRoutes(server: FastifyInstance): Promise<void> {
  /** GET /api/tags/search?q=&limit= — Search tags by prefix/fuzzy */
  server.get('/search', async (request) => {
    const query = parseQuery(request, tagSearchSchema);
    const tags = await searchTags(query.q, query.limit);
    return { tags, query: query.q };
  });

  /** GET /api/tags/trending — Trending tags */
  server.get('/trending', async () => {
    const tags = await getTrendingTags();
    return { tags };
  });

  /** GET /api/tags/category/:categoryId — Tags in a specific category */
  server.get<{ Params: { categoryId: string } }>('/category/:categoryId', async (request) => {
    const { categoryId } = request.params;
    const tags = await getTagsByCategory(categoryId);
    return { tags, categoryId };
  });

  /**
   * GET /api/tags/:slug — Tag detail page.
   * If the slug matches a synonym, returns a 301 redirect to the canonical slug.
   */
  server.get<{ Params: { slug: string } }>('/:slug', async (request, reply: FastifyReply) => {
    const { slug } = request.params;
    const { tag, redirectSlug } = await getTagBySlug(slug);

    if (redirectSlug) {
      logger.info('Tag synonym redirect', { from: slug, to: redirectSlug });
      return reply.redirect(`/api/tags/${redirectSlug}`);
    }

    if (!tag) {
      const error = new Error(`Tag not found: ${slug}`) as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return { tag };
  });

  /** POST /api/tags/:id/follow — Follow/unfollow a tag */
  server.post<{ Params: { id: string } }>('/:id/follow', async (request) => {
    const { id } = request.params;
    const body = parseBody(request, tagFollowSchema);
    const result = await toggleTagFollow(id, body.userId, body.following);
    return { success: true, tagId: id, ...result };
  });
}
