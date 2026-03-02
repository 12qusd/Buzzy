/**
 * Homepage for Buzzy Today web app.
 * Displays trending stories, category highlights, and the tag ticker.
 * Server-rendered for SEO.
 *
 * @module @buzzy/web/app/page
 */

import Link from 'next/link';

export const metadata = {
  title: 'Buzzy Today — News Without the Noise',
  description: 'Get the facts fast. AI-summarized news with personalized feeds, TL;DRs, and key takeaways.',
};

/** Category with color for homepage display */
const CATEGORIES = [
  { name: 'Tech', slug: 'tech', color: '#3C82F6' },
  { name: 'Science', slug: 'science', color: '#10B981' },
  { name: 'Health', slug: 'health', color: '#8554F6' },
  { name: 'Sports', slug: 'sports', color: '#F59E09' },
  { name: 'Entertainment', slug: 'entertainment', color: '#EC4999' },
  { name: 'Politics', slug: 'politics', color: '#6467F1' },
  { name: 'Money', slug: 'money', color: '#059669' },
  { name: 'Crypto', slug: 'crypto', color: '#F9751A' },
  { name: 'News', slug: 'news', color: '#EF4040' },
  { name: 'Markets', slug: 'markets', color: '#2B4C95' },
  { name: 'Lifestyle', slug: 'lifestyle', color: '#DA4BF0' },
];

/**
 * Homepage with hero section, trending stories, and category grid.
 */
export default function HomePage() {
  // TODO: Fetch from API: GET /api/articles/homepage
  // const homepage = await fetch(`${API_URL}/api/articles/homepage`).then(r => r.json());

  return (
    <div>
      {/* Hero section */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold mb-4">News Without the Noise</h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-6">
          Get the facts fast. AI-summarized stories with TL;DRs, key takeaways, and personalized feeds built around you.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/trending"
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 hover:no-underline"
          >
            Trending Now
          </Link>
          <Link
            href="/latest"
            className="px-6 py-2 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--muted)] hover:no-underline text-[var(--foreground)]"
          >
            Latest Stories
          </Link>
        </div>
      </section>

      {/* What's Buzzy section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">What&apos;s Buzzy</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6">
          <p className="text-[var(--muted-foreground)]">
            Top stories will appear here once the ingestion pipeline is connected.
            Check back soon for AI-summarized news from across the web.
          </p>
        </div>
      </section>

      {/* Category grid */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="block p-4 rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow hover:no-underline"
            >
              <div
                className="w-3 h-3 rounded-full mb-2"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium text-[var(--foreground)]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Digest CTA */}
      <section className="mb-10 text-center bg-[var(--muted)] rounded-lg p-8">
        <h2 className="text-xl font-bold mb-2">Daily Digest</h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          Get the top stories, trends, and insights delivered to your inbox every morning.
        </p>
        <Link
          href="/digest"
          className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 hover:no-underline inline-block"
        >
          View Today&apos;s Digest
        </Link>
      </section>
    </div>
  );
}
