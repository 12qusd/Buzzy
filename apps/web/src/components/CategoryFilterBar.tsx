/**
 * CategoryFilterBar — Horizontal scrolling category pills for the Browser feed.
 * Shows "All" + 11 category pills with active state highlighting.
 *
 * @module @buzzy/web/components/CategoryFilterBar
 */

'use client';

import { useRef, useCallback } from 'react';

/** Category definition with display color */
interface CategoryItem {
  slug: string;
  name: string;
  color: string;
}

/** Available categories matching the master spreadsheet */
const CATEGORIES: CategoryItem[] = [
  { slug: 'tech', name: 'Tech', color: '#3C82F6' },
  { slug: 'science', name: 'Science', color: '#10B981' },
  { slug: 'health', name: 'Health', color: '#8554F6' },
  { slug: 'sports', name: 'Sports', color: '#F59E09' },
  { slug: 'entertainment', name: 'Entertainment', color: '#EC4999' },
  { slug: 'politics', name: 'Politics', color: '#6467F1' },
  { slug: 'money', name: 'Money', color: '#059669' },
  { slug: 'crypto', name: 'Crypto', color: '#F9751A' },
  { slug: 'news', name: 'News', color: '#EF4040' },
  { slug: 'markets', name: 'Markets', color: '#2B4C95' },
  { slug: 'lifestyle', name: 'Lifestyle', color: '#DA4BF0' },
];

interface CategoryFilterBarProps {
  /** Currently selected category slug, or null for "All" */
  selectedCategory: string | null;
  /** Callback when a category is selected */
  onSelect: (categorySlug: string | null) => void;
}

/**
 * Horizontal scrolling category filter bar.
 *
 * @param props - FilterBar props
 */
export function CategoryFilterBar({ selectedCategory, onSelect }: CategoryFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (slug: string | null) => {
      onSelect(slug);
    },
    [onSelect],
  );

  return (
    <div className="border-b border-[var(--border)] bg-[var(--background)]">
      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-2.5 min-w-max">
          {/* "All" pill */}
          <button
            onClick={() => handleSelect(null)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              selectedCategory === null
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
            }`}
          >
            All
          </button>

          {/* Category pills */}
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => handleSelect(cat.slug)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isActive
                    ? 'text-white border-transparent'
                    : 'bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
                }`}
                style={isActive ? { backgroundColor: cat.color } : undefined}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
