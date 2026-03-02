/**
 * Tests for signal validator schemas.
 *
 * @module @buzzy/api/validators/signals.validators.test
 */

import { describe, it, expect } from 'vitest';
import { signalSchema, batchSignalsSchema } from './signals.validators.js';

describe('signalSchema', () => {
  const validSignal = {
    userId: 'user-123',
    articleId: 'article-456',
    signalType: 'click' as const,
    categoryTagId: 'tech-001',
  };

  it('accepts valid signal', () => {
    const result = signalSchema.parse(validSignal);
    expect(result.userId).toBe('user-123');
    expect(result.topicTagIds).toEqual([]); // default
  });

  it('accepts all signal types', () => {
    const types = ['impression', 'click', 'tap', 'scroll', 'like', 'comment', 'share', 'bookmark', 'source_click', 'follow_tag', 'follow_category'];
    for (const signalType of types) {
      expect(() => signalSchema.parse({ ...validSignal, signalType })).not.toThrow();
    }
  });

  it('rejects invalid signal type', () => {
    expect(() => signalSchema.parse({ ...validSignal, signalType: 'invalid' })).toThrow();
  });

  it('rejects empty userId', () => {
    expect(() => signalSchema.parse({ ...validSignal, userId: '' })).toThrow();
  });

  it('accepts optional value', () => {
    const result = signalSchema.parse({ ...validSignal, value: 5.5 });
    expect(result.value).toBe(5.5);
  });

  it('accepts topicTagIds', () => {
    const result = signalSchema.parse({ ...validSignal, topicTagIds: ['tag-1', 'tag-2'] });
    expect(result.topicTagIds).toEqual(['tag-1', 'tag-2']);
  });
});

describe('batchSignalsSchema', () => {
  const validSignal = {
    userId: 'user-123',
    articleId: 'article-456',
    signalType: 'click' as const,
    categoryTagId: 'tech-001',
  };

  it('accepts valid batch', () => {
    const result = batchSignalsSchema.parse({ signals: [validSignal] });
    expect(result.signals).toHaveLength(1);
  });

  it('rejects empty batch', () => {
    expect(() => batchSignalsSchema.parse({ signals: [] })).toThrow();
  });

  it('rejects batch over 100', () => {
    const signals = Array.from({ length: 101 }, () => validSignal);
    expect(() => batchSignalsSchema.parse({ signals })).toThrow();
  });
});
