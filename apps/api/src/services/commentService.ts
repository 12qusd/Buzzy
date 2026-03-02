/**
 * Comment service for the Buzzy Today API.
 * Handles CRUD operations for article comments, likes, and "Top Take" designation.
 *
 * Comments are stored in Firestore subcollection: articles/{articleId}/comments
 *
 * @module @buzzy/api/services/commentService
 */

import { logger } from '../logger.js';
import { SEED_COMMENTS } from '@buzzy/shared/seeds';

/** Input for creating a comment */
export interface CreateCommentInput {
  articleId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  content: string;
}

/** Comment as returned to API clients */
export interface CommentDTO {
  id: string;
  articleId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  content: string;
  likeCount: number;
  isTopTake: boolean;
  isLikedByUser: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Paginated comment list result */
export interface CommentListResult {
  comments: CommentDTO[];
  total: number;
  cursor: string | null;
}

/** Whether to use seed data (defaults to true when Firestore is not connected) */
const useSeedData = (): boolean => process.env['USE_SEED_DATA'] !== 'false';

/**
 * Fetches comments for an article with cursor-based pagination.
 *
 * @param articleId - Article to fetch comments for
 * @param limit - Maximum comments to return
 * @param cursor - Pagination cursor (ISO timestamp of last comment)
 * @param userId - Optional user ID to check like status
 * @returns Paginated comment list
 */
export async function getArticleComments(
  articleId: string,
  limit: number = 20,
  cursor?: string,
  userId?: string,
): Promise<CommentListResult> {
  logger.info('Fetching article comments', { articleId, limit, hasCursor: !!cursor });

  if (useSeedData()) {
    const comments = (SEED_COMMENTS[articleId] ?? []) as CommentDTO[];
    return { comments, total: comments.length, cursor: null };
  }

  // TODO: Firestore query
  return { comments: [], total: 0, cursor: null };
}

/**
 * Creates a new comment on an article.
 * Also increments the article's commentCount and records a 'comment' signal.
 *
 * @param input - Comment creation data
 * @returns The newly created comment
 */
export async function createComment(input: CreateCommentInput): Promise<CommentDTO> {
  logger.info('Creating comment', { articleId: input.articleId, userId: input.userId });

  const now = new Date().toISOString();
  const commentId = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const comment: CommentDTO = {
    id: commentId,
    articleId: input.articleId,
    userId: input.userId,
    username: input.username,
    displayName: input.displayName,
    avatarUrl: input.avatarUrl ?? null,
    content: input.content,
    likeCount: 0,
    isTopTake: false,
    isLikedByUser: false,
    createdAt: now,
    updatedAt: now,
  };

  // TODO: Firestore batch write:
  // 1. Add to articles/{articleId}/comments/{commentId}
  // 2. Increment articles/{articleId}.commentCount
  // 3. Record 'comment' signal via signalService

  logger.info('Comment created', { commentId, articleId: input.articleId });
  return comment;
}

/**
 * Toggles a like on a comment.
 * Updates the comment's likeCount and records a signal.
 *
 * @param commentId - Comment to like/unlike
 * @param articleId - Parent article ID
 * @param userId - User performing the action
 * @param liked - Whether to like (true) or unlike (false)
 * @returns Updated like status and count
 */
export async function toggleCommentLike(
  commentId: string,
  articleId: string,
  userId: string,
  liked: boolean,
): Promise<{ liked: boolean; likeCount: number }> {
  logger.info('Toggling comment like', { commentId, articleId, userId, liked });

  // TODO: Firestore transaction:
  // 1. Upsert articles/{articleId}/comments/{commentId}/likes/{userId}
  // 2. Increment/decrement likeCount on comment doc
  // 3. Check if likeCount crosses "Top Take" threshold

  return { liked, likeCount: liked ? 1 : 0 };
}

/**
 * Deletes a comment. Only the comment author or an admin can delete.
 *
 * @param commentId - Comment to delete
 * @param articleId - Parent article ID
 * @param userId - User requesting deletion
 * @returns Whether the deletion succeeded
 */
export async function deleteComment(
  commentId: string,
  articleId: string,
  userId: string,
): Promise<boolean> {
  logger.info('Deleting comment', { commentId, articleId, userId });

  // TODO: Firestore transaction:
  // 1. Verify comment.userId === userId (or user is admin)
  // 2. Delete articles/{articleId}/comments/{commentId}
  // 3. Decrement articles/{articleId}.commentCount

  return true;
}
