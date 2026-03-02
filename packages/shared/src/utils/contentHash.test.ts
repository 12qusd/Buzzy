import { describe, it, expect } from 'vitest';
import { generateContentHash, generateUrlHash } from './contentHash.js';

describe('generateContentHash', () => {
  it('produces consistent hashes for same input', () => {
    const hash1 = generateContentHash('https://example.com/article', 'Hello world');
    const hash2 = generateContentHash('https://example.com/article', 'Hello world');
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different URLs', () => {
    const hash1 = generateContentHash('https://example.com/a', 'Hello');
    const hash2 = generateContentHash('https://example.com/b', 'Hello');
    expect(hash1).not.toBe(hash2);
  });

  it('produces different hashes for different content', () => {
    const hash1 = generateContentHash('https://example.com/a', 'Hello');
    const hash2 = generateContentHash('https://example.com/a', 'World');
    expect(hash1).not.toBe(hash2);
  });

  it('normalizes case and whitespace', () => {
    const hash1 = generateContentHash('HTTPS://EXAMPLE.COM/ARTICLE', '  Hello  ');
    const hash2 = generateContentHash('https://example.com/article', 'Hello');
    expect(hash1).toBe(hash2);
  });

  it('returns a 64-character hex string (SHA-256)', () => {
    const hash = generateContentHash('url', 'content');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('generateUrlHash', () => {
  it('hashes URL only', () => {
    const hash = generateUrlHash('https://example.com/article');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('normalizes case', () => {
    expect(generateUrlHash('HTTPS://EXAMPLE.COM')).toBe(generateUrlHash('https://example.com'));
  });
});
