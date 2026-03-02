/**
 * Seed homepage data for development without Firestore.
 * Builds content clumps from seed articles.
 *
 * @module @buzzy/shared/seeds/seedHomepage
 */

import { SEED_ARTICLES } from './seedArticles.js';

/** A story in a content clump (mirrors ClumpStory from contentClumpService) */
export interface SeedClumpStory {
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

/** Content clump (mirrors ContentClump from contentClumpService) */
export interface SeedContentClump {
  type: 'whats_buzzy' | 'topic' | 'category' | 'trending' | 'latest';
  title: string;
  subtitle?: string;
  tagId?: string;
  categoryId?: string;
  stories: SeedClumpStory[];
}

/** Tag ticker item (mirrors TickerTag from contentClumpService) */
export interface SeedTickerTag {
  id: string;
  name: string;
  storyCount: number;
  trend: 'up' | 'stable' | 'down';
}

/** Full homepage feed (mirrors HomepageFeed from contentClumpService) */
export interface SeedHomepageFeed {
  clumps: SeedContentClump[];
  tagTicker: SeedTickerTag[];
  generatedAt: string;
}

/**
 * Maps a seed article to a clump story.
 */
function toClumpStory(article: typeof SEED_ARTICLES[number]): SeedClumpStory {
  return {
    id: article.id,
    headline: article.headline,
    tldr: article.tldr,
    imageUrl: article.imageUrl ?? '',
    categoryName: article.categoryTag.name,
    categoryColor: article.categoryTag.color,
    topicTagNames: article.topicTags.map((t) => t.displayName),
    engagementScore: article.engagementScore,
    publishedAt: article.publishedAt,
    permalink: article.permalink,
  };
}

/**
 * Builds a seed homepage feed from seed articles.
 *
 * @returns Homepage feed with content clumps and tag ticker
 */
export function buildSeedHomepage(): SeedHomepageFeed {
  const sorted = [...SEED_ARTICLES].sort((a, b) => b.engagementScore - a.engagementScore);

  const clumps: SeedContentClump[] = [];

  // What's Buzzy — top 5 by engagement
  clumps.push({
    type: 'whats_buzzy',
    title: "What's Buzzy",
    subtitle: 'Top stories right now',
    stories: sorted.slice(0, 5).map(toClumpStory),
  });

  // Category clumps — one per category, top article each
  const categoryMap = new Map<string, typeof SEED_ARTICLES[number][]>();
  for (const a of sorted) {
    const slug = a.categoryTag.slug;
    if (!categoryMap.has(slug)) categoryMap.set(slug, []);
    categoryMap.get(slug)!.push(a);
  }

  for (const [slug, articles] of categoryMap) {
    clumps.push({
      type: 'category',
      title: articles[0]!.categoryTag.name,
      categoryId: articles[0]!.categoryTag.id,
      stories: articles.slice(0, 3).map(toClumpStory),
    });
  }

  // Trending — top 6 by engagement (different sort for variety)
  clumps.push({
    type: 'trending',
    title: 'Trending',
    subtitle: 'Rising fast',
    stories: sorted.slice(0, 6).map(toClumpStory),
  });

  // Latest — by publishedAt
  const byDate = [...SEED_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  clumps.push({
    type: 'latest',
    title: 'Latest',
    subtitle: 'Just published',
    stories: byDate.slice(0, 6).map(toClumpStory),
  });

  // Tag ticker
  const tagCounts = new Map<string, { name: string; count: number }>();
  for (const a of SEED_ARTICLES) {
    for (const tag of a.topicTags) {
      const entry = tagCounts.get(tag.id) ?? { name: tag.displayName, count: 0 };
      entry.count++;
      tagCounts.set(tag.id, entry);
    }
  }

  const tagTicker: SeedTickerTag[] = Array.from(tagCounts.entries()).map(([id, { name, count }]) => ({
    id,
    name,
    storyCount: count,
    trend: count >= 2 ? 'up' : 'stable' as const,
  }));

  return {
    clumps,
    tagTicker,
    generatedAt: new Date().toISOString(),
  };
}
