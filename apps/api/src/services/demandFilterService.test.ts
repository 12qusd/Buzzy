/**
 * Tests for the demand filter service.
 *
 * @module @buzzy/api/services/demandFilterService.test
 */

import { describe, it, expect } from 'vitest';
import {
  applyDemandFilter,
  shouldPromote,
  type DemandCandidate,
} from './demandFilterService.js';

function makeCandidate(overrides: Partial<DemandCandidate> = {}): DemandCandidate {
  return {
    id: 'article-1',
    topicTagIds: ['tag-ai'],
    categoryTagId: 'cat-tech',
    matchesBuzzword: false,
    rankingScore: 10,
    ...overrides,
  };
}

describe('applyDemandFilter', () => {
  it('accepts articles matching followed tags (Tier 1)', () => {
    const candidates = [makeCandidate({ id: 'a1', topicTagIds: ['tag-ai'] })];
    const result = applyDemandFilter(candidates, new Set(['tag-ai']), 10);

    expect(result.accepted).toHaveLength(1);
    expect(result.tierBreakdown.followedTag).toBe(1);
  });

  it('accepts buzzword articles (Tier 2)', () => {
    const candidates = [makeCandidate({ id: 'a1', topicTagIds: ['tag-other'], matchesBuzzword: true })];
    const result = applyDemandFilter(candidates, new Set(), 10);

    expect(result.accepted).toHaveLength(1);
    expect(result.tierBreakdown.buzzword).toBe(1);
  });

  it('accepts articles with tags as quota fill (Tier 3)', () => {
    const candidates = [makeCandidate({ id: 'a1', topicTagIds: ['tag-other'] })];
    const result = applyDemandFilter(candidates, new Set(), 10);

    expect(result.accepted).toHaveLength(1);
    expect(result.tierBreakdown.quotaFill).toBe(1);
  });

  it('rejects articles when quota is full', () => {
    const candidates = [
      makeCandidate({ id: 'a1', rankingScore: 20 }),
      makeCandidate({ id: 'a2', rankingScore: 10 }),
      makeCandidate({ id: 'a3', rankingScore: 5 }),
    ];
    const result = applyDemandFilter(candidates, new Set(), 2);

    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(1);
    // Higher score should be accepted
    expect(result.accepted[0]?.id).toBe('a1');
    expect(result.accepted[1]?.id).toBe('a2');
  });

  it('prioritizes followed tags over buzzwords over quota fill', () => {
    const candidates = [
      makeCandidate({ id: 'quota', topicTagIds: ['tag-x'], rankingScore: 30 }),
      makeCandidate({ id: 'buzz', topicTagIds: ['tag-y'], matchesBuzzword: true, rankingScore: 20 }),
      makeCandidate({ id: 'follow', topicTagIds: ['tag-ai'], rankingScore: 10 }),
    ];
    const result = applyDemandFilter(candidates, new Set(['tag-ai']), 10);

    expect(result.accepted).toHaveLength(3);
    expect(result.tierBreakdown.followedTag).toBe(1);
    expect(result.tierBreakdown.buzzword).toBe(1);
    expect(result.tierBreakdown.quotaFill).toBe(1);
  });

  it('reserves slots for random injection', () => {
    const candidates = [
      makeCandidate({ id: 'a1', topicTagIds: ['tag-x'], rankingScore: 20 }),
      makeCandidate({ id: 'random', topicTagIds: [], rankingScore: 5 }),
    ];
    const result = applyDemandFilter(candidates, new Set(), 5, 2);

    expect(result.tierBreakdown.randomInjection).toBe(1);
  });

  it('handles empty candidates', () => {
    const result = applyDemandFilter([], new Set(), 10);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
  });

  it('sorts by ranking score before applying tiers', () => {
    const candidates = [
      makeCandidate({ id: 'low', rankingScore: 1 }),
      makeCandidate({ id: 'high', rankingScore: 100 }),
      makeCandidate({ id: 'mid', rankingScore: 50 }),
    ];
    const result = applyDemandFilter(candidates, new Set(), 2);

    expect(result.accepted.map((a) => a.id)).toEqual(['high', 'mid']);
  });
});

describe('shouldPromote', () => {
  it('returns true at threshold', () => {
    expect(shouldPromote(10)).toBe(true);
  });

  it('returns true above threshold', () => {
    expect(shouldPromote(15)).toBe(true);
  });

  it('returns false below threshold', () => {
    expect(shouldPromote(9)).toBe(false);
  });

  it('returns false at zero', () => {
    expect(shouldPromote(0)).toBe(false);
  });

  it('supports custom threshold', () => {
    expect(shouldPromote(5, 5)).toBe(true);
    expect(shouldPromote(4, 5)).toBe(false);
  });
});
