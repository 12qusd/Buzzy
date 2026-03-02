/**
 * Browser page — Full-card vertical scroll feed.
 * Mirrors the mobile swipe-based reader using CSS scroll-snap.
 * Features: category filtering, infinite scroll via IntersectionObserver,
 * keyboard navigation (arrow keys), and session dedup.
 *
 * @module @buzzy/web/app/browser/page
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL, type BrowserFeedArticle, type FeedResponse } from '@/services/api';
import { BrowserStoryCard } from '@/components/BrowserStoryCard';
import { CategoryFilterBar } from '@/components/CategoryFilterBar';

/** Max articles to track for session dedup (matches mobile) */
const DEDUP_MAX = 50;
/** Number of articles per page */
const PAGE_SIZE = 20;

/**
 * Browser feed page with scroll-snap cards and infinite loading.
 */
export default function BrowserPage() {
  const [articles, setArticles] = useState<BrowserFeedArticle[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const sentinelRef = useRef<HTMLDivElement>(null);

  /**
   * Fetches feed articles from the API with deduplication.
   *
   * @param category - Category slug filter or null
   * @param pageCursor - Pagination cursor or null for first page
   * @param append - Whether to append to existing articles
   */
  const fetchArticles = useCallback(
    async (category: string | null, pageCursor: string | null, append: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('limit', String(PAGE_SIZE));
        if (category) params.set('category', category);
        if (pageCursor) params.set('cursor', pageCursor);

        const res = await fetch(`${API_URL}/api/articles/feed?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }

        const data: FeedResponse = await res.json();

        // Dedup against session-seen articles
        const newArticles = data.articles.filter((a) => !seenIdsRef.current.has(a.id));
        for (const a of newArticles) {
          seenIdsRef.current.add(a.id);
          // Evict oldest if over limit
          if (seenIdsRef.current.size > DEDUP_MAX) {
            const first = seenIdsRef.current.values().next().value;
            if (first) seenIdsRef.current.delete(first);
          }
        }

        if (append) {
          setArticles((prev) => [...prev, ...newArticles]);
        } else {
          setArticles(newArticles);
          setCurrentIndex(0);
        }

        setCursor(data.cursor);
        setHasMore(data.cursor !== null && data.articles.length > 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial load and category change
  useEffect(() => {
    seenIdsRef.current.clear();
    setCursor(null);
    setHasMore(true);
    void fetchArticles(categoryFilter, null, false);
  }, [categoryFilter, fetchArticles]);

  // Infinite scroll via IntersectionObserver on sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          void fetchArticles(categoryFilter, cursor, true);
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, cursor, categoryFilter, fetchArticles]);

  // Track current visible card index via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!Number.isNaN(idx)) {
              setCurrentIndex(idx);
            }
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    for (const [, el] of cardRefs.current) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [articles]);

  /**
   * Scrolls to a specific card by index.
   *
   * @param index - Card index to scroll to
   */
  const scrollToCard = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, articles.length - 1));
      const el = cardRefs.current.get(clamped);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [articles.length],
  );

  // Keyboard navigation: arrow up/down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollToCard(currentIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollToCard(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, scrollToCard]);

  /**
   * Registers a card ref for intersection tracking.
   *
   * @param index - Card index
   * @param el - DOM element or null
   */
  const setCardRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(index, el);
    } else {
      cardRefs.current.delete(index);
    }
  }, []);

  const handleCategoryChange = useCallback((slug: string | null) => {
    setCategoryFilter(slug);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--background)]">
      {/* Sticky category filter */}
      <div className="shrink-0 z-10">
        <CategoryFilterBar
          selectedCategory={categoryFilter}
          onSelect={handleCategoryChange}
        />
      </div>

      {/* Scroll-snap feed container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory"
      >
        {/* Error state */}
        {error && articles.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-[var(--destructive)] mb-4">{error}</p>
              <button
                onClick={() => void fetchArticles(categoryFilter, null, false)}
                className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading state (initial) */}
        {loading && articles.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin mb-4" />
              <p className="text-[var(--muted-foreground)]">Loading stories...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && articles.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[var(--muted-foreground)] text-lg">No stories yet</p>
          </div>
        )}

        {/* Story cards */}
        {articles.map((article, index) => (
          <div
            key={article.id}
            ref={(el) => setCardRef(index, el)}
            data-index={index}
            className="snap-start"
          >
            <BrowserStoryCard article={article} />
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-8">
            {loading && (
              <div className="inline-block w-6 h-6 border-3 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
            )}
          </div>
        )}

        {/* End of feed */}
        {!hasMore && articles.length > 0 && (
          <div className="text-center py-8 text-sm text-[var(--muted-foreground)]">
            You&apos;re all caught up!
          </div>
        )}
      </div>
    </div>
  );
}
