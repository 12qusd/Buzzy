/**
 * Zod validation schemas for article API endpoints.
 *
 * @module @buzzy/api/validators/articles
 */

import { z } from 'zod';

/** Schema for feed query parameters */
export const feedQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  userId: z.string().optional(),
});

/** Schema for article engagement actions */
export const articleActionSchema = z.object({
  userId: z.string().min(1),
});

/** Schema for bookmark toggle */
export const bookmarkSchema = z.object({
  userId: z.string().min(1),
  bookmarked: z.boolean(),
});

export type FeedQueryInput = z.infer<typeof feedQuerySchema>;
export type ArticleActionInput = z.infer<typeof articleActionSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
