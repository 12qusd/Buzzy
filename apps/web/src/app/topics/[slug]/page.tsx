/**
 * Topic Tag page for Buzzy Today.
 * Displays tag description, related stories, and related tags.
 * Server-rendered with unique slug-based URL.
 *
 * @module @buzzy/web/app/topics/[slug]/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch, type FeedArticle } from '@/services/api';
import { ArticleCard } from '@/components/ArticleCard';

interface Props {
  params: { slug: string };
}

/**
 * Generates metadata for the topic tag page.
 *
 * @param props - Page props with slug param
 * @returns Next.js metadata
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const displayName = params.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${displayName} — Topics`,
    description: `Explore the latest news and stories about ${displayName} on Buzzy Today.`,
    openGraph: {
      type: 'website',
      title: `${displayName} — Buzzy Today`,
      description: `Latest stories about ${displayName}`,
    },
  };
}

/**
 * Topic tag detail page with description, stories, and related tags.
 *
 * @param props - Page props with slug param
 */
export default async function TopicPage({ params }: Props) {
  const displayName = params.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  let articles: FeedArticle[] = [];
  try {
    const data = await apiFetch<{ articles: FeedArticle[] }>(`/api/articles/tag/${params.slug}?limit=20`);
    articles = data.articles;
  } catch {
    // API not running
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tag header */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
        <p className="text-[var(--muted-foreground)] mb-4">
          Stories tagged with &ldquo;{displayName}&rdquo;
        </p>
        <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
          <span>{articles.length} articles</span>
        </div>
      </section>

      {/* Follow button placeholder */}
      <section className="mb-8">
        <button
          className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          disabled
        >
          Follow Topic
        </button>
      </section>

      {/* Related stories */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Latest Stories</h2>
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
            No stories yet. Articles about {displayName} will appear here.
          </div>
        )}
      </section>

      <Link href="/" className="text-sm text-[var(--primary)] hover:underline">&larr; Back to Homepage</Link>
    </div>
  );
}
