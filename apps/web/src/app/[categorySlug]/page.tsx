/**
 * Category page for Buzzy Today.
 * Displays articles filtered by category with category branding.
 * Server-rendered with ISR for performance.
 *
 * @module @buzzy/web/app/[categorySlug]/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch, type FeedArticle } from '@/services/api';
import { ArticleCard } from '@/components/ArticleCard';

/** Category configs for lookup */
const CATEGORIES: Record<string, { name: string; color: string; description: string }> = {
  tech: { name: 'Tech', color: '#3C82F6', description: 'Technology, AI, gadgets, and the digital world.' },
  science: { name: 'Science', color: '#10B981', description: 'Scientific discoveries, research, and breakthroughs.' },
  health: { name: 'Health', color: '#8554F6', description: 'Health news, medical research, and wellness.' },
  sports: { name: 'Sports', color: '#F59E09', description: 'Sports news, scores, and highlights.' },
  entertainment: { name: 'Entertainment', color: '#EC4999', description: 'Movies, music, TV, and pop culture.' },
  politics: { name: 'Politics', color: '#6467F1', description: 'Political news, policy, and government.' },
  money: { name: 'Money', color: '#059669', description: 'Personal finance, business, and the economy.' },
  crypto: { name: 'Crypto', color: '#F9751A', description: 'Cryptocurrency, blockchain, and digital assets.' },
  news: { name: 'News', color: '#EF4040', description: 'Breaking news and top stories.' },
  markets: { name: 'Markets', color: '#2B4C95', description: 'Stock markets, trading, and financial analysis.' },
  lifestyle: { name: 'Lifestyle', color: '#DA4BF0', description: 'Lifestyle, culture, and trends.' },
};

interface Props {
  params: { categorySlug: string };
}

/**
 * Generates metadata for the category page.
 *
 * @param props - Page props with category slug
 * @returns Next.js metadata
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORIES[params.categorySlug];
  if (!cat) {
    return { title: 'Not Found' };
  }
  return {
    title: `${cat.name} News`,
    description: cat.description,
    openGraph: {
      type: 'website',
      title: `${cat.name} — Buzzy Today`,
      description: cat.description,
    },
  };
}

/**
 * Generates static paths for all known categories (ISR).
 *
 * @returns Static params for all categories
 */
export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ categorySlug: slug }));
}

/**
 * Category page with articles filtered by category.
 *
 * @param props - Page props with category slug
 */
export default async function CategoryPage({ params }: Props) {
  const cat = CATEGORIES[params.categorySlug];

  if (!cat) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-[var(--muted-foreground)] mb-6">
          The category &ldquo;{params.categorySlug}&rdquo; doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 inline-block"
        >
          Back to Homepage
        </Link>
      </div>
    );
  }

  let articles: FeedArticle[] = [];
  try {
    const data = await apiFetch<{ articles: FeedArticle[] }>(`/api/articles/category/${params.categorySlug}?limit=20`);
    articles = data.articles;
  } catch {
    // API not running
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Category header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
          <h1 className="text-3xl font-bold">{cat.name}</h1>
        </div>
        <p className="text-[var(--muted-foreground)]">{cat.description}</p>
      </section>

      {/* Follow button placeholder */}
      <section className="mb-8">
        <button
          className="px-6 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: cat.color }}
          disabled
        >
          Follow {cat.name}
        </button>
      </section>

      {/* Articles */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Latest in {cat.name}</h2>
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
            Articles will appear here once the ingestion pipeline and API are connected.
          </div>
        )}
      </section>

      <Link href="/" className="text-sm text-[var(--primary)] hover:underline">&larr; Back to Homepage</Link>
    </div>
  );
}
