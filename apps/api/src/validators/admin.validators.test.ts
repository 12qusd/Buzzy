/**
 * Tests for admin validator schemas.
 *
 * @module @buzzy/api/validators/admin.validators.test
 */

import { describe, it, expect } from 'vitest';
import {
  addRssSourceSchema,
  approveTagSchema,
  rejectTagSchema,
  updateQuotaSchema,
  updateSummarizationConfigSchema,
} from './admin.validators.js';

describe('addRssSourceSchema', () => {
  it('accepts valid input', () => {
    const result = addRssSourceSchema.parse({
      channelName: 'TechCrunch',
      publisherName: 'TechCrunch Media',
      feedUrl: 'https://techcrunch.com/feed/',
    });
    expect(result.channelName).toBe('TechCrunch');
    expect(result.tagBasedClassification).toBe(true); // default
  });

  it('rejects missing channelName', () => {
    expect(() => addRssSourceSchema.parse({
      publisherName: 'P',
      feedUrl: 'https://example.com/feed',
    })).toThrow();
  });

  it('rejects invalid URL', () => {
    expect(() => addRssSourceSchema.parse({
      channelName: 'C',
      publisherName: 'P',
      feedUrl: 'not-a-url',
    })).toThrow();
  });

  it('accepts optional fields', () => {
    const result = addRssSourceSchema.parse({
      channelName: 'ESPN',
      publisherName: 'ESPN Inc',
      feedUrl: 'https://espn.com/feed',
      assignedCategoryId: 'sports-123',
      tagBasedClassification: false,
    });
    expect(result.assignedCategoryId).toBe('sports-123');
    expect(result.tagBasedClassification).toBe(false);
  });
});

describe('approveTagSchema', () => {
  it('accepts empty body', () => {
    const result = approveTagSchema.parse({});
    expect(result.displayName).toBeUndefined();
  });

  it('accepts overrides', () => {
    const result = approveTagSchema.parse({
      displayName: 'Artificial Intelligence',
      bucketId: 'ai-bucket',
      tagType: 'Technology',
      categoryId: 'tech-123',
    });
    expect(result.displayName).toBe('Artificial Intelligence');
  });

  it('rejects displayName over 100 chars', () => {
    expect(() => approveTagSchema.parse({
      displayName: 'x'.repeat(101),
    })).toThrow();
  });
});

describe('rejectTagSchema', () => {
  it('accepts empty body', () => {
    const result = rejectTagSchema.parse({});
    expect(result.reason).toBeUndefined();
  });

  it('accepts reason', () => {
    const result = rejectTagSchema.parse({ reason: 'Too vague' });
    expect(result.reason).toBe('Too vague');
  });

  it('rejects reason over 500 chars', () => {
    expect(() => rejectTagSchema.parse({ reason: 'x'.repeat(501) })).toThrow();
  });
});

describe('updateQuotaSchema', () => {
  it('accepts valid quota', () => {
    const result = updateQuotaSchema.parse({ dailyLimit: 50 });
    expect(result.dailyLimit).toBe(50);
  });

  it('rejects negative dailyLimit', () => {
    expect(() => updateQuotaSchema.parse({ dailyLimit: -1 })).toThrow();
  });

  it('rejects dailyLimit over 1000', () => {
    expect(() => updateQuotaSchema.parse({ dailyLimit: 1001 })).toThrow();
  });

  it('rejects non-integer dailyLimit', () => {
    expect(() => updateQuotaSchema.parse({ dailyLimit: 50.5 })).toThrow();
  });

  it('accepts randomInjectionPercent', () => {
    const result = updateQuotaSchema.parse({ dailyLimit: 50, randomInjectionPercent: 15 });
    expect(result.randomInjectionPercent).toBe(15);
  });
});

describe('updateSummarizationConfigSchema', () => {
  it('accepts partial update', () => {
    const result = updateSummarizationConfigSchema.parse({
      tone: 'professional',
      emojisAllowed: false,
    });
    expect(result.tone).toBe('professional');
    expect(result.emojisAllowed).toBe(false);
  });

  it('accepts fallback image URLs', () => {
    const result = updateSummarizationConfigSchema.parse({
      fallbackImageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    });
    expect(result.fallbackImageUrls).toHaveLength(2);
  });

  it('rejects invalid fallback URLs', () => {
    expect(() => updateSummarizationConfigSchema.parse({
      fallbackImageUrls: ['not-a-url'],
    })).toThrow();
  });
});
