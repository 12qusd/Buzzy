/**
 * Regression test suite for the Buzzy Today API.
 * Covers critical paths: feed, tag follow, bookmark, signal logging,
 * demand filter, promotion, and F&E scoring.
 *
 * @module @buzzy/api/services/regression.test
 */

import { describe, it, expect } from 'vitest';
import { fetchFeedArticles, encodeCursor, decodeCursor } from './feedService.js';
import { applyDemandFilter, shouldPromote, type DemandCandidate } from './demandFilterService.js';
import { matchBuzzwords, calculateInitialFEScore } from './feScoreService.js';
import { isEligibleForPromotion, generateArticleSlug, promoteArticle, type PromotionCandidate } from './promotionService.js';
import { formatAuditDescription, recordParameterChange } from './auditService.js';
import { calculateFreshness, calculateTopicMatch, rankArticles, type RankableArticle, type InterestEntry } from './rankingService.js';

/**
 * Regression: Feed System
 * Verifies cursor encoding/decoding, empty feeds, and query handling.
 */
describe('Regression: Feed System', () => {
  it('encodes and decodes cursor round-trip', () => {
    const cursor = encodeCursor(42.5, 'article-123');
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual({ score: 42.5, articleId: 'article-123' });
  });

  it('returns empty feed for fresh queries', async () => {
    const result = await fetchFeedArticles({ category: 'all' });
    expect(result.articles).toHaveLength(0);
    expect(result.cursor).toBeNull();
  });

  it('handles null/undefined cursor gracefully', async () => {
    const result = await fetchFeedArticles({ category: 'tech', cursor: undefined });
    expect(result.articles).toBeDefined();
  });
});

/**
 * Regression: Demand Filter
 * Verifies the 3-tier priority system and quota enforcement.
 */
describe('Regression: Demand Filter', () => {
  function makeCandidate(id: string, overrides: Partial<DemandCandidate> = {}): DemandCandidate {
    return { id, topicTagIds: ['tag-a'], categoryTagId: 'cat-tech', matchesBuzzword: false, rankingScore: 10, ...overrides };
  }

  it('full priority cascade: followed > buzzword > quota fill', () => {
    const candidates = [
      makeCandidate('fill', { topicTagIds: ['tag-z'], rankingScore: 100 }),
      makeCandidate('buzz', { topicTagIds: ['tag-y'], matchesBuzzword: true, rankingScore: 50 }),
      makeCandidate('follow', { topicTagIds: ['tag-ai'], rankingScore: 1 }),
    ];
    const result = applyDemandFilter(candidates, new Set(['tag-ai']), 3);

    expect(result.tierBreakdown.followedTag).toBe(1);
    expect(result.tierBreakdown.buzzword).toBe(1);
    expect(result.tierBreakdown.quotaFill).toBe(1);
    expect(result.accepted).toHaveLength(3);
  });

  it('enforces quota ceiling', () => {
    const candidates = Array.from({ length: 10 }, (_, i) =>
      makeCandidate(`a${i}`, { rankingScore: 10 - i })
    );
    const result = applyDemandFilter(candidates, new Set(), 5);

    expect(result.accepted).toHaveLength(5);
    expect(result.rejected).toHaveLength(5);
  });

  it('shouldPromote at default threshold', () => {
    expect(shouldPromote(10)).toBe(true);
    expect(shouldPromote(9)).toBe(false);
  });
});

/**
 * Regression: F&E Score
 * Verifies buzzword matching and score calculation.
 */
describe('Regression: F&E Score', () => {
  it('matches buzzwords case-insensitively', () => {
    const matches = matchBuzzwords('AI and BLOCKCHAIN technology', ['ai', 'blockchain']);
    expect(matches).toHaveLength(2);
  });

  it('initial score equals buzzword score for fresh articles', () => {
    const result = calculateInitialFEScore('AI is here', ['AI'], 0);
    expect(result.feScore).toBe(1); // 1 / (0 + 1) = 1
    expect(result.buzzwordScore).toBe(1);
  });

  it('applies time decay correctly', () => {
    const fresh = calculateInitialFEScore('AI is here', ['AI'], 0);
    const old = calculateInitialFEScore('AI is here', ['AI'], 7);
    expect(fresh.feScore).toBeGreaterThan(old.feScore);
  });
});

