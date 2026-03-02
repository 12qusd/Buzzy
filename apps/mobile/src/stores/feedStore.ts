/**
 * Zustand store for the article feed state.
 * Manages article loading, pagination, session dedup, and current index.
 *
 * @module @buzzy/mobile/stores/feedStore
 */

import { create } from 'zustand';
import { type ArticleFeedItem, fetchFeed } from '../services/api';

/** Maximum number of recent article IDs to track for session dedup */
const SESSION_DEDUP_WINDOW = 50;

interface FeedState {
  /** Current list of articles in the feed */
  articles: ArticleFeedItem[];
  /** Index of the currently displayed article */
  currentIndex: number;
  /** Pagination cursor for loading more articles */
  cursor: string | null;
  /** Whether a fetch is in progress */
  loading: boolean;
  /** Error message from the last failed fetch */
  error: string | null;
  /** Active category filter (null for all) */
  categoryFilter: string | null;
  /** Set of recently viewed article IDs for session dedup */
  recentArticleIds: string[];

  /** Fetch initial feed data */
  loadFeed: (category?: string) => Promise<void>;
  /** Load more articles (next page) */
  loadMore: () => Promise<void>;
  /** Move to the next article */
  nextArticle: () => void;
  /** Move to the previous article */
  previousArticle: () => void;
  /** Set the category filter */
  setCategoryFilter: (category: string | null) => void;
  /** Toggle bookmark on the current article (optimistic update) */
  toggleBookmark: (articleId: string) => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  articles: [],
  currentIndex: 0,
  cursor: null,
  loading: false,
  error: null,
  categoryFilter: null,
  recentArticleIds: [],

  loadFeed: async (category?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetchFeed(category);
      const deduped = deduplicateArticles(response.articles, get().recentArticleIds);
      set({
        articles: deduped,
        cursor: response.cursor,
        currentIndex: 0,
        loading: false,
        categoryFilter: category ?? null,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load feed',
        loading: false,
      });
    }
  },

  loadMore: async () => {
    const { cursor, categoryFilter, articles, recentArticleIds, loading } = get();
    if (!cursor || loading) return;

    set({ loading: true });
    try {
      const response = await fetchFeed(categoryFilter ?? undefined, 20, cursor);
      const deduped = deduplicateArticles(response.articles, recentArticleIds);
      set({
        articles: [...articles, ...deduped],
        cursor: response.cursor,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load more',
        loading: false,
      });
    }
  },

  nextArticle: () => {
    const { currentIndex, articles } = get();
    if (currentIndex < articles.length - 1) {
      const nextIdx = currentIndex + 1;
      const article = articles[nextIdx];
      if (article) {
        set((state) => ({
          currentIndex: nextIdx,
          recentArticleIds: addToDedup(state.recentArticleIds, article.id),
        }));
      }

      // Preload more when 3 articles from the end
      if (nextIdx >= articles.length - 3) {
        void get().loadMore();
      }
    }
  },

  previousArticle: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  setCategoryFilter: (category: string | null) => {
    void get().loadFeed(category ?? undefined);
  },

  toggleBookmark: (articleId: string) => {
    set((state) => ({
      articles: state.articles.map((a) =>
        a.id === articleId ? { ...a, isBookmarked: !a.isBookmarked } : a
      ),
    }));
  },
}));

/**
 * Filters out articles that have already been seen in this session.
 *
 * @param articles - New articles from the API
 * @param recentIds - Recently seen article IDs
 * @returns Deduplicated articles
 */
function deduplicateArticles(
  articles: ArticleFeedItem[],
  recentIds: string[],
): ArticleFeedItem[] {
  const recentSet = new Set(recentIds);
  return articles.filter((a) => !recentSet.has(a.id));
}

/**
 * Adds an article ID to the dedup window, maintaining max size.
 *
 * @param recentIds - Current dedup list
 * @param articleId - New article ID to track
 * @returns Updated dedup list
 */
function addToDedup(recentIds: string[], articleId: string): string[] {
  const updated = [...recentIds, articleId];
  if (updated.length > SESSION_DEDUP_WINDOW) {
    return updated.slice(updated.length - SESSION_DEDUP_WINDOW);
  }
  return updated;
}
