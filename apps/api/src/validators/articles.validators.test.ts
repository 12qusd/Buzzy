/**
 * Tests for article validator schemas.
 *
 * @module @buzzy/api/validators/articles.validators.test
 */

import { describe, it, expect } from 'vitest';
import { feedQuerySchema, articleActionSchema, bookmarkSchema } from './articles.validators.js';

describe('feedQuerySchema', () => {
  it('applies defaults', () => {
    const result = feedQuerySchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.category).toBeUndefined();
    expect(result.cursor).toBeUndefined();
  });

  it('coerces limit from string', () => {
    const result = feedQuerySchema.parse({ limit: '10' });
    expect(result.limit).toBe(10);
  });

  it('rejects limit below 1', () => {
    expect(() => feedQuerySchema.parse({ limit: 0 })).toThrow();
  });

  it('rejects limit above 50', () => {
    expect(() => feedQuerySchema.parse({ limit: 51 })).toThrow();
  });

  it('accepts category filter', () => {
    const result = feedQuerySchema.parse({ category: 'tech', userId: 'u-123' });
    expect(result.category).toBe('tech');
    expect(result.userId).toBe('u-123');
  });
});

describe('articleActionSchema', () => {
  it('accepts valid userId', () => {
    const result = articleActionSchema.parse({ userId: 'user-123' });
    expect(result.userId).toBe('user-123');
  });

  it('rejects empty userId', () => {
    expect(() => articleActionSchema.parse({ userId: '' })).toThrow();
  });

  it('rejects missing userId', () => {
    expect(() => articleActionSchema.parse({})).toThrow();
  });
});

describe('bookmarkSchema', () => {
  it('accepts valid bookmark', () => {
    const result = bookmarkSchema.parse({ userId: 'u-1', bookmarked: true });
    expect(result.bookmarked).toBe(true);
  });

  it('requires bookmarked boolean', () => {
    expect(() => bookmarkSchema.parse({ userId: 'u-1' })).toThrow();
  });
});
