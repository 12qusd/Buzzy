/**
 * Root layout for the Buzzy Today admin panel.
 * Provides sidebar navigation and global styles.
 *
 * @module @buzzy/admin/app/layout
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Buzzy Today Admin',
  description: 'Admin panel for the Buzzy Today news platform',
};

/**
 * Sidebar navigation link.
 */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 rounded-md text-sm hover:bg-[var(--muted)] transition-colors"
    >
      {children}
    </Link>
  );
}

/**
 * Root layout with sidebar navigation.
 *
 * @param props - Layout props with children
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-[var(--border)] bg-white p-4 flex flex-col gap-1">
            <div className="px-4 py-3 mb-4">
              <h1 className="text-lg font-bold text-[var(--primary)]">Buzzy Admin</h1>
            </div>
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/suggested-tags">Suggested Tags</NavLink>
            <NavLink href="/rss-sources">RSS Sources</NavLink>
            <NavLink href="/quotas">Publishing Quotas</NavLink>
            <NavLink href="/summarization">AI Config</NavLink>
            <NavLink href="/personalization">Personalization</NavLink>
            <NavLink href="/signals">Signals</NavLink>
            <NavLink href="/reports">Reports</NavLink>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8 bg-[var(--muted)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
