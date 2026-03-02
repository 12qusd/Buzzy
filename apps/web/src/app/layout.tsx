/**
 * Root layout for the Buzzy Today web app.
 * Provides header navigation, footer, and global styles.
 * SSR-optimized for SEO on permanent article pages.
 *
 * @module @buzzy/web/app/layout
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Buzzy Today — News Without the Noise',
    template: '%s | Buzzy Today',
  },
  description: 'Get the facts fast. Buzzy Today delivers AI-summarized news with personalized feeds, TL;DRs, and key takeaways.',
  openGraph: {
    type: 'website',
    siteName: 'Buzzy Today',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@buzzytoday',
  },
};

/** Category navigation items */
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
 * Root layout with header, category nav, and footer.
 *
 * @param props - Layout props with children
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-[var(--border)] bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-[var(--primary)] hover:no-underline">
              Buzzy Today
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/trending" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Trending
              </Link>
              <Link href="/latest" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Latest
              </Link>
              <Link href="/digest" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Daily Digest
              </Link>
            </nav>
          </div>

          {/* Category bar */}
          <div className="max-w-7xl mx-auto px-4 pb-2 overflow-x-auto">
            <div className="flex gap-3 text-sm">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="whitespace-nowrap px-3 py-1 rounded-full text-white text-xs font-medium hover:opacity-80 hover:no-underline transition-opacity"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] bg-[var(--muted)] mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold mb-2">Buzzy Today</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  News without the noise. AI-summarized stories delivered fast.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Categories</h3>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.slug} href={`/${cat.slug}`} className="text-[var(--muted-foreground)]">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Links</h3>
                <div className="flex flex-col gap-1 text-sm">
                  <Link href="/about" className="text-[var(--muted-foreground)]">About</Link>
                  <Link href="/digest" className="text-[var(--muted-foreground)]">Daily Digest</Link>
                  <Link href="/privacy" className="text-[var(--muted-foreground)]">Privacy Policy</Link>
                  <Link href="/terms" className="text-[var(--muted-foreground)]">Terms of Service</Link>
                </div>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-6 text-center">
              &copy; {new Date().getFullYear()} Buzzy Today. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
