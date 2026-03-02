/**
 * Category configuration seeded from the Buzzy Categories Master spreadsheet.
 * Colors, permalinks, and Newsblur feed URLs for all top-level categories.
 *
 * @see Buzzy Categories Master — Top Level Categories
 */

export interface CategoryConfig {
  readonly name: string;
  readonly color: string;
  readonly slug: string;
  readonly permalink: string;
  readonly newsblurFeedUrl: string;
}

export const CATEGORIES: readonly CategoryConfig[] = [
  {
    name: 'Tech',
    color: '#3C82F6',
    slug: 'tech',
    permalink: '/tech',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/technology',
  },
  {
    name: 'Science',
    color: '#10B981',
    slug: 'science',
    permalink: '/science',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/science',
  },
  {
    name: 'Health',
    color: '#8554F6',
    slug: 'health',
    permalink: '/health',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/health',
  },
  {
    name: 'Sports',
    color: '#F59E09',
    slug: 'sports',
    permalink: '/sports',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/sports',
  },
  {
    name: 'Entertainment',
    color: '#EC4999',
    slug: 'entertainment',
    permalink: '/entertainment',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/entertainment',
  },
  {
    name: 'Politics',
    color: '#6467F1',
    slug: 'politics',
    permalink: '/politics',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/politics',
  },
  {
    name: 'Money',
    color: '#059669',
    slug: 'money',
    permalink: '/money',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/money',
  },
  {
    name: 'Crypto',
    color: '#F9751A',
    slug: 'crypto',
    permalink: '/crypto',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/crypto',
  },
  {
    name: 'News',
    color: '#EF4040',
    slug: 'news',
    permalink: '/news',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/good-news',
  },
  {
    name: 'Markets',
    color: '#2B4C95',
    slug: 'markets',
    permalink: '/markets',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/markets',
  },
  {
    name: 'Lifestyle',
    color: '#DA4BF0',
    slug: 'lifestyle',
    permalink: '/lifestyle',
    newsblurFeedUrl: 'https://www.newsblur.com/reader/folder_rss/726429/c76620a15829/unread/lifestyle',
  },
] as const;

/** Map of category slug to hex color for quick lookup */
export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.color])
);