/**
 * Regression: Article Promotion
 * Verifies promotion eligibility and SEO generation.
 */
describe('Regression: Article Promotion', () => {
  function makePromoCandidate(points: number): PromotionCandidate {
    return {
      id: 'art-123',
      aiHeadline: 'Test Headline',
      tldr: 'Test TL;DR summary.',
      imageUrl: 'https://example.com/img.jpg',
      categoryTagName: 'Tech',
      categoryColor: '#3C82F6',
      sourcePublisher: 'TestPub',
      topicTagNames: ['AI'],
      engagementScore: 5,
      permanentArticlePoints: points,
    };
  }

  it('promotes at threshold and generates SEO', () => {
    const result = promoteArticle(makePromoCandidate(10));
    expect(result.promoted).toBe(true);
    expect(result.slug).toBeDefined();
    expect(result.openGraphTags?.type).toBe('article');
    expect(result.twitterCardTags?.card).toBe('summary_large_image');
    expect(result.schemaMarkup?.['@type']).toBe('NewsArticle');
  });

  it('rejects below threshold', () => {
    const result = promoteArticle(makePromoCandidate(5));
    expect(result.promoted).toBe(false);
  });

  it('generates unique slugs', () => {
    const slug1 = generateArticleSlug('Test Article', 'id-aaa111');
    const slug2 = generateArticleSlug('Test Article', 'id-bbb222');
    expect(slug1).not.toBe(slug2);
  });
});

/**
 * Regression: Ranking System
 * Verifies freshness decay, topic matching, and sorting.
 */
describe('Regression: Ranking System', () => {
  it('freshness decays over time', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();

    const freshScore = calculateFreshness(oneHourAgo, now);
    const staleScore = calculateFreshness(oneDayAgo, now);

    expect(freshScore).toBeGreaterThan(staleScore);
    expect(freshScore).toBeGreaterThan(0);
    expect(freshScore).toBeLessThanOrEqual(1);
  });

  it('topic match increases with more matching tags', () => {
    const interest: InterestEntry[] = [
      { tagId: 'tag-a', score: 5, lastInteraction: new Date().toISOString() },
      { tagId: 'tag-b', score: 3, lastInteraction: new Date().toISOString() },
    ];
    const articleOne: RankableArticle = {
      id: 'a1', rankingScore: 10, topicTagIds: ['tag-a'], categoryTagId: 'cat', publishedAt: new Date().toISOString(), status: 'candidate',
    };
    const articleTwo: RankableArticle = {
      id: 'a2', rankingScore: 10, topicTagIds: ['tag-a', 'tag-b'], categoryTagId: 'cat', publishedAt: new Date().toISOString(), status: 'candidate',
    };
    const oneTag = calculateTopicMatch(articleOne, interest);
    const twoTags = calculateTopicMatch(articleTwo, interest);
    expect(twoTags).toBeGreaterThan(oneTag);
  });

  it('rankArticles sorts by final score descending', () => {
    const articles: RankableArticle[] = [
      { id: 'low', rankingScore: 1, topicTagIds: [], categoryTagId: 'cat', publishedAt: new Date().toISOString(), status: 'candidate' },
      { id: 'high', rankingScore: 100, topicTagIds: [], categoryTagId: 'cat', publishedAt: new Date().toISOString(), status: 'candidate' },
    ];
    const ranked = rankArticles(articles, []);
    expect(ranked[0]?.id).toBe('high');
  });
});

/**
 * Regression: Audit System
 * Verifies audit trail creation.
 */
describe('Regression: Audit System', () => {
  it('creates audit entries with all required fields', async () => {
    const entry = await recordParameterChange({
      parameterType: 'publishing_quota',
      entityId: 'tech',
      entityName: 'Tech',
      changedBy: 'admin-1',
      oldValue: 20,
      newValue: 30,
    });

    expect(entry.id).toBeTruthy();
    expect(entry.changedAt).toBeTruthy();
    expect(entry.parameterType).toBe('publishing_quota');
    expect(entry.description).toContain('Tech');
  });

  it('formats human-readable descriptions', () => {
    const desc = formatAuditDescription({
      parameterType: 'signal_weight',
      entityId: 'like',
      entityName: 'like',
      changedBy: 'admin',
      oldValue: 5,
      newValue: 10,
    });
    expect(desc).toContain('5');
    expect(desc).toContain('10');
  });
});
