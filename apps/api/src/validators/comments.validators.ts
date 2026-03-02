/**
 * Zod validation schemas for comment API endpoints.
 *
 * @module @buzzy/api/validators/comments
 */

import { z } from 'zod';

/** Schema for creating a comment */
export const createCommentSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  content: z.string().min(1).max(2000),
});

/** Schema for listing comments query params */
export const commentListSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  userId: z.string().optional(),
});

/** Schema for liking a comment */
export const commentLikeSchema = z.object({
  userId: z.string().min(1),
  liked: z.boolean(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentListInput = z.infer<typeof commentListSchema>;
export type CommentLikeInput = z.infer<typeof commentLikeSchema>;
