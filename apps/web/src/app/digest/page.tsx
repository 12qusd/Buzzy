/**
 * Daily Digest page for Buzzy Today.
 * Displays today's digest with all 6 sections.
 * Static URL by date: /digest or /digest/YYYY-MM-DD.
 *
 * @module @buzzy/web/app/digest/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Daily Digest',
  description: 'Your daily summary of the top stories, trends, and insights from Buzzy Today.',
};

/**
 * Daily Digest page showing today's digest.
 */
export default async function DigestPage() {
  // TODO: Fetch from API
  // const { digest } = await apiFetch('/api/digest/latest');

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Daily Digest</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        {today} &mdash; Your daily summary of what&apos;s buzzing.
      </p>

      {/* What's Buzzy */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">What&apos;s Buzzy</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6 text-[var(--muted-foreground)]">
          The daily narrative overview will appear here once digest generation is connected.
        </div>
      </section>

      {/* Top 5 Stories */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Top 5 Stories</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
          Top stories will appear here.
        </div>
      </section>

      {/* What People Are Saying */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">What People Are Saying</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
          Top comments and reactions will appear here.
        </div>
      </section>

      {/* By Category */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">By Category</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
          Category highlights will appear here.
        </div>
      </section>

      {/* Buzzy Moment */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Buzzy Moment</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
          The standout story of the day will appear here.
        </div>
      </section>

      {/* Why This Matters */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Why This Matters</h2>
        <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
          Pattern recognition and context will appear here.
        </div>
      </section>

      <Link href="/" className="text-sm text-[var(--primary)]">&larr; Back to Homepage</Link>
    </div>
  );
}
