/**
 * Article promotion service for the Buzzy Today API.
 * Promotes articles from 'candidate' to 'permanent' status when they
 * reach the engagement threshold (default 10 points).
 *
 * On promotion, generates SEO metadata:
 *   - URL-safe slug
 *   - Canonical permalink
 *   - Open Graph tags
 *   - Twitter Card tags
 *   - Schema.org JSON-LD markup
 *
 * @module @buzzy/api/services/promotionService
 */

import { generateSlug } from '@buzzy/shared/utils';
import { logger } from '../logger.js';

/** Default promotion threshold in engagement points */
const DEFAULT_PROMOTION_THRESHOLD = 10;

/** Site name for SEO metadata */
const SITE_NAME = 'Buzzy Today';

/** Base URL for canonical permalinks */
const BASE_URL = 'https://buzzy.today';

/** Twitter handle for Twitter Cards */
const TWITTER_HANDLE = '@buzzytoday';

/** Article data needed for promotion */
export interface PromotionCandidate {
  id: string;
  aiHeadline: string;
  tldr: string;
  imageUrl: string;
  categoryTagName: string;
  categoryColor: string;
  sourcePublisher: string;
  topicTagNames: string[];
  engagementScore: number;
  permanentArticlePoints: number;
}

/** Open Graph metadata */
export interface OpenGraphTags {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
}

/** Twitter Card metadata */
export interface TwitterCardTags {
  card: string;
  title: string;
  description: string;
  image: string;
  site: string;
}

/** Schema.org JSON-LD markup */
export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: { '@type': string; name: string };
  publisher: { '@type': string; name: string };
}

/** Result of a promotion operation */
export interface PromotionResult {
  promoted: boolean;
  slug?: string;
  permalink?: string;
  openGraphTags?: OpenGraphTags;
  twitterCardTags?: TwitterCardTags;
  schemaMarkup?: SchemaMarkup;
}

/**
 * Checks if an article is eligible for promotion based on engagement points.
 *
 * @param points - Current engagement points
 * @param threshold - Points needed for promotion
 * @returns Whether the article meets the threshold
 */
export function isEligibleForPromotion(
  points: number,
  threshold: number = DEFAULT_PROMOTION_THRESHOLD,
): boolean {
  return points >= threshold;
}

/**
 * Generates a URL-safe slug for a permanent article.
 * Appends a short unique suffix to prevent collisions.
 *
 * @param headline - The article headline
 * @param articleId - The article's unique ID (used for suffix)
 * @returns A unique slug
 */
export function generateArticleSlug(headline: string, articleId: string): string {
  const baseSlug = generateSlug(headline);
  // Use first 6 chars of article ID as uniqueness suffix
  const suffix = articleId.replace(/[^a-z0-9]/gi, '').substring(0, 6).toLowerCase();
  return `${baseSlug}-${suffix}`;
}

/**
 * Generates Open Graph tags for an article.
 *
 * @param article - Article data
 * @param permalink - The canonical permalink
 * @returns Open Graph tag object
 */
export function generateOpenGraphTags(
  article: Pick<PromotionCandidate, 'aiHeadline' | 'tldr' | 'imageUrl'>,
  permalink: string,
): OpenGraphTags {
  return {
    title: article.aiHeadline,
    description: article.tldr.substring(0, 200),
    image: article.imageUrl,
    url: permalink,
    type: 'article',
    siteName: SITE_NAME,
  };
}

/**
 * Generates Twitter Card tags for an article.
 *
 * @param article - Article data
 * @returns Twitter Card tag object
 */
export function generateTwitterCardTags(
  article: Pick<PromotionCandidate, 'aiHeadline' | 'tldr' | 'imageUrl'>,
): TwitterCardTags {
  return {
    card: 'summary_large_image',
    title: article.aiHeadline,
    description: article.tldr.substring(0, 200),
    image: article.imageUrl,
    site: TWITTER_HANDLE,
  };
}

/**
 * Generates Schema.org JSON-LD markup for an article.
 *
 * @param article - Article data
 * @param now - Current timestamp ISO string
 * @returns Schema.org markup object
 */
export function generateSchemaMarkup(
  article: Pick<PromotionCandidate, 'aiHeadline' | 'tldr' | 'imageUrl' | 'sourcePublisher'>,
  now: string,
): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.aiHeadline,
    description: article.tldr.substring(0, 200),
    image: article.imageUrl,
    datePublished: now,
    dateModified: now,
    author: { '@type': 'Organization', name: article.sourcePublisher },
    publisher: { '@type': 'Organization', name: SITE_NAME },
  };
}

/**
 * Promotes an article from candidate to permanent status.
 * Generates all SEO metadata and returns the promotion result.
 *
 * @param article - The article candidate for promotion
 * @param threshold - Engagement points threshold
 * @returns PromotionResult with generated SEO data
 */
export function promoteArticle(
  article: PromotionCandidate,
  threshold: number = DEFAULT_PROMOTION_THRESHOLD,
): PromotionResult {
  if (!isEligibleForPromotion(article.permanentArticlePoints, threshold)) {
    logger.debug('Article not eligible for promotion', {
      articleId: article.id,
      points: article.permanentArticlePoints,
      threshold,
    });
    return { promoted: false };
  }

  const slug = generateArticleSlug(article.aiHeadline, article.id);
  const permalink = `${BASE_URL}/${slug}`;
  const now = new Date().toISOString();

  const openGraphTags = generateOpenGraphTags(article, permalink);
  const twitterCardTags = generateTwitterCardTags(article);
  const schemaMarkup = generateSchemaMarkup(article, now);

  logger.info('Article promoted to permanent', {
    articleId: article.id,
    slug,
    points: article.permanentArticlePoints,
  });

  // TODO: Update Firestore article document:
  // 1. Set status = 'permanent'
  // 2. Set slug, permalink, openGraphTags, twitterCardTags, schemaMarkup
  // 3. Set promotedAt = Firestore.Timestamp.now()

  return {
    promoted: true,
    slug,
    permalink,
    openGraphTags,
    twitterCardTags,
    schemaMarkup,
  };
}
