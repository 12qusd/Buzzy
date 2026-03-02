/**
 * BrowserStoryCard — Full-card story component for the Browser feed.
 * Mirrors the mobile StoryCard's progressive disclosure layout:
 * hero image, category badge, headline, dateline, TL;DR, key takeaways,
 * buzzy take, topic tags, source attribution, and engagement bar.
 *
 * Each card is designed to fill most of the viewport via scroll-snap.
 *
 * @module @buzzy/web/components/BrowserStoryCard
 */

'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import type { BrowserFeedArticle } from '@/services/api';

interface BrowserStoryCardProps {
  /** The article to render */
  article: BrowserFeedArticle;
}

/**
 * Full-viewport story card for the vertical-scroll browser feed.
 *
 * @param props - Card props with article data
 */
export function BrowserStoryCard({ article }: BrowserStoryCardProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(article.isBookmarked);
  const [shared, setShared] = useState(false);

  const categoryColor = article.categoryTag.color || '#3C82F6';
  const articleHref = article.slug ? `/article/${article.slug}` : `/article/${article.id}`;

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev);
  }, []);

  const handleBookmark = useCallback(() => {
    setBookmarked((prev) => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: article.headline,
          url: `${window.location.origin}${articleHref}`,
        });
      } catch {
        // User cancelled or share failed
      }
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [article.headline, articleHref]);

  return (
    <article className="browser-card min-h-[calc(100vh-7rem)] flex flex-col bg-[var(--background)] border-b border-[var(--border)]">
      {/* Hero Image */}
      {article.imageUrl && (
        <Link href={articleHref} className="block shrink-0">
          <img
            src={article.imageUrl}
            alt=""
            className="w-full max-h-80 object-cover"
            loading="lazy"
          />
        </Link>
      )}

      {/* Card content */}
      <div className="flex-1 px-4 md:px-8 lg:px-12 py-4 max-w-3xl mx-auto w-full">
        {/* Category badge */}
        <div className="mb-3">
          <Link
            href={`/${article.categoryTag.slug}`}
            className="inline-block px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wide hover:opacity-80 transition-opacity"
            style={{ backgroundColor: categoryColor }}
          >
            {article.categoryTag.name}
          </Link>
        </div>

        {/* Headline */}
        <Link href={articleHref}>
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-[var(--foreground)] hover:text-[var(--primary)] transition-colors mb-2">
            {article.headline}
          </h2>
        </Link>

        {/* Dateline */}
        <p className="text-xs text-[var(--muted-foreground)] italic mb-4">
          {article.dateline}
        </p>

        {/* TL;DR with colored left border */}
        <div
          className="pl-4 mb-5 border-l-[3px]"
          style={{ borderLeftColor: categoryColor }}
        >
          <span className="block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
            TL;DR
          </span>
          <p className="text-base leading-relaxed text-[var(--foreground)]">
            {article.tldr}
          </p>
        </div>

        {/* Key Takeaways */}
        {article.keyTakeaways.length > 0 && (
          <div className="space-y-2 mb-5">
            {article.keyTakeaways.slice(0, 3).map((takeaway, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: categoryColor }}
                />
                <p className="text-sm leading-relaxed text-[var(--foreground)]">
                  {takeaway}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Buzzy Take */}
        {article.buzzyTake && (
          <div className="bg-[var(--muted)] rounded-lg p-4 mb-5">
            <span className="block text-xs font-bold uppercase tracking-wide text-[var(--primary)] mb-1">
              Buzzy Take
            </span>
            <p className="text-sm italic leading-relaxed text-[var(--foreground)]">
              {article.buzzyTake}
            </p>
          </div>
        )}

        {/* Topic Tags */}
        {article.topicTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.topicTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/topics/${tag.slug}`}
                className="text-xs px-3 py-1 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {tag.displayName}
              </Link>
            ))}
          </div>
        )}

        {/* Source Attribution */}
        <div className="text-xs text-[var(--muted-foreground)] mb-4">
          Source:{' '}
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] font-semibold hover:underline"
          >
            {article.sourcePublisher}
          </a>
        </div>
      </div>

      {/* Engagement Bar */}
      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--background)] px-4 md:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto w-full flex justify-around py-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              liked
                ? 'text-[var(--destructive)] bg-[var(--destructive)]/10'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            }`}
          >
            <span>{liked ? '\u2665' : '\u2661'}</span>
            Like
          </button>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              shared
                ? 'text-[var(--success)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            }`}
          >
            <span>{'\u21AA'}</span>
            {shared ? 'Shared!' : 'Share'}
          </button>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              bookmarked
                ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            }`}
          >
            <span>{bookmarked ? '\u2605' : '\u2606'}</span>
            {bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </article>
  );
}
