import { describe, it, expect } from 'vitest';
import { generateSlug, isValidSlug } from './slug.js';

describe('generateSlug', () => {
  it('converts display names to lowercase hyphenated slugs', () => {
    expect(generateSlug('Artificial Intelligence')).toBe('artificial-intelligence');
  });

  it('handles single words', () => {
    expect(generateSlug('Tech')).toBe('tech');
  });

  it('replaces ampersands with "and"', () => {
    expect(generateSlug('Science & Technology')).toBe('science-and-technology');
  });

  it('strips dollar signs', () => {
    expect(generateSlug('$BTC')).toBe('btc');
  });

  it('strips special characters', () => {
    expect(generateSlug('Taylor Swift!')).toBe('taylor-swift');
  });

  it('collapses multiple hyphens', () => {
    expect(generateSlug('S&P  500')).toBe('sandp-500');
  });

  it('trims leading/trailing hyphens', () => {
    expect(generateSlug('  --Hello World--  ')).toBe('hello-world');
  });

  it('throws on empty result', () => {
    expect(() => generateSlug('!!!')).toThrow('Cannot generate slug');
  });
});

describe('isValidSlug', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('artificial-intelligence')).toBe(true);
    expect(isValidSlug('tech')).toBe(true);
    expect(isValidSlug('sp-500')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(isValidSlug('UPPERCASE')).toBe(false);
    expect(isValidSlug('has spaces')).toBe(false);
    expect(isValidSlug('-leading-hyphen')).toBe(false);
    expect(isValidSlug('trailing-hyphen-')).toBe(false);
    expect(isValidSlug('')).toBe(false);
  });
});
