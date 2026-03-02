/**
 * Zod validation schemas for category API endpoints.
 *
 * @module @buzzy/api/validators/categories
 */

import { z } from 'zod';

/** Schema for category follow/unfollow body */
export const categoryFollowSchema = z.object({
  userId: z.string().min(1),
  following: z.boolean(),
});

export type CategoryFollowInput = z.infer<typeof categoryFollowSchema>;
