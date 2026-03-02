/**
 * Article routes for the Buzzy Today API.
 * Provides endpoints for feed, detail, category/tag filtering, trending,
 * engagement actions, and article-scoped comments.
 *
 * @module @buzzy/api/routes/articles
 */

import type { FastifyInstance } from 'fastify';
import { parseBody, parseQuery } from '../validators/index.js';
import { feedQuerySchema, articleActionSchema, bookmarkSchema } from '../validators/articles.validators.js';
import { createCommentSchema, commentListSchema } from '../validators/comments.validators.js';
import { fetchFeedArticles } from '../services/feedService.js';
import { buildHomepageFeed } from '../services/contentClumpService.js';
import { getArticleById, getArticlesByCategory, getArticlesByTag, getTrendingArticles, getLatestArticles, toggleArticleLike, recordArticleShare, toggleArticleBookmark } from '../services/articleService.js';
import { getArticleComments, createComment } from '../services/commentService.js';
import { logger } from '../logger.js';

/**
 * Registers article-related routes.
 *
 * @param server - Fastify instance
 */
export async function articleRoutes(server: FastifyInstance): Promise<void> {
  /** GET /api/articles/feed — Personalized feed */
  server.get('/feed', async (request) => {
    const query = parseQuery(request, feedQuerySchema);
    logger.info('Fetching article feed', { category: query.category, limit: query.limit });

    const result = await fetchFeedArticles({
      category: query.category,
      limit: query.limit,
      cursor: query.cursor,
      userId: query.userId,
    });

    return result;
  });

  /** GET /api/articles/homepage — Personalized homepage with content clumps */
  server.get('/homepage', async (request) => {
    const query = parseQuery(request, feedQuerySchema);
    logger.info('Building homepage feed', { userId: query.userId });

    const homepage = await buildHomepageFeed(query.userId ?? undefined);
    return homepage;
  });

  /** GET /api/articles/trending — Trending articles */
  server.get('/trending', async (request) => {
    const query = parseQuery(request, feedQuerySchema);
    logger.info('Fetching trending articles');

    const articles = await getTrendingArticles(query.limit);
    return { articles };
  });

  /** GET /api/articles/latest — Latest articles */
  server.get('/latest', async (request) => {
    const query = parseQuery(request, feedQuerySchema);
    logger.info('Fetching latest articles');

    const articles = await getLatestArticles(query.limit);
    return { articles };
  });

  /** GET /api/articles/category/:categorySlug — Articles by category */
  server.get<{ Params: { categorySlug: string } }>('/category/:categorySlug', async (request) => {
    const { categorySlug } = request.params;
    const query = parseQuery(request, feedQuerySchema);
    logger.info('Fetching articles by category', { categorySlug });

    const result = await getArticlesByCategory(categorySlug, query.limit, query.cursor);
    return { ...result, category: categorySlug };
  });

  /** GET /api/articles/tag/:tagSlug — Articles by topic tag */
  server.get<{ Params: { tagSlug: string } }>('/tag/:tagSlug', async (request) => {
    const { tagSlug } = request.params;
    const query = parseQuery(request, feedQuerySchema);
    logger.info('Fetching articles by tag', { tagSlug });

    const result = await getArticlesByTag(tagSlug, query.limit, query.cursor);
    return { ...result, tag: tagSlug };
  });

  /** GET /api/articles/:id/comments — List comments for an article */
  server.get<{ Params: { id: string } }>('/:id/comments', async (request) => {
    const { id } = request.params;
    const query = parseQuery(request, commentListSchema);
    logger.info('Fetching article comments', { articleId: id });

    return getArticleComments(id, query.limit, query.cursor, query.userId);
  });

  /** POST /api/articles/:id/comments — Create a comment on an article */
  server.post<{ Params: { id: string } }>('/:id/comments', async (request, reply) => {
    const { id } = request.params;
    const body = parseBody(request, createCommentSchema);
    logger.info('Creating comment', { articleId: id, userId: body.userId });

    const comment = await createComment({
      articleId: id,
      ...body,
    });

    void reply.status(201);
    return comment;
  });

  /** GET /api/articles/:id — Single article detail */
  server.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    logger.info('Fetching article detail', { articleId: id });

    const article = await getArticleById(id);
    if (!article) {
      void reply.status(404);
      return { error: { message: 'Article not found', code: 'NOT_FOUND', statusCode: 404 } };
    }
    return { article };
  });

  /** POST /api/articles/:id/like — Like article */
  server.post<{ Params: { id: string } }>('/:id/like', async (request) => {
    const { id } = request.params;
    const body = parseBody(request, articleActionSchema);
    logger.info('Article liked', { articleId: id, userId: body.userId });

    const result = await toggleArticleLike(id, body.userId);
    return { success: true, articleId: id, ...result };
  });

  /** POST /api/articles/:id/share — Record share signal */
  server.post<{ Params: { id: string } }>('/:id/share', async (request) => {
    const { id } = request.params;
    const body = parseBody(request, articleActionSchema);
    logger.info('Article shared', { articleId: id, userId: body.userId });

    await recordArticleShare(id, body.userId);
    return { success: true, articleId: id };
  });

  /** POST /api/articles/:id/bookmark — Bookmark/unbookmark */
  server.post<{ Params: { id: string } }>('/:id/bookmark', async (request) => {
    const { id } = request.params;
    const body = parseBody(request, bookmarkSchema);
    logger.info('Article bookmark toggled', { articleId: id, userId: body.userId, bookmarked: body.bookmarked });

    const result = await toggleArticleBookmark(id, body.userId, body.bookmarked);
    return { success: true, articleId: id, ...result };
  });
}
