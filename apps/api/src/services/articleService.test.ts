/**
 * Tests for the article service.
 *
 * @module @buzzy/api/services/articleService.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  getArticleById,
  getTrendingArticles,
  getLatestArticles,
  getArticlesByCategory,
  getArticlesByTag,
  toggleArticleLike,
  recordArticleShare,
  toggleArticleBookmark,
} from './articleService.js';

describe('ArticleService', () => {
  beforeAll(() => {
    process.env['USE_SEED_DATA'] = 'false';
  });

  describe('getArticleById', () => {
    it('returns null for non-existent article', async () => {
      const result = await getArticleById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getTrendingArticles', () => {
    it('returns empty array when no articles exist', async () => {
      const result = await getTrendingArticles();
      expect(result).toEqual([]);
    });

    it('respects limit parameter', async () => {
      const result = await getTrendingArticles(5);
      expect(result).toEqual([]);
    });
  });

  describe('getLatestArticles', () => {
    it('returns empty array when no articles exist', async () => {
      const result = await getLatestArticles();
      expect(result).toEqual([]);
    });

    it('respects limit parameter', async () => {
      const result = await getLatestArticles(10);
      expect(result).toEqual([]);
    });
  });

  describe('getArticlesByCategory', () => {
    it('returns empty result for unknown category', async () => {
      const result = await getArticlesByCategory('unknown-cat');
      expect(result.articles).toEqual([]);
      expect(result.cursor).toBeNull();
    });

    it('accepts cursor parameter', async () => {
      const result = await getArticlesByCategory('tech', 20, 'some-cursor');
      expect(result.articles).toBeDefined();
    });
  });

  describe('getArticlesByTag', () => {
    it('returns empty result for unknown tag', async () => {
      const result = await getArticlesByTag('unknown-tag');
      expect(result.articles).toEqual([]);
      expect(result.cursor).toBeNull();
    });

    it('accepts limit and cursor parameters', async () => {
      const result = await getArticlesByTag('ai', 10, 'cursor-abc');
      expect(result.articles).toBeDefined();
    });
  });

  describe('toggleArticleLike', () => {
    it('returns liked status', async () => {
      const result = await toggleArticleLike('art-1', 'user-1');
      expect(result.liked).toBe(true);
      expect(result.likeCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('recordArticleShare', () => {
    it('completes without error', async () => {
      await expect(recordArticleShare('art-1', 'user-1')).resolves.toBeUndefined();
    });
  });

  describe('toggleArticleBookmark', () => {
    it('returns bookmarked status when bookmarking', async () => {
      const result = await toggleArticleBookmark('art-1', 'user-1', true);
      expect(result.bookmarked).toBe(true);
    });

    it('returns unbookmarked status when unbookmarking', async () => {
      const result = await toggleArticleBookmark('art-1', 'user-1', false);
      expect(result.bookmarked).toBe(false);
    });
  });
});
