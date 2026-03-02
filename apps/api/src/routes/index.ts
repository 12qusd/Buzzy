/**
 * Route registration for all API endpoint groups.
 * Each route module is registered under its URL prefix.
 *
 * @module @buzzy/api/routes
 */

import type { FastifyInstance } from 'fastify';
import { articleRoutes } from './articles.js';
import { tagRoutes } from './tags.js';
import { categoryRoutes } from './categories.js';
import { userRoutes } from './users.js';
import { signalRoutes } from './signals.js';
import { commentRoutes } from './comments.js';
import { adminRoutes } from './admin.js';
import { digestRoutes } from './digest.js';

/**
 * Registers all route groups on the Fastify instance.
 *
 * @param server - The Fastify server instance
 */
export async function registerRoutes(server: FastifyInstance): Promise<void> {
  await server.register(articleRoutes, { prefix: '/api/articles' });
  await server.register(tagRoutes, { prefix: '/api/tags' });
  await server.register(categoryRoutes, { prefix: '/api/categories' });
  await server.register(userRoutes, { prefix: '/api/users' });
  await server.register(signalRoutes, { prefix: '/api/signals' });
  await server.register(commentRoutes, { prefix: '/api/comments' });
  await server.register(adminRoutes, { prefix: '/api/admin' });
  await server.register(digestRoutes, { prefix: '/api/digest' });
}
