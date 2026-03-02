/**
 * Tests for the feed service.
 *
 * @module @buzzy/api/services/feedService.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { encodeCursor, decodeCursor, fetchFeedArticles } from './feedService.js';

beforeAll(() => {
  process.env['USE_SEED_DATA'] = 'false';
});

describe('encodeCursor / decodeCursor', () => {
  it('round-trips correctly', () => {
    const cursor = encodeCursor(42.5, 'article-abc-123');
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual({ score: 42.5, articleId: 'article-abc-123' });
  });

  it('returns null for invalid cursor', () => {
    expect(decodeCursor('not-valid-base64!!!')).toBeNull();
  });

  it('returns null for valid base64 but wrong shape', () => {
    const bad = Buffer.from(JSON.stringify({ x: 1 })).toString('base64url');
    expect(decodeCursor(bad)).toBeNull();
  });

  it('handles zero score', () => {
    const cursor = encodeCursor(0, 'id-zero');
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual({ score: 0, articleId: 'id-zero' });
  });

  it('handles negative score', () => {
    const cursor = encodeCursor(-5, 'id-neg');
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual({ score: -5, articleId: 'id-neg' });
  });
});

describe('fetchFeedArticles', () => {
  it('returns empty feed with metadata', async () => {
    const result = await fetchFeedArticles({ limit: 20 });
    expect(result.articles).toEqual([]);
    expect(result.cursor).toBeNull();
    expect(result.meta.limit).toBe(20);
    expect(result.meta.category).toBeNull();
  });

  it('passes category filter through to meta', async () => {
    const result = await fetchFeedArticles({ limit: 10, category: 'tech' });
    expect(result.meta.category).toBe('tech');
    expect(result.meta.limit).toBe(10);
  });

  it('handles invalid cursor gracefully', async () => {
    const result = await fetchFeedArticles({ limit: 20, cursor: 'bad-cursor' });
    expect(result.articles).toEqual([]);
  });
});
