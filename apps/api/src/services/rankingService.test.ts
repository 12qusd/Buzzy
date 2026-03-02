/**
 * Tests for the ranking service.
 *
 * @module @buzzy/api/services/rankingService.test
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFreshness,
  calculateTopicMatch,
  rankArticles,
  type RankableArticle,
  type InterestEntry,
} from './rankingService.js';

const NOW = new Date('2026-03-01T12:00:00Z');

function makeArticle(overrides: Partial<RankableArticle> = {}): RankableArticle {
  return {
    id: 'article-1',
    rankingScore: 10,
    topicTagIds: ['tag-ai', 'tag-tech'],
    categoryTagId: 'cat-tech',
    publishedAt: '2026-03-01T06:00:00Z',
    status: 'candidate',
    ...overrides,
  };
}

describe('calculateFreshness', () => {
  it('returns 1 for articles published now', () => {
    const freshness = calculateFreshness('2026-03-01T12:00:00Z', NOW);
    expect(freshness).toBeCloseTo(1, 2);
  });

  it('returns ~0.5 at half-life (24h)', () => {
    const freshness = calculateFreshness('2026-02-28T12:00:00Z', NOW);
    expect(freshness).toBeCloseTo(0.5, 1);
  });

  it('returns ~0.25 at 2x half-life (48h)', () => {
    const freshness = calculateFreshness('2026-02-27T12:00:00Z', NOW);
    expect(freshness).toBeCloseTo(0.25, 1);
  });

  it('returns 1 for future dates', () => {
    const freshness = calculateFreshness('2026-03-02T12:00:00Z', NOW);
    expect(freshness).toBe(1);
  });

  it('returns very small number for old articles', () => {
    const freshness = calculateFreshness('2026-01-01T00:00:00Z', NOW);
    expect(freshness).toBeLessThan(0.01);
  });
});

describe('calculateTopicMatch', () => {
  it('returns 1 when interest graph is empty', () => {
    const score = calculateTopicMatch(makeArticle(), []);
    expect(score).toBe(1);
  });

  it('returns match score based on topic tags', () => {
    const interestGraph: InterestEntry[] = [
      { tagId: 'tag-ai', score: 5, lastInteraction: '2026-03-01' },
      { tagId: 'tag-tech', score: 3, lastInteraction: '2026-03-01' },
    ];
    const score = calculateTopicMatch(makeArticle(), interestGraph);
    expect(score).toBe(8); // 5 + 3
  });

  it('adds half-weight category score', () => {
    const interestGraph: InterestEntry[] = [
      { tagId: 'cat:cat-tech', score: 10, lastInteraction: '2026-03-01' },
    ];
    const score = calculateTopicMatch(makeArticle(), interestGraph);
    expect(score).toBe(5); // 10 * 0.5
  });

  it('combines topic and category scores', () => {
    const interestGraph: InterestEntry[] = [
      { tagId: 'tag-ai', score: 4, lastInteraction: '2026-03-01' },
      { tagId: 'cat:cat-tech', score: 6, lastInteraction: '2026-03-01' },
    ];
    const score = calculateTopicMatch(makeArticle(), interestGraph);
    expect(score).toBe(7); // 4 + 6*0.5
  });

  it('returns minimum 0.1 even with no matches', () => {
    const interestGraph: InterestEntry[] = [
      { tagId: 'tag-other', score: 100, lastInteraction: '2026-03-01' },
    ];
    const score = calculateTopicMatch(makeArticle(), interestGraph);
    expect(score).toBe(0.1);
  });
});

describe('rankArticles', () => {
  it('sorts by personalized score descending', () => {
    const articles = [
      makeArticle({ id: 'low', rankingScore: 5, publishedAt: '2026-03-01T10:00:00Z' }),
      makeArticle({ id: 'high', rankingScore: 20, publishedAt: '2026-03-01T10:00:00Z' }),
      makeArticle({ id: 'mid', rankingScore: 10, publishedAt: '2026-03-01T10:00:00Z' }),
    ];

    const ranked = rankArticles(articles, [], NOW);
    expect(ranked.map((a) => a.id)).toEqual(['high', 'mid', 'low']);
  });

  it('freshness boosts recent articles', () => {
    const articles = [
      makeArticle({ id: 'old-high', rankingScore: 20, publishedAt: '2026-02-27T00:00:00Z' }),
      makeArticle({ id: 'new-low', rankingScore: 10, publishedAt: '2026-03-01T11:00:00Z' }),
    ];

    const ranked = rankArticles(articles, [], NOW);
    // New article with lower base score should rank higher due to freshness
    expect(ranked[0]?.id).toBe('new-low');
  });

  it('personalization boosts matching articles', () => {
    const articles = [
      makeArticle({ id: 'unmatched', rankingScore: 15, topicTagIds: ['tag-sports'], publishedAt: '2026-03-01T10:00:00Z' }),
      makeArticle({ id: 'matched', rankingScore: 10, topicTagIds: ['tag-ai'], publishedAt: '2026-03-01T10:00:00Z' }),
    ];

    const interestGraph: InterestEntry[] = [
      { tagId: 'tag-ai', score: 10, lastInteraction: '2026-03-01' },
    ];

    const ranked = rankArticles(articles, interestGraph, NOW);
    expect(ranked[0]?.id).toBe('matched');
  });

  it('handles empty article list', () => {
    const ranked = rankArticles([], []);
    expect(ranked).toEqual([]);
  });

  it('returns all articles with computed scores', () => {
    const articles = [makeArticle(), makeArticle({ id: 'article-2' })];
    const ranked = rankArticles(articles, [], NOW);
    expect(ranked).toHaveLength(2);
    for (const article of ranked) {
      expect(article.personalizedScore).toBeGreaterThan(0);
    }
  });
});
