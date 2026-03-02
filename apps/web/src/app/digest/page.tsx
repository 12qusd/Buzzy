/**
 * Daily Digest page for Buzzy Today.
 * Displays today's digest with all 6 sections.
 * Static URL by date: /digest or /digest/YYYY-MM-DD.
 *
 * @module @buzzy/web/app/digest/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch } from '@/services/api';

export const metadata: Metadata = {
  title: 'Daily Digest',
  description: 'Your daily summary of the top stories, trends, and insights from Buzzy Today.',
};

/** Digest shape from the API */
interface DigestData {
  id: string;
  date: string;
  whatsNarrative: string;
  top5Stories: Array<{
    articleId: string;
    headline: string;
    whyItBlewUp: string;
    categoryName: string;
    categoryColor: string;
    thumbnailUrl: string;
  }>;
  whatPeopleAreSaying: string[];
  byCategory: Array<{
    categoryName: string;
    summary: string;
    articleId: string;
  }>;
  buzzyMoment: string;
  whyThisMatters: string;
}

/**
 * Daily Digest page showing today's digest.
 */
export default async function DigestPage() {
  let digest: DigestData | null = null;
  try {
    const data = await apiFetch<{ digest: DigestData }>('/api/digest/latest');
    digest = data.digest;
  } catch {
    // API not running
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Daily Digest</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        {digest?.date ?? today} &mdash; Your daily summary of what&apos;s buzzing.
      </p>

      {digest ? (
        <>
          {/* What's Buzzy */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">What&apos;s Buzzy</h2>
            <div className="bg-[var(--muted)] rounded-lg p-6">
              <p className="leading-relaxed">{digest.whatsNarrative}</p>
            </div>
          </section>

          {/* Top 5 Stories */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Top 5 Stories</h2>
            <div className="space-y-4">
              {digest.top5Stories.map((story, i) => (
                <Link
                  key={story.articleId}
                  href={`/article/${story.articleId}`}
                  className="flex gap-4 p-4 rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow"
                >
                  <span className="text-2xl font-bold text-[var(--muted-foreground)] shrink-0 w-8">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                        style={{ backgroundColor: story.categoryColor }}
                      >
                        {story.categoryName}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] line-clamp-2 mb-1">{story.headline}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{story.whyItBlewUp}</p>
                  </div>
                  {story.thumbnailUrl && (
                    <img src={story.thumbnailUrl} alt="" className="w-20 h-14 object-cover rounded shrink-0" loading="lazy" />
                  )}
                </Link>
              ))}
            </div>
          </section>

          {/* What People Are Saying */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">What People Are Saying</h2>
            <div className="space-y-3">
              {digest.whatPeopleAreSaying.map((quote, i) => (
                <blockquote key={i} className="border-l-4 border-[var(--primary)] pl-4 py-2 bg-[var(--muted)] rounded-r-lg">
                  <p className="text-sm italic">{quote}</p>
                </blockquote>
              ))}
            </div>
          </section>

          {/* By Category */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">By Category</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {digest.byCategory.map((cat) => (
                <div key={cat.categoryName} className="p-4 rounded-lg border border-[var(--border)]">
                  <h3 className="font-semibold mb-2">{cat.categoryName}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{cat.summary}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Buzzy Moment */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Buzzy Moment</h2>
            <div className="bg-[var(--muted)] rounded-lg p-6">
              <p className="leading-relaxed">{digest.buzzyMoment}</p>
            </div>
          </section>

          {/* Why This Matters */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Why This Matters</h2>
            <div className="bg-[var(--muted)] rounded-lg p-6">
              <p className="leading-relaxed">{digest.whyThisMatters}</p>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">What&apos;s Buzzy</h2>
            <div className="bg-[var(--muted)] rounded-lg p-6 text-[var(--muted-foreground)]">
              The daily narrative overview will appear here once the API is connected.
            </div>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Top 5 Stories</h2>
            <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
              Top stories will appear here.
            </div>
          </section>
        </>
      )}

      <Link href="/" className="text-sm text-[var(--primary)] hover:underline">&larr; Back to Homepage</Link>
    </div>
  );
}
