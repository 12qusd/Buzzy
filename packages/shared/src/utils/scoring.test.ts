import { describe, it, expect } from 'vitest';
import { calculateFEScore, calculateRankingScore, calculateTagMatchScore, applyTimeDecay } from './scoring.js';

describe('calculateFEScore', () => {
  it('computes F&E with all zeroes', () => {
    expect(
      calculateFEScore({
        viewPoints: 0,
        likePoints: 0,
        commentPoints: 0,
        sharePoints: 0,
        buzzwordScore: 0,
        daysSincePublished: 0,
      })
    ).toBe(0);
  });

  it('computes F&E with engagement and fresh article', () => {
    const score = calculateFEScore({
      viewPoints: 10,
      likePoints: 5,
      commentPoints: 8,
      sharePoints: 10,
      buzzwordScore: 3,
      daysSincePublished: 0,
    });
    expect(score).toBe(36); // (10+5+8+10+3) / (0+1)
  });

  it('applies time decay via denominator', () => {
    const score = calculateFEScore({
      viewPoints: 10,
      likePoints: 5,
      commentPoints: 8,
      sharePoints: 10,
      buzzwordScore: 3,
      daysSincePublished: 2,
    });
    expect(score).toBe(12); // 36 / 3
  });
});

describe('calculateRankingScore', () => {
  it('multiplies all three factors', () => {
    expect(
      calculateRankingScore({
        articleScore: 10,
        userTopicMatch: 0.8,
        freshness: 0.9,
      })
    ).toBeCloseTo(7.2);
  });
});

describe('calculateTagMatchScore', () => {
  it('scores title=5, description=3, content=1', () => {
    expect(calculateTagMatchScore({ titleMatch: true, descriptionMatch: true, contentMatch: true })).toBe(9);
    expect(calculateTagMatchScore({ titleMatch: true, descriptionMatch: false, contentMatch: false })).toBe(5);
    expect(calculateTagMatchScore({ titleMatch: false, descriptionMatch: false, contentMatch: true })).toBe(1);
    expect(calculateTagMatchScore({ titleMatch: false, descriptionMatch: false, contentMatch: false })).toBe(0);
  });
});

describe('applyTimeDecay', () => {
  it('applies 5% decay by default', () => {
    expect(applyTimeDecay(100)).toBe(95);
  });

  it('applies custom decay rate', () => {
    expect(applyTimeDecay(100, 0.1)).toBe(90);
  });
});
