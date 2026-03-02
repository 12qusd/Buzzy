/**
 * F&E (Freshness & Engagement) Algorithm service.
 * Calculates the initial F&E score at ingestion time and provides
 * buzzword matching logic.
 *
 * The F&E score is calculated once during ingestion and stored immutably.
 * Formula: (viewPts + likePts + commentPts + sharePts + buzzwordScore) / (days + 1)
 *
 * At ingestion time, all engagement counters are 0, so:
 *   Initial F&E = buzzwordScore / 1 = buzzwordScore
 *
 * @module @buzzy/api/services/feScoreService
 */

import { calculateFEScore } from '@buzzy/shared/utils';
import { logger } from '../logger.js';

/** Buzzword match result */
export interface BuzzwordMatch {
  term: string;
  score: number;
}

/** Result of F&E score calculation */
export interface FEScoreResult {
  /** The calculated F&E score */
  feScore: number;
  /** Buzzword component of the score */
  buzzwordScore: number;
  /** Which buzzwords matched */
  buzzwordMatches: BuzzwordMatch[];
}

/**
 * Calculates the buzzword score for an article by matching content against
 * active buzzword terms.
 *
 * @param text - Concatenated article text (title + content + description)
 * @param activeBuzzwords - List of active buzzword terms
 * @returns Matched buzzwords and total score
 */
export function matchBuzzwords(
  text: string,
  activeBuzzwords: string[],
): BuzzwordMatch[] {
  const lowerText = text.toLowerCase();
  const matches: BuzzwordMatch[] = [];

  for (const term of activeBuzzwords) {
    const lowerTerm = term.toLowerCase();
    if (lowerText.includes(lowerTerm)) {
      // Each matching buzzword contributes 1 point
      matches.push({ term, score: 1 });
    }
  }

  return matches;
}

/**
 * Calculates the initial F&E score at ingestion time.
 * All engagement counters start at 0, so the initial score
 * is driven entirely by the buzzword match score.
 *
 * @param text - Article text to scan for buzzwords (title + content)
 * @param activeBuzzwords - Active buzzword terms from Firestore
 * @param daysSincePublished - Days since the article was originally published
 * @returns The F&E score result with breakdown
 */
export function calculateInitialFEScore(
  text: string,
  activeBuzzwords: string[],
  daysSincePublished: number = 0,
): FEScoreResult {
  const buzzwordMatches = matchBuzzwords(text, activeBuzzwords);
  const buzzwordScore = buzzwordMatches.reduce((sum, m) => sum + m.score, 0);

  const feScore = calculateFEScore({
    viewPoints: 0,
    likePoints: 0,
    commentPoints: 0,
    sharePoints: 0,
    buzzwordScore,
    daysSincePublished,
  });

  logger.debug('F&E score calculated', {
    buzzwordScore,
    buzzwordMatches: buzzwordMatches.length,
    daysSincePublished,
    feScore,
  });

  return { feScore, buzzwordScore, buzzwordMatches };
}

/**
 * Fetches active buzzwords from Firestore.
 *
 * @returns Array of active buzzword terms
 */
export async function getActiveBuzzwords(): Promise<string[]> {
  logger.debug('Fetching active buzzwords');

  // TODO: Query Firestore buzzwords collection where isActive === true
  // return buzzwords.map(b => b.term);

  return [];
}

/**
 * Processes an article through the F&E Algorithm at ingestion time.
 * This is the main entry point called by the ingestion pipeline.
 *
 * @param article - Article data for scoring
 * @returns FEScoreResult with computed scores
 */
export async function processArticleFEScore(article: {
  title: string;
  content: string;
  description?: string;
  publishedAt?: Date;
}): Promise<FEScoreResult> {
  const activeBuzzwords = await getActiveBuzzwords();

  const text = [article.title, article.content, article.description ?? ''].join(' ');

  const daysSincePublished = article.publishedAt
    ? Math.max(0, Math.floor((Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const result = calculateInitialFEScore(text, activeBuzzwords, daysSincePublished);

  logger.info('Article F&E score processed', {
    title: article.title.substring(0, 60),
    feScore: result.feScore,
    buzzwordScore: result.buzzwordScore,
    buzzwordMatches: result.buzzwordMatches.map((m) => m.term),
  });

  return result;
}
