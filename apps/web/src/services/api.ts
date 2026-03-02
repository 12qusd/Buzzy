/**
 * API client for server-side data fetching.
 * Used by Next.js pages for SSR/ISR data loading.
 *
 * @module @buzzy/web/services/api
 */

const API_URL = process.env['BUZZY_API_URL'] ?? 'http://localhost:3001';

/**
 * Fetches data from the Buzzy API.
 *
 * @param path - API path (e.g., '/api/articles/feed')
 * @param options - Additional fetch options
 * @returns Parsed JSON response
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/** Article detail as returned by the API */
export interface ArticlePageData {
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
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  slug: string | null;
  permalink: string | null;
  schemaMarkup: Record<string, unknown> | null;
  openGraphTags: Record<string, string> | null;
  twitterCardTags: Record<string, string> | null;
}

/** Tag detail as returned by the API */
export interface TagPageData {
  id: string;
  displayName: string;
  canonicalName: string;
  slug: string;
  topicTagType: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  followerCount: number;
  articleCount: number;
  relatedTagIds: string[];
}

/** Feed article for listing pages */
export interface FeedArticle {
  id: string;
  headline: string;
  tldr: string;
  snappySentence: string;
  imageUrl: string | null;
  sourcePublisher: string;
  sourceUrl: string;
  publishedAt: string;
  dateline: string;
  slug?: string;
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
}

/** Extended feed article for the Browser view, includes full card fields */
export interface BrowserFeedArticle extends FeedArticle {
  keyTakeaways: string[];
  buzzyTake: string | null;
  engagementPoints: number;
  isBookmarked: boolean;
}

/** Paginated feed response from /api/articles/feed */
export interface FeedResponse {
  articles: BrowserFeedArticle[];
  cursor: string | null;
  meta: {
    category: string | null;
    limit: number;
    returnedCount: number;
  };
}

export { API_URL };
