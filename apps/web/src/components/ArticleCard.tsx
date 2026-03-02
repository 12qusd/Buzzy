/**
 * Reusable article card component for article listings.
 * Displays headline, TL;DR, category badge, image, and metadata.
 *
 * @module @buzzy/web/components/ArticleCard
 */

import Link from 'next/link';

/** Props matching the FeedArticle shape from the API */
interface ArticleCardProps {
  id: string;
  headline: string;
  tldr: string;
  snappySentence?: string;
  imageUrl: string | null;
  sourcePublisher: string;
  publishedAt: string;
  dateline?: string;
  slug?: string;
  categoryTag: {
    name: string;
    slug: string;
    color: string;
  };
  topicTags?: Array<{
    displayName: string;
    slug: string;
  }>;
}

/**
 * Formats a relative time string (e.g., "2h ago", "1d ago").
 *
 * @param dateStr - ISO date string
 * @returns Relative time string
 */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Article card for feed/listing pages.
 *
 * @param props - Article data
 */
export function ArticleCard(props: ArticleCardProps) {
  const href = props.slug ? `/article/${props.slug}` : `/article/${props.id}`;

  return (
    <article className="flex gap-4 p-4 rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow bg-[var(--background)]">
      {/* Image */}
      {props.imageUrl && (
        <Link href={href} className="shrink-0">
          <img
            src={props.imageUrl}
            alt=""
            className="w-32 h-20 md:w-40 md:h-24 object-cover rounded-md"
            loading="lazy"
          />
        </Link>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Category + time */}
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/${props.categoryTag.slug}`}
            className="px-2 py-0.5 rounded-full text-white text-xs font-medium hover:opacity-80"
            style={{ backgroundColor: props.categoryTag.color }}
          >
            {props.categoryTag.name}
          </Link>
          <span className="text-xs text-[var(--muted-foreground)]">
            {timeAgo(props.publishedAt)}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            &middot; {props.sourcePublisher}
          </span>
        </div>

        {/* Headline */}
        <Link href={href}>
          <h3 className="font-semibold text-[var(--foreground)] line-clamp-2 mb-1 hover:text-[var(--primary)] transition-colors">
            {props.headline}
          </h3>
        </Link>

        {/* TL;DR */}
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
          {props.tldr}
        </p>

        {/* Topic tags */}
        {props.topicTags && props.topicTags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {props.topicTags.slice(0, 3).map((tag) => (
              <Link
                key={tag.slug}
                href={`/topics/${tag.slug}`}
                className="text-xs px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              >
                {tag.displayName}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
