/**
 * Tests for the comment service.
 *
 * @module @buzzy/api/services/commentService.test
 */

import { describe, it, expect } from 'vitest';
import { getArticleComments, createComment, toggleCommentLike, deleteComment } from './commentService.js';

describe('CommentService', () => {
  describe('getArticleComments', () => {
    it('returns empty list for article with no comments', async () => {
      const result = await getArticleComments('art-999');
      expect(result.comments).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.cursor).toBeNull();
    });

    it('accepts pagination parameters', async () => {
      const result = await getArticleComments('art-1', 10, '2026-01-01T00:00:00Z', 'user-1');
      expect(result.comments).toBeDefined();
      expect(result.cursor).toBeNull();
    });
  });

  describe('createComment', () => {
    it('creates a comment with all required fields', async () => {
      const comment = await createComment({
        articleId: 'art-1',
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        content: 'Great article!',
      });

      expect(comment.id).toBeTruthy();
      expect(comment.articleId).toBe('art-1');
      expect(comment.userId).toBe('user-1');
      expect(comment.username).toBe('testuser');
      expect(comment.displayName).toBe('Test User');
      expect(comment.content).toBe('Great article!');
      expect(comment.likeCount).toBe(0);
      expect(comment.isTopTake).toBe(false);
      expect(comment.isLikedByUser).toBe(false);
      expect(comment.createdAt).toBeTruthy();
      expect(comment.updatedAt).toBeTruthy();
    });

    it('handles optional avatarUrl', async () => {
      const withAvatar = await createComment({
        articleId: 'art-1',
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test',
        avatarUrl: 'https://example.com/avatar.jpg',
        content: 'Hello',
      });
      expect(withAvatar.avatarUrl).toBe('https://example.com/avatar.jpg');

      const withoutAvatar = await createComment({
        articleId: 'art-1',
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test',
        content: 'Hello',
      });
      expect(withoutAvatar.avatarUrl).toBeNull();
    });

    it('generates unique comment IDs', async () => {
      const c1 = await createComment({
        articleId: 'art-1',
        userId: 'user-1',
        username: 'test',
        displayName: 'Test',
        content: 'First',
      });
      const c2 = await createComment({
        articleId: 'art-1',
        userId: 'user-1',
        username: 'test',
        displayName: 'Test',
        content: 'Second',
      });
      expect(c1.id).not.toBe(c2.id);
    });
  });

  describe('toggleCommentLike', () => {
    it('returns liked status when liking', async () => {
      const result = await toggleCommentLike('comment-1', 'art-1', 'user-1', true);
      expect(result.liked).toBe(true);
      expect(result.likeCount).toBe(1);
    });

    it('returns unliked status when unliking', async () => {
      const result = await toggleCommentLike('comment-1', 'art-1', 'user-1', false);
      expect(result.liked).toBe(false);
      expect(result.likeCount).toBe(0);
    });
  });

  describe('deleteComment', () => {
    it('returns true on successful deletion', async () => {
      const result = await deleteComment('comment-1', 'art-1', 'user-1');
      expect(result).toBe(true);
    });
  });
});
