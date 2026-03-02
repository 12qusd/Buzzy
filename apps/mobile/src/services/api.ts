/**
 * API client for the Buzzy Today mobile app.
 * Wraps fetch calls to the Buzzy REST API with typed responses.
 *
 * @module @buzzy/mobile/services/api
 */

// TODO: Use env variable via expo-constants in production
const API_BASE = 'http://localhost:3001/api';

/**
 * Structured API error with status code.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Makes a typed GET request to the Buzzy API.
 *
 * @param path - API path (e.g., '/articles/feed')
 * @param params - Optional query parameters
 * @returns Parsed JSON response
 * @throws ApiError on non-OK responses
 */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new ApiError(`API error: ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

/**
 * Makes a typed POST request to the Buzzy API.
 *
 * @param path - API path
 * @param body - Request body
 * @returns Parsed JSON response
 * @throws ApiError on non-OK responses
 */
export async function apiPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(`API error: ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

/** Article summary for feed display */
export interface ArticleFeedItem {
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

/** Feed API response */
export interface FeedResponse {
  articles: ArticleFeedItem[];
  cursor: string | null;
  meta: {
    category: string | null;
    limit: number;
  };
}

/**
 * Fetches the article feed with optional category filter.
 *
 * @param category - Optional category slug filter
 * @param limit - Number of articles to fetch
 * @param cursor - Pagination cursor
 * @returns Feed response
 */
export async function fetchFeed(
  category?: string,
  limit = 20,
  cursor?: string,
): Promise<FeedResponse> {
  const params: Record<string, string> = { limit: String(limit) };
  if (category) params['category'] = category;
  if (cursor) params['cursor'] = cursor;
  return apiGet<FeedResponse>('/articles/feed', params);
}

/**
 * Records a batch of engagement signals.
 *
 * @param signals - Array of signal objects
 * @returns Success response
 */
export async function recordSignals(
  signals: Array<{
    userId: string;
    articleId: string;
    signalType: string;
    categoryTagId: string;
    topicTagIds?: string[];
    value?: number;
  }>,
): Promise<{ success: boolean; recorded: number }> {
  return apiPost('/signals', { signals });
}

/**
 * Toggles bookmark for an article.
 *
 * @param articleId - Article ID
 * @param userId - User ID
 * @param bookmarked - Whether to bookmark or unbookmark
 * @returns Success response
 */
export async function toggleBookmark(
  articleId: string,
  userId: string,
  bookmarked: boolean,
): Promise<{ success: boolean }> {
  return apiPost(`/articles/${articleId}/bookmark`, { userId, bookmarked });
}
