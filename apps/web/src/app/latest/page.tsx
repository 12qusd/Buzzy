/**
 * Latest stories page for Buzzy Today.
 * Displays articles sorted by publication date.
 *
 * @module @buzzy/web/app/latest/page
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Latest Stories',
  description: 'The newest stories on Buzzy Today.',
};

/**
 * Latest stories page.
 */
export default async function LatestPage() {
  // TODO: Fetch from API
  // const { articles } = await apiFetch('/api/articles/latest?limit=20');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Latest Stories</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        The most recent stories from across the web.
      </p>

      <div className="bg-[var(--muted)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
        Latest stories will appear here once the API is connected and articles are ingested.
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm text-[var(--primary)]">&larr; Back to Homepage</Link>
      </div>
    </div>
  );
}
