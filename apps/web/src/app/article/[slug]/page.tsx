/**
 * Article detail page for Buzzy Today.
 * Server-rendered with full SEO for permanent articles.
 * Includes Open Graph tags, Twitter Cards, and Schema.org JSON-LD.
 *
 * @module @buzzy/web/app/article/[slug]/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { ArticlePageData } from '@/services/api';

interface Props {
  params: { slug: string };
}

/**
 * Generates metadata for the article page (Open Graph, Twitter Cards).
 *
 * @param props - Page props with slug param
 * @returns Next.js metadata
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // TODO: Fetch article from API and generate real metadata
  // const { article } = await apiFetch<{ article: ArticlePageData }>(`/api/articles/by-slug/${params.slug}`);

  return {
    title: `Article — ${params.slug}`,
    description: 'Read the full story on Buzzy Today.',
    openGraph: {
      type: 'article',
      siteName: 'Buzzy Today',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@buzzytoday',
    },
  };
}

/**
 * Renders a full article with all sections.
 *
 * @param props - Article data
 */
function ArticleContent({ article }: { article: ArticlePageData }) {
  return (
    <article className="max-w-3xl mx-auto">
      {/* Schema.org JSON-LD */}
      {article.schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(article.schemaMarkup) }}
        />
      )}

      {/* Category badge */}
      <div className="mb-4">
        <Link
          href={`/${article.categoryTag.slug}`}
          className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium hover:opacity-80 hover:no-underline"
          style={{ backgroundColor: article.categoryTag.color }}
        >
          {article.categoryTag.name}
        </Link>
      </div>

      {/* Headline */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
        {article.headline}
      </h1>

      {/* Dateline */}
      <p className="text-sm text-[var(--muted-foreground)] mb-4 font-mono">
        {article.dateline}
      </p>

      {/* Hero image */}
      {article.imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.headline}
            className="w-full h-auto object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* TL;DR */}
      <div
        className="p-4 rounded-lg mb-6 border-l-4"
        style={{ borderColor: article.categoryTag.color, backgroundColor: `${article.categoryTag.color}10` }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: article.categoryTag.color }}>
          TL;DR
        </h2>
        <p className="text-lg font-medium">{article.tldr}</p>
      </div>

      {/* Key Takeaways */}
      <section className="mb-6">
        <h2 className="text-lg font-bold mb-3">Key Takeaways</h2>
        <ul className="space-y-2">
          {article.keyTakeaways.map((takeaway, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[var(--primary)] font-bold mt-0.5">{i + 1}.</span>
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Buzzy Take */}
      {article.buzzyTake && (
        <section className="mb-6 bg-[var(--muted)] rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2">Buzzy Take</h2>
          <p className="text-[var(--muted-foreground)]">{article.buzzyTake}</p>
        </section>
      )}

      {/* Topic Tags */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-2">
          {article.topicTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/topics/${tag.slug}`}
              className="px-3 py-1 rounded-full border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:no-underline"
            >
              {tag.displayName}
            </Link>
          ))}
        </div>
      </section>

      {/* Source */}
      <section className="mb-8 pt-4 border-t border-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">
          Source:{' '}
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">
            {article.sourcePublisher}
          </a>
        </p>
      </section>

      {/* Engagement stats */}
      <section className="flex gap-6 text-sm text-[var(--muted-foreground)] pb-8 border-b border-[var(--border)]">
        <span>{article.viewCount.toLocaleString()} views</span>
        <span>{article.likeCount.toLocaleString()} likes</span>
        <span>{article.commentCount.toLocaleString()} comments</span>
        <span>{article.shareCount.toLocaleString()} shares</span>
      </section>
    </article>
  );
}

/**
 * Article detail page. Shows full article or placeholder if not found.
 *
 * @param props - Page props with slug param
 */
export default async function ArticlePage({ params }: Props) {
  // TODO: Fetch article from API once connected
  // const res = await apiFetch<{ article: ArticlePageData | null }>(`/api/articles/by-slug/${params.slug}`);
  // if (res.article) return <ArticleContent article={res.article} />;

  return (
    <div className="max-w-3xl mx-auto py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
      <p className="text-[var(--muted-foreground)] mb-6">
        This article doesn&apos;t exist yet. The article detail page will display full content
        with TL;DR, key takeaways, buzzy take, and SEO metadata once the API is connected.
      </p>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        Requested slug: <code className="bg-[var(--muted)] px-2 py-1 rounded">{params.slug}</code>
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 hover:no-underline inline-block"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
