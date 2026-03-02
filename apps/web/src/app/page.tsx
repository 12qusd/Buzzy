/**
 * Homepage for Buzzy Today web app.
 * Displays trending stories, category highlights, and the tag ticker.
 * Server-rendered for SEO.
 *
 * @module @buzzy/web/app/page
 */

import Link from 'next/link';
import { apiFetch } from '@/services/api';
import { ArticleCard } from '@/components/ArticleCard';

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

/** Clump story shape from the homepage API */
interface ClumpStory {
  id: string;
  headline: string;
  tldr: string;
  imageUrl: string;
  categoryName: string;
  categoryColor: string;
  topicTagNames: string[];
  engagementScore: number;
  publishedAt: string;
  permalink?: string;
}

/** Content clump from homepage API */
interface ContentClump {
  type: string;
  title: string;
  subtitle?: string;
  stories: ClumpStory[];
}

/** Homepage API response */
interface HomepageData {
  clumps: ContentClump[];
  tagTicker: Array<{ id: string; name: string; storyCount: number; trend: string }>;
  generatedAt: string;
}

/**
 * Homepage with hero section, content clumps, and category grid.
 */
export default async function HomePage() {
  let homepage: HomepageData | null = null;
  try {
    homepage = await apiFetch<HomepageData>('/api/articles/homepage');
  } catch {
    // API not running — show fallback
  }

  const whatsBuzzy = homepage?.clumps.find((c) => c.type === 'whats_buzzy');
  const categoryClumps = homepage?.clumps.filter((c) => c.type === 'category') ?? [];
  const trendingClump = homepage?.clumps.find((c) => c.type === 'trending');
  const latestClump = homepage?.clumps.find((c) => c.type === 'latest');

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
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90"
          >
            Trending Now
          </Link>
          <Link
            href="/latest"
            className="px-6 py-2 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--muted)] text-[var(--foreground)]"
          >
            Latest Stories
          </Link>
        </div>
      </section>

      {/* Tag ticker */}
      {homepage?.tagTicker && homepage.tagTicker.length > 0 && (
        <section className="mb-8 overflow-x-auto">
          <div className="flex gap-3">
            {homepage.tagTicker.map((tag) => (
              <Link
                key={tag.id}
                href={`/topics/${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="whitespace-nowrap px-3 py-1 rounded-full border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] flex items-center gap-1"
              >
                {tag.trend === 'up' && <span className="text-[var(--success)]">&#9650;</span>}
                {tag.name}
                <span className="text-xs opacity-60">({tag.storyCount})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* What's Buzzy section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">What&apos;s Buzzy</h2>
        {whatsBuzzy && whatsBuzzy.stories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {whatsBuzzy.stories.map((story) => (
              <Link
                key={story.id}
                href={story.permalink ?? `/article/${story.id}`}
                className="block rounded-lg border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow"
              >
                {story.imageUrl && (
                  <img src={story.imageUrl} alt="" className="w-full h-40 object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                      style={{ backgroundColor: story.categoryColor }}
                    >
                      {story.categoryName}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] line-clamp-2 mb-1">{story.headline}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{story.tldr}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--muted)] rounded-lg p-6">
            <p className="text-[var(--muted-foreground)]">
              Top stories will appear here once the ingestion pipeline is connected.
            </p>
          </div>
        )}
      </section>

      {/* Category clumps */}
      {categoryClumps.slice(0, 4).map((clump) => (
        <section key={clump.title} className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{clump.title}</h2>
            <Link
              href={`/${clump.title.toLowerCase()}`}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              See all &rarr;
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clump.stories.slice(0, 3).map((story) => (
              <Link
                key={story.id}
                href={story.permalink ?? `/article/${story.id}`}
                className="block rounded-lg border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow"
              >
                {story.imageUrl && (
                  <img src={story.imageUrl} alt="" className="w-full h-32 object-cover" loading="lazy" />
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-[var(--foreground)] line-clamp-2 mb-1">{story.headline}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{story.tldr}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Trending section */}
      {trendingClump && trendingClump.stories.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trending</h2>
            <Link href="/trending" className="text-sm text-[var(--primary)] hover:underline">See all &rarr;</Link>
          </div>
          <div className="space-y-3">
            {trendingClump.stories.slice(0, 5).map((story, i) => (
              <Link
                key={story.id}
                href={story.permalink ?? `/article/${story.id}`}
                className="flex items-center gap-4 p-3 rounded-lg border border-[var(--border)] hover:shadow-sm transition-shadow"
              >
                <span className="text-2xl font-bold text-[var(--muted-foreground)] w-8 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--foreground)] line-clamp-1">{story.headline}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">{story.categoryName}</p>
                </div>
                {story.imageUrl && (
                  <img src={story.imageUrl} alt="" className="w-16 h-10 object-cover rounded" loading="lazy" />
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category grid */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="block p-4 rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow"
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
          className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 inline-block"
        >
          View Today&apos;s Digest
        </Link>
      </section>
    </div>
  );
}
