/**
 * Scoring and ranking formula utilities.
 * Implements the F&E Algorithm and personalized ranking calculations.
 *
 * @module @buzzy/shared/utils/scoring
 */

/**
 * Calculates the F&E (Freshness & Engagement) score for an article.
 * Calculated once at ingestion and stored immutably.
 *
 * Formula: (viewPts + likePts + commentPts + sharePts + buzzwordScore) / (days + 1)
 *
 * @param params - Scoring input parameters
 * @returns The computed F&E score
 */
export function calculateFEScore(params: {
  readonly viewPoints: number;
  readonly likePoints: number;
  readonly commentPoints: number;
  readonly sharePoints: number;
  readonly buzzwordScore: number;
  readonly daysSincePublished: number;
}): number {
  const numerator =
    params.viewPoints +
    params.likePoints +
    params.commentPoints +
    params.sharePoints +
    params.buzzwordScore;
  const denominator = params.daysSincePublished + 1;
  return numerator / denominator;
}

/**
 * Calculates personalized article ranking score.
 *
 * Formula: Article Score × User Topic Match × Freshness
 *
 * @param params - Ranking input parameters
 * @returns The computed ranking score
 */
export function calculateRankingScore(params: {
  readonly articleScore: number;
  readonly userTopicMatch: number;
  readonly freshness: number;
}): number {
  return params.articleScore * params.userTopicMatch * params.freshness;
}

/**
 * Calculates the tag match score for categorization.
 * Title match: 5 points, Description match: 3 points, Content match: 1 point.
 *
 * @param matches - Which fields the tag was found in
 * @returns The total categorization score for this tag match
 */
export function calculateTagMatchScore(matches: {
  readonly titleMatch: boolean;
  readonly descriptionMatch: boolean;
  readonly contentMatch: boolean;
}): number {
  let score = 0;
  if (matches.titleMatch) score += 5;
  if (matches.descriptionMatch) score += 3;
  if (matches.contentMatch) score += 1;
  return score;
}

/**
 * Applies time decay to an interest graph weight.
 *
 * @param currentWeight - The current weight value
 * @param decayRate - The decay rate per period (default 0.05 = 5%)
 * @returns The decayed weight value
 */
export function applyTimeDecay(currentWeight: number, decayRate: number = 0.05): number {
  return currentWeight * (1 - decayRate);
}
