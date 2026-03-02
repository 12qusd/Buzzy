/**
 * Content hashing for article deduplication.
 * Generates deterministic hashes for URL + content comparison.
 *
 * @module @buzzy/shared/utils/contentHash
 */

import { createHash } from 'node:crypto';

/**
 * Generates a SHA-256 hash of the article URL and content for deduplication.
 *
 * @param url - The source article URL
 * @param content - The article text content
 * @returns A hex-encoded SHA-256 hash string
 */
export function generateContentHash(url: string, content: string): string {
  const normalized = `${url.toLowerCase().trim()}|${content.trim()}`;
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generates a URL-only hash for fast URL-based dedup checks.
 *
 * @param url - The source article URL
 * @returns A hex-encoded SHA-256 hash string
 */
export function generateUrlHash(url: string): string {
  return createHash('sha256').update(url.toLowerCase().trim()).digest('hex');
}
