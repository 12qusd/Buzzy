/**
 * Tests for the article promotion service.
 *
 * @module @buzzy/api/services/promotionService.test
 */

import { describe, it, expect } from 'vitest';
import {
  isEligibleForPromotion,
  generateArticleSlug,
  generateOpenGraphTags,
  generateTwitterCardTags,
  generateSchemaMarkup,
  promoteArticle,
  type PromotionCandidate,
} from './promotionService.js';

function makeCandidate(overrides: Partial<PromotionCandidate> = {}): PromotionCandidate {
  return {
    id: 'abc123def456',
    aiHeadline: 'AI Breakthrough Changes Everything',
    tldr: 'Researchers have made a significant breakthrough in artificial intelligence that could reshape the tech industry.',
    imageUrl: 'https://example.com/image.jpg',
    categoryTagName: 'Tech',
    categoryColor: '#3C82F6',
    sourcePublisher: 'TechCrunch',
    topicTagNames: ['AI', 'Machine Learning'],
    engagementScore: 5,
    permanentArticlePoints: 12,
    ...overrides,
  };
}

describe('isEligibleForPromotion', () => {
  it('returns true when points meet threshold', () => {
    expect(isEligibleForPromotion(10)).toBe(true);
  });

  it('returns true when points exceed threshold', () => {
    expect(isEligibleForPromotion(25)).toBe(true);
  });

  it('returns false when points below threshold', () => {
    expect(isEligibleForPromotion(9)).toBe(false);
  });

  it('returns false at zero', () => {
    expect(isEligibleForPromotion(0)).toBe(false);
  });

  it('supports custom threshold', () => {
    expect(isEligibleForPromotion(5, 5)).toBe(true);
    expect(isEligibleForPromotion(4, 5)).toBe(false);
  });
});

describe('generateArticleSlug', () => {
  it('generates slug from headline with ID suffix', () => {
    const slug = generateArticleSlug('AI Breakthrough Changes Everything', 'abc123def456');
    expect(slug).toBe('ai-breakthrough-changes-everything-abc123');
  });

  it('handles special characters in headline', () => {
    const slug = generateArticleSlug('Apple\'s $5B Deal & New Strategy', 'xyz789');
    expect(slug).toMatch(/^apples-5b-deal-and-new-strategy-xyz789$/);
  });

  it('uses first 6 chars of article ID', () => {
    const slug = generateArticleSlug('Test', 'abcdefghijklmnop');
    expect(slug).toBe('test-abcdef');
  });
});

describe('generateOpenGraphTags', () => {
  it('generates correct OG tags', () => {
    const article = makeCandidate();
    const og = generateOpenGraphTags(article, 'https://buzzy.today/ai-breakthrough-abc123');

    expect(og.title).toBe('AI Breakthrough Changes Everything');
    expect(og.type).toBe('article');
    expect(og.siteName).toBe('Buzzy Today');
    expect(og.url).toBe('https://buzzy.today/ai-breakthrough-abc123');
    expect(og.image).toBe('https://example.com/image.jpg');
  });

  it('truncates description to 200 chars', () => {
    const longTldr = 'A'.repeat(300);
    const og = generateOpenGraphTags({ ...makeCandidate(), tldr: longTldr }, '/test');
    expect(og.description).toHaveLength(200);
  });
});

describe('generateTwitterCardTags', () => {
  it('generates correct Twitter Card tags', () => {
    const article = makeCandidate();
    const tc = generateTwitterCardTags(article);

    expect(tc.card).toBe('summary_large_image');
    expect(tc.title).toBe('AI Breakthrough Changes Everything');
    expect(tc.site).toBe('@buzzytoday');
    expect(tc.image).toBe('https://example.com/image.jpg');
  });
});

describe('generateSchemaMarkup', () => {
  it('generates correct Schema.org markup', () => {
    const article = makeCandidate();
    const schema = generateSchemaMarkup(article, '2026-03-01T12:00:00.000Z');

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('NewsArticle');
    expect(schema.headline).toBe('AI Breakthrough Changes Everything');
    expect(schema.author.name).toBe('TechCrunch');
    expect(schema.publisher.name).toBe('Buzzy Today');
    expect(schema.datePublished).toBe('2026-03-01T12:00:00.000Z');
  });
});

describe('promoteArticle', () => {
  it('promotes article that meets threshold', () => {
    const article = makeCandidate({ permanentArticlePoints: 15 });
    const result = promoteArticle(article);

    expect(result.promoted).toBe(true);
    expect(result.slug).toContain('ai-breakthrough');
    expect(result.permalink).toContain('https://buzzy.today/');
    expect(result.openGraphTags).toBeDefined();
    expect(result.twitterCardTags).toBeDefined();
    expect(result.schemaMarkup).toBeDefined();
  });

  it('rejects article below threshold', () => {
    const article = makeCandidate({ permanentArticlePoints: 5 });
    const result = promoteArticle(article);

    expect(result.promoted).toBe(false);
    expect(result.slug).toBeUndefined();
    expect(result.permalink).toBeUndefined();
  });

  it('promotes at exactly threshold', () => {
    const article = makeCandidate({ permanentArticlePoints: 10 });
    const result = promoteArticle(article);

    expect(result.promoted).toBe(true);
  });

  it('supports custom threshold', () => {
    const article = makeCandidate({ permanentArticlePoints: 5 });
    const result = promoteArticle(article, 5);

    expect(result.promoted).toBe(true);
  });

  it('generates valid slug with ID suffix', () => {
    const article = makeCandidate({ id: 'test99id', permanentArticlePoints: 10 });
    const result = promoteArticle(article);

    expect(result.slug).toContain('test99');
  });

  it('generates all SEO fields on promotion', () => {
    const article = makeCandidate({ permanentArticlePoints: 20 });
    const result = promoteArticle(article);

    expect(result.openGraphTags?.type).toBe('article');
    expect(result.twitterCardTags?.card).toBe('summary_large_image');
    expect(result.schemaMarkup?.['@type']).toBe('NewsArticle');
  });
});
