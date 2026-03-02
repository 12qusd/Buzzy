/**
 * Zod validation schemas for topic tag API endpoints.
 *
 * @module @buzzy/api/validators/tags
 */

import { z } from 'zod';

/** Schema for tag search query parameters */
export const tagSearchSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/** Schema for tag follow/unfollow body */
export const tagFollowSchema = z.object({
  userId: z.string().min(1),
  following: z.boolean(),
});

export type TagSearchInput = z.infer<typeof tagSearchSchema>;
export type TagFollowInput = z.infer<typeof tagFollowSchema>;
