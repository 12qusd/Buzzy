/**
 * Article service for the Buzzy Today API.
 * Handles article CRUD, filtering by category/tag, trending, latest,
 * and engagement actions (like, share, bookmark).
 *
 * @module @buzzy/api/services/articleService
 */

import { logger } from '../logger.js';
import type { FeedArticle } from './feedService.js';

/** Full article detail returned from the API */
export interface ArticleDetail {
  id: string;
  status: string;
  headline: string;
  tldr: string;
  keyTakeaways: string[];
  buzzyTake: string | null;
  snappySentence: string;
  metaDescription: string;
  seoKeywords: string[];
  imageUrl: string | null;
  imageSource: string;
  sourceTitle: string;
  sourceUrl: string;
  sourcePublisher: string;
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
  engagementScore: number;
  permanentArticlePoints: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  slug: string | null;
  permalink: string | null;
  schemaMarkup: Record<string, unknown> | null;
  openGraphTags: Record<string, string> | null;
  twitterCardTags: Record<string, string> | null;
  createdAt: string;
}

/** Paginated article list result */
export interface ArticleListResult {
  articles: FeedArticle[];
  cursor: string | null;
}

/**
 * Fetches a single article by ID.
 *
 * @param articleId - The article ID
 * @returns Article detail or null if not found
 */
export async function getArticleById(articleId: string): Promise<ArticleDetail | null> {
  logger.info('Fetching article by ID', { articleId });

  // TODO: Firestore read
  // const doc = await db.collection('articles').doc(articleId).get();
  // if (!doc.exists) return null;
  // return mapArticleDoc(doc);

  return null;
}

/**
 * Fetches trending articles sorted by F&E score descending.
 * Limited to articles published in the last 24 hours.
 *
 * @param limit - Maximum articles to return
 * @returns Array of trending articles
 */
export async function getTrendingArticles(limit: number = 20): Promise<FeedArticle[]> {
  logger.info('Fetching trending articles', { limit });

  // TODO: Firestore query
  // const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  // const snapshot = await db.collection('articles')
  //   .where('status', 'in', ['candidate', 'permanent'])
  //   .where('publishedAt', '>=', cutoff)
  //   .orderBy('publishedAt')
  //   .orderBy('engagementScore', 'desc')
  //   .limit(limit)
  //   .get();

  return [];
}

/**
 * Fetches latest articles sorted by publishedAt descending.
 *
 * @param limit - Maximum articles to return
 * @returns Array of latest articles
 */
export async function getLatestArticles(limit: number = 20): Promise<FeedArticle[]> {
  logger.info('Fetching latest articles', { limit });

  // TODO: Firestore query
  // const snapshot = await db.collection('articles')
  //   .where('status', 'in', ['candidate', 'permanent'])
  //   .orderBy('publishedAt', 'desc')
  //   .limit(limit)
  //   .get();

  return [];
}

/**
 * Fetches articles by category slug with cursor-based pagination.
 *
 * @param categorySlug - Category slug to filter by
 * @param limit - Maximum articles to return
 * @param cursor - Optional pagination cursor
 * @returns Paginated article list
 */
export async function getArticlesByCategory(
  categorySlug: string,
  limit: number = 20,
  cursor?: string,
): Promise<ArticleListResult> {
  logger.info('Fetching articles by category', { categorySlug, limit, hasCursor: !!cursor });

  // TODO: Firestore query
  // 1. Resolve categorySlug to categoryId via category_tags collection
  // 2. Query articles where categoryTagId == resolved ID
  //    .where('status', 'in', ['candidate', 'permanent'])
  //    .orderBy('publishedAt', 'desc')
  //    .limit(limit + 1)

  return { articles: [], cursor: null };
}

/**
 * Fetches articles by topic tag slug with cursor-based pagination.
 *
 * @param tagSlug - Topic tag slug to filter by
 * @param limit - Maximum articles to return
 * @param cursor - Optional pagination cursor
 * @returns Paginated article list
 */
export async function getArticlesByTag(
  tagSlug: string,
  limit: number = 20,
  cursor?: string,
): Promise<ArticleListResult> {
  logger.info('Fetching articles by tag', { tagSlug, limit, hasCursor: !!cursor });

  // TODO: Firestore query
  // 1. Resolve tagSlug to tagId via topic_tags collection
  // 2. Query articles where topicTagIds array-contains resolved ID
  //    .where('status', 'in', ['candidate', 'permanent'])
  //    .orderBy('publishedAt', 'desc')
  //    .limit(limit + 1)

  return { articles: [], cursor: null };
}

/**
 * Toggles like status on an article.
 * Records a 'like' signal and increments/decrements likeCount.
 *
 * @param articleId - Article to like/unlike
 * @param userId - User performing the action
 * @returns Updated like status
 */
export async function toggleArticleLike(
  articleId: string,
  userId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  logger.info('Toggling article like', { articleId, userId });

  // TODO: Firestore transaction:
  // 1. Check if users/{userId}/liked_articles/{articleId} exists
  // 2. If exists: delete doc, decrement articles/{articleId}.likeCount
  // 3. If not: create doc, increment articles/{articleId}.likeCount
  // 4. Record 'like' signal via signalService

  return { liked: true, likeCount: 1 };
}

/**
 * Records a share signal on an article.
 * Increments shareCount and records a 'share' signal.
 *
 * @param articleId - Article shared
 * @param userId - User who shared
 */
export async function recordArticleShare(
  articleId: string,
  userId: string,
): Promise<void> {
  logger.info('Recording article share', { articleId, userId });

  // TODO: Firestore:
  // 1. Increment articles/{articleId}.shareCount
  // 2. Record 'share' signal via signalService
}

/**
 * Toggles bookmark status on an article.
 * Updates the user's bookmarks subcollection.
 *
 * @param articleId - Article to bookmark/unbookmark
 * @param userId - User performing the action
 * @param bookmarked - Whether to bookmark (true) or unbookmark (false)
 * @returns Updated bookmark status
 */
export async function toggleArticleBookmark(
  articleId: string,
  userId: string,
  bookmarked: boolean,
): Promise<{ bookmarked: boolean }> {
  logger.info('Toggling article bookmark', { articleId, userId, bookmarked });

  // TODO: Firestore:
  // 1. If bookmarked: create users/{userId}/bookmarks/{articleId} with timestamp
  // 2. If not: delete users/{userId}/bookmarks/{articleId}
  // 3. Record 'bookmark' signal via signalService

  return { bookmarked };
}
