/**
 * Trending stories page for Buzzy Today.
 * Displays articles sorted by engagement score from the last 24 hours.
 *
 * @module @buzzy/web/app/trending/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch, type FeedArticle } from '@/services/api';
import { ArticleCard } from '@/components/ArticleCard';

export const metadata: Metadata = {
  title: 'Trending Now',
  description: 'See what stories are buzzing right now on Buzzy Today.',
};

/**
 * Trending stories page.
 */
export default async function TrendingPage() {
  let articles: FeedArticle[] = [];
  try {
    const data = await apiFetch<{ articles: FeedArticle[] }>('/api/articles/trending?limit=20');
    articles = data.articles;
  } catch {
    // API not running
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Trending Now</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        The most engaging stories from the last 24 hours.
      </p>

      {articles.length > 0 ? (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              headline={article.headline}
              tldr={article.tldr}
              snappySentence={article.snappySentence}
              imageUrl={article.imageUrl}
              sourcePublisher={article.sourcePublisher}
              publishedAt={article.publishedAt}
              dateline={article.dateline}
              categoryTag={article.categoryTag}
              topicTags={article.topicTags}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
          Trending stories will appear here once the API is connected and articles are ingested.
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline">&larr; Back to Homepage</Link>
      </div>
    </div>
  );
}
