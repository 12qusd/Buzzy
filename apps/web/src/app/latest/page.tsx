/**
 * Latest stories page for Buzzy Today.
 * Displays articles sorted by publication date.
 *
 * @module @buzzy/web/app/latest/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch, type FeedArticle } from '@/services/api';
import { ArticleCard } from '@/components/ArticleCard';

export const metadata: Metadata = {
  title: 'Latest Stories',
  description: 'The newest stories on Buzzy Today.',
};

/**
 * Latest stories page.
 */
export default async function LatestPage() {
  let articles: FeedArticle[] = [];
  try {
    const data = await apiFetch<{ articles: FeedArticle[] }>('/api/articles/latest?limit=20');
    articles = data.articles;
  } catch {
    // API not running
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Latest Stories</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        The most recent stories from across the web.
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
          Latest stories will appear here once the API is connected and articles are ingested.
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline">&larr; Back to Homepage</Link>
      </div>
    </div>
  );
}
