/**
 * Tests for the F&E (Freshness & Engagement) score service.
 *
 * @module @buzzy/api/services/feScoreService.test
 */

import { describe, it, expect } from 'vitest';
import {
  matchBuzzwords,
  calculateInitialFEScore,
  type BuzzwordMatch,
} from './feScoreService.js';

describe('matchBuzzwords', () => {
  it('matches buzzwords in text (case-insensitive)', () => {
    const result = matchBuzzwords('Apple announces new AI features', ['AI', 'Apple']);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.term)).toEqual(['AI', 'Apple']);
  });

  it('returns empty array when no matches', () => {
    const result = matchBuzzwords('A normal tech article', ['quantum', 'blockchain']);
    expect(result).toHaveLength(0);
  });

  it('handles case-insensitive matching', () => {
    const result = matchBuzzwords('blockchain is REVOLUTIONARY', ['Blockchain', 'revolutionary']);
    expect(result).toHaveLength(2);
  });

  it('matches partial words', () => {
    const result = matchBuzzwords('AI-powered automation tools', ['AI']);
    expect(result).toHaveLength(1);
  });

  it('handles empty buzzword list', () => {
    const result = matchBuzzwords('Any text here', []);
    expect(result).toHaveLength(0);
  });

  it('handles empty text', () => {
    const result = matchBuzzwords('', ['AI', 'tech']);
    expect(result).toHaveLength(0);
  });

  it('assigns 1 point per match', () => {
    const result = matchBuzzwords('AI and blockchain news', ['AI', 'blockchain']);
    expect(result.every((m: BuzzwordMatch) => m.score === 1)).toBe(true);
  });
});

describe('calculateInitialFEScore', () => {
  it('returns 0 when no buzzwords match', () => {
    const result = calculateInitialFEScore('no matches here', ['quantum']);
    expect(result.feScore).toBe(0);
    expect(result.buzzwordScore).toBe(0);
    expect(result.buzzwordMatches).toHaveLength(0);
  });

  it('calculates score based on buzzword matches', () => {
    const result = calculateInitialFEScore(
      'AI and blockchain revolution',
      ['AI', 'blockchain', 'revolution'],
    );
    expect(result.buzzwordScore).toBe(3);
    expect(result.feScore).toBe(3); // 3 / (0 + 1) = 3
    expect(result.buzzwordMatches).toHaveLength(3);
  });

  it('applies time decay for older articles', () => {
    const result = calculateInitialFEScore('AI article', ['AI'], 1);
    // buzzwordScore = 1, daysSincePublished = 1
    // feScore = 1 / (1 + 1) = 0.5
    expect(result.feScore).toBe(0.5);
  });

  it('applies stronger decay for very old articles', () => {
    const result = calculateInitialFEScore('AI article', ['AI'], 6);
    // buzzwordScore = 1, daysSincePublished = 6
    // feScore = 1 / (6 + 1) ≈ 0.143
    expect(result.feScore).toBeCloseTo(1 / 7);
  });

  it('returns buzzwordScore equal to match count', () => {
    const result = calculateInitialFEScore(
      'AI blockchain crypto',
      ['AI', 'blockchain', 'crypto'],
    );
    expect(result.buzzwordScore).toBe(3);
  });

  it('defaults to 0 days since published', () => {
    const result = calculateInitialFEScore('AI article', ['AI']);
    expect(result.feScore).toBe(1); // 1 / (0 + 1) = 1
  });
});
