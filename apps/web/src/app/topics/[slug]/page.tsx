/**
 * Topic Tag page for Buzzy Today.
 * Displays tag description, related stories, and related tags.
 * Server-rendered with unique slug-based URL.
 *
 * @module @buzzy/web/app/topics/[slug]/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';

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
  // TODO: Fetch from API
  // const { tag } = await apiFetch(`/api/tags/${params.slug}`);
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
  // TODO: Fetch from API
  // const { tag } = await apiFetch(`/api/tags/${params.slug}`);
  // const { articles } = await apiFetch(`/api/articles/tag/${params.slug}?limit=20`);
  // if (!tag) notFound();

  const displayName = params.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tag header */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
        <p className="text-[var(--muted-foreground)] mb-4">
          Stories tagged with &ldquo;{displayName}&rdquo; will appear here once the API is connected.
        </p>
        <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
          <span>0 followers</span>
          <span>0 articles</span>
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

      {/* Related stories placeholder */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Latest Stories</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
          No stories yet. Articles about {displayName} will appear here.
        </div>
      </section>

      {/* Related tags placeholder */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Related Topics</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
          Related topics will appear here once tag relationships are configured.
        </div>
      </section>

      <Link href="/" className="text-sm text-[var(--primary)]">&larr; Back to Homepage</Link>
    </div>
  );
}
