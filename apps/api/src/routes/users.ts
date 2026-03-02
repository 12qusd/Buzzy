/**
 * User routes for the Buzzy Today API.
 * Provides endpoints for profile, bookmarks, feed, notifications, and onboarding.
 *
 * @module @buzzy/api/routes/users
 */

import type { FastifyInstance } from 'fastify';
import { parseBody } from '../validators/index.js';
import { updateProfileSchema, onboardingSchema, feedbackSchema } from '../validators/users.validators.js';
import { submitFeedback } from '../services/feedbackService.js';
import { logger } from '../logger.js';

/**
 * Registers user routes.
 *
 * @param server - Fastify instance
 */
export async function userRoutes(server: FastifyInstance): Promise<void> {
  // TODO: Add auth preHandler hook when Firebase Auth is wired up

  /** GET /api/users/me — Current user profile */
  server.get('/me', async () => {
    // TODO: Resolve user from Firebase Auth token
    return { user: null };
  });

  /** PUT /api/users/me — Update profile */
  server.put('/me', async (request) => {
    const body = parseBody(request, updateProfileSchema);
    logger.info('Updating user profile', { fields: Object.keys(body) });
    // TODO: Update Firestore users/{uid}
    return { success: true, updated: body };
  });

  /** GET /api/users/me/bookmarks — User bookmarks */
  server.get('/me/bookmarks', async () => {
    // TODO: Query users/{uid}/bookmarks subcollection, resolve article details
    return { bookmarks: [] };
  });

  /** GET /api/users/me/feed — Personalized home feed */
  server.get('/me/feed', async () => {
    // TODO: Personalized ranking using interest graph + article scores
    return { feed: [], cursor: null };
  });

  /** PUT /api/users/me/notifications — Update notification preferences */
  server.put('/me/notifications', async () => {
    // TODO: Validate notification preferences schema, update Firestore
    return { success: true };
  });

  /** POST /api/users/me/onboarding — Complete onboarding */
  server.post('/me/onboarding', async (request) => {
    const body = parseBody(request, onboardingSchema);
    logger.info('Completing onboarding', { tagCount: body.followedTagIds.length });

    // TODO: Batch follow all selected tags
    // TODO: Set user.onboardingCompleted = true
    // TODO: Initialize interest graph from followed tags

    return {
      success: true,
      onboardingCompleted: true,
      followedTags: body.followedTagIds.length,
    };
  });

  /** POST /api/users/me/feedback — Submit user feedback */
  server.post('/me/feedback', async (request) => {
    const body = parseBody(request, feedbackSchema);
    // TODO: Get userId from Firebase Auth
    const userId = 'anonymous';
    logger.info('User feedback submitted', { type: body.type, userId });

    const record = await submitFeedback({
      ...body,
      userId,
    });

    return { success: true, feedbackId: record.id };
  });
}
