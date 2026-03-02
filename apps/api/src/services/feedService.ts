/**
 * Feed service for the Buzzy Today API.
 * Encapsulates the feed ranking logic, cursor-based pagination,
 * and Firestore query construction.
 *
 * Ranking formula: Article Score × User Topic Match × Freshness
 *
 * @module @buzzy/api/services/feedService
 */

import { logger } from '../logger.js';
import { SEED_ARTICLES, toFeedArticle } from '@buzzy/shared/seeds';

/** Feed query options */
export interface FeedOptions {
  /** Optional category slug filter */
  category?: string;
  /** Number of articles to return (defaults to 20) */
  limit?: number;
  /** Pagination cursor (opaque string: encodes last score + article ID) */
  cursor?: string;
  /** User ID for personalized ranking (optional) */
  userId?: string;
}

/** Article feed item returned to clients */
export interface FeedArticle {
  id: string;
  headline: string;
  tldr: string;
  keyTakeaways: string[];
  buzzyTake: string | null;
  snappySentence: string;
  imageUrl: string | null;
  sourcePublisher: string;
  sourceUrl: string;
  publishedAt: string;
  dateline: string;
  categoryTag: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  topicTags: Array<{
    id: string;
    displayName: string;
    slug: string;
  }>;
  engagementPoints: number;
  isBookmarked: boolean;
}

/** Paginated feed response */
export interface FeedResult {
  articles: FeedArticle[];
  cursor: string | null;
  meta: {
    category: string | null;
    limit: number;
  };
}

/** Whether to use seed data (defaults to true when Firestore is not connected) */
const useSeedData = (): boolean => process.env['USE_SEED_DATA'] !== 'false';

/**
 * Encodes a pagination cursor from score and article ID.
 *
 * @param score - The ranking score of the last article
 * @param articleId - The ID of the last article
 * @returns Encoded cursor string
 */
export function encodeCursor(score: number, articleId: string): string {
  return Buffer.from(JSON.stringify({ s: score, id: articleId })).toString('base64url');
}

/**
 * Decodes a pagination cursor.
 *
 * @param cursor - Encoded cursor string
 * @returns Decoded score and article ID, or null if invalid
 */
export function decodeCursor(cursor: string): { score: number; articleId: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as { s: number; id: string };
    if (typeof parsed.s === 'number' && typeof parsed.id === 'string') {
      return { score: parsed.s, articleId: parsed.id };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches a page of feed articles with ranking.
 *
 * When Firestore is connected, this will:
 * 1. Query articles where status IN ('candidate', 'permanent')
 * 2. Apply category filter if specified
 * 3. Order by rankingScore DESC, then by publishedAt DESC
 * 4. Apply cursor-based pagination using the last score/id
 * 5. Limit to the requested count
 * 6. If userId is provided, boost articles matching user interest graph
 *
 * @param options - Feed query options
 * @returns Paginated feed result
 */
export async function fetchFeedArticles(options: FeedOptions): Promise<FeedResult> {
  const { category, limit = 20, cursor, userId } = options;

  logger.info('Feed query', {
    category: category ?? 'all',
    limit,
    hasCursor: !!cursor,
    hasUser: !!userId,
  });

  if (useSeedData()) {
    let articles = [...SEED_ARTICLES];
    if (category) {
      articles = articles.filter((a) => a.categoryTag.slug === category);
    }
    const feedArticles = articles
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit)
      .map(toFeedArticle) as FeedArticle[];

    return {
      articles: feedArticles,
      cursor: null,
      meta: { category: category ?? null, limit },
    };
  }

  // Decode cursor if present
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (!decoded) {
      logger.warn('Invalid feed cursor', { cursor });
    }
    // TODO: Use decoded.score and decoded.articleId for Firestore startAfter
  }

  // TODO: Firestore query
  const articles: FeedArticle[] = [];
  const hasMore = false;
  const nextCursor = hasMore && articles.length > 0
    ? encodeCursor(articles[articles.length - 1]?.engagementPoints ?? 0, articles[articles.length - 1]?.id ?? '')
    : null;

  return {
    articles,
    cursor: nextCursor,
    meta: {
      category: category ?? null,
      limit,
    },
  };
}
