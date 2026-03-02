/**
 * Content Clump service for the Buzzy Today homepage.
 * Organizes articles into themed groups (clumps) for the personalized homepage:
 *   - What's Buzzy: Top trending stories across all categories
 *   - Topic Clumps: Stories grouped by user's followed tags
 *   - Category Clumps: Stories grouped by category
 *   - Trending: Fastest-rising stories by engagement velocity
 *   - Latest: Most recently published stories
 *   - Tag Ticker: Scrolling list of trending tags
 *
 * Rule: No tag appears in more than 1 Content Clump at a time.
 *
 * @module @buzzy/api/services/contentClumpService
 */

import { logger } from '../logger.js';
import { buildSeedHomepage } from '@buzzy/shared/seeds';

/** A story in a content clump */
export interface ClumpStory {
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

/** A content clump for the homepage */
export interface ContentClump {
  type: 'whats_buzzy' | 'topic' | 'category' | 'trending' | 'latest';
  title: string;
  subtitle?: string;
  tagId?: string;
  categoryId?: string;
  stories: ClumpStory[];
}

/** Tag ticker item */
export interface TickerTag {
  id: string;
  name: string;
  storyCount: number;
  trend: 'up' | 'stable' | 'down';
}

/** Full homepage feed response */
export interface HomepageFeed {
  clumps: ContentClump[];
  tagTicker: TickerTag[];
  generatedAt: string;
}

/** Whether to use seed data (defaults to true when Firestore is not connected) */
const useSeedData = (): boolean => process.env['USE_SEED_DATA'] !== 'false';

/**
 * Builds the personalized homepage feed with content clumps.
 * Enforces the "no tag soup" rule: max 1 Content Clump per tag.
 *
 * @param userId - User ID for personalization (optional for anonymous)
 * @param followedTagIds - User's followed tag IDs
 * @param followedCategoryIds - User's followed category IDs
 * @returns Organized homepage feed
 */
export async function buildHomepageFeed(
  userId?: string,
  followedTagIds: string[] = [],
  followedCategoryIds: string[] = [],
): Promise<HomepageFeed> {
  logger.info('Building homepage feed', {
    userId: userId ?? 'anonymous',
    followedTags: followedTagIds.length,
    followedCategories: followedCategoryIds.length,
  });

  if (useSeedData()) {
    return buildSeedHomepage() as HomepageFeed;
  }

  const clumps: ContentClump[] = [];
  const usedTagIds = new Set<string>();

  // 1. What's Buzzy — Top trending stories across all categories
  const whatsNewClump = await buildWhatsNewClump(usedTagIds);
  if (whatsNewClump.stories.length > 0) {
    clumps.push(whatsNewClump);
  }

  // 2. Topic Clumps — For each followed tag (max 3 clumps)
  const topicClumps = await buildTopicClumps(followedTagIds, usedTagIds, 3);
  clumps.push(...topicClumps);

  // 3. Category Clumps — For each followed category (max 3 clumps)
  const categoryClumps = await buildCategoryClumps(followedCategoryIds, usedTagIds, 3);
  clumps.push(...categoryClumps);

  // 4. Trending — Fastest-rising by engagement velocity
  const trendingClump = await buildTrendingClump(usedTagIds);
  if (trendingClump.stories.length > 0) {
    clumps.push(trendingClump);
  }

  // 5. Latest — Most recently published
  const latestClump = await buildLatestClump(usedTagIds);
  if (latestClump.stories.length > 0) {
    clumps.push(latestClump);
  }

  // 6. Tag Ticker
  const tagTicker = await buildTagTicker();

  return {
    clumps,
    tagTicker,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Builds the "What's Buzzy" clump — top trending stories.
 *
 * @param usedTagIds - Tags already used in other clumps (mutated)
 * @returns The What's Buzzy clump
 */
async function buildWhatsNewClump(usedTagIds: Set<string>): Promise<ContentClump> {
  // TODO: Query Firestore for top 5 articles by engagement score, last 24h
  return {
    type: 'whats_buzzy',
    title: "What's Buzzy",
    subtitle: 'Top stories right now',
    stories: [],
  };
}

/**
 * Builds topic clumps for followed tags.
 * Enforces 1 clump per tag maximum.
 *
 * @param followedTagIds - User's followed tag IDs
 * @param usedTagIds - Tags already used (mutated)
 * @param maxClumps - Maximum number of topic clumps
 * @returns Array of topic clumps
 */
async function buildTopicClumps(
  followedTagIds: string[],
  usedTagIds: Set<string>,
  maxClumps: number,
): Promise<ContentClump[]> {
  const clumps: ContentClump[] = [];

  for (const tagId of followedTagIds) {
    if (clumps.length >= maxClumps) break;
    if (usedTagIds.has(tagId)) continue;

    // TODO: Query Firestore for articles matching this tag
    usedTagIds.add(tagId);

    clumps.push({
      type: 'topic',
      title: tagId, // TODO: Resolve tag name from Firestore
      tagId,
      stories: [],
    });
  }

  return clumps;
}

/**
 * Builds category clumps for followed categories.
 *
 * @param followedCategoryIds - User's followed category IDs
 * @param usedTagIds - Tags already used (mutated)
 * @param maxClumps - Maximum number of category clumps
 * @returns Array of category clumps
 */
async function buildCategoryClumps(
  followedCategoryIds: string[],
  usedTagIds: Set<string>,
  maxClumps: number,
): Promise<ContentClump[]> {
  const clumps: ContentClump[] = [];

  for (const categoryId of followedCategoryIds) {
    if (clumps.length >= maxClumps) break;

    // TODO: Query Firestore for top articles in this category
    clumps.push({
      type: 'category',
      title: categoryId, // TODO: Resolve category name
      categoryId,
      stories: [],
    });
  }

  return clumps;
}

/**
 * Builds the trending clump — fastest-rising stories.
 *
 * @param usedTagIds - Tags already used
 * @returns The trending clump
 */
async function buildTrendingClump(usedTagIds: Set<string>): Promise<ContentClump> {
  // TODO: Query Firestore for articles with highest engagement velocity
  return {
    type: 'trending',
    title: 'Trending',
    subtitle: 'Rising fast',
    stories: [],
  };
}

/**
 * Builds the latest clump — most recently published.
 *
 * @param usedTagIds - Tags already used
 * @returns The latest stories clump
 */
async function buildLatestClump(usedTagIds: Set<string>): Promise<ContentClump> {
  // TODO: Query Firestore for most recently published articles
  return {
    type: 'latest',
    title: 'Latest',
    subtitle: 'Just published',
    stories: [],
  };
}

/**
 * Builds the tag ticker — scrolling list of trending tags.
 *
 * @returns Array of ticker tag items
 */
async function buildTagTicker(): Promise<TickerTag[]> {
  // TODO: Query Firestore for top tags by engagement in last 24h
  return [];
}
