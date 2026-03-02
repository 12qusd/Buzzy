/**
 * Signal service for the Buzzy Today API.
 * Handles recording engagement signals, updating the user interest graph,
 * and managing article engagement points.
 *
 * Signal weights from shared constants:
 * impression:0, click:1, tap:2, scroll:3, like:5, comment:8,
 * share:10, follow_topic:20, follow_category:15
 *
 * @module @buzzy/api/services/signalService
 */

import { logger } from '../logger.js';

/** A single engagement signal to record */
export interface SignalInput {
  userId: string;
  articleId: string;
  signalType: string;
  categoryTagId: string;
  topicTagIds?: string[];
  value?: number;
}

/**
 * Signal weight lookup matching @buzzy/shared/constants/signalWeights.
 * Duplicated here to avoid runtime dependency issues until the shared
 * package is properly bundled for the API.
 */
const SIGNAL_WEIGHTS: Record<string, number> = {
  impression: 0,
  click: 1,
  tap: 2,
  scroll: 3,
  like: 5,
  comment: 8,
  share: 10,
  bookmark: 3,
  source_click: 2,
  follow_tag: 20,
  follow_category: 15,
};

/**
 * Records a batch of engagement signals.
 * For each signal:
 * 1. Writes to Firestore signals collection
 * 2. Updates the user's interest graph
 * 3. Increments the article's engagement points
 *
 * @param signals - Array of signals to record
 * @returns Number of signals successfully recorded
 */
export async function recordSignalBatch(signals: SignalInput[]): Promise<number> {
  logger.info('Recording signal batch', { count: signals.length });

  let recorded = 0;

  for (const signal of signals) {
    try {
      const weight = SIGNAL_WEIGHTS[signal.signalType] ?? 0;

      // TODO: Firestore batch write:
      // 1. Add to signals collection
      // const signalDoc = {
      //   userId: signal.userId,
      //   articleId: signal.articleId,
      //   signalType: signal.signalType,
      //   weight,
      //   categoryTagId: signal.categoryTagId,
      //   topicTagIds: signal.topicTagIds ?? [],
      //   value: signal.value ?? null,
      //   createdAt: FieldValue.serverTimestamp(),
      // };

      // 2. Update user interest graph
      await updateInterestGraph(
        signal.userId,
        signal.topicTagIds ?? [],
        signal.categoryTagId,
        weight,
      );

      // 3. Update article engagement points
      if (weight > 0) {
        await incrementArticleEngagement(signal.articleId, weight);
      }

      recorded++;
    } catch (err) {
      logger.error('Failed to record signal', {
        signalType: signal.signalType,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  logger.info('Signal batch complete', { recorded, total: signals.length });
  return recorded;
}

/**
 * Updates the user's interest graph based on an engagement signal.
 * Each topic tag and category gets its weight incremented.
 * The interest graph is a subcollection: users/{userId}/interest_graph/{tagId|categoryId}
 *
 * @param userId - User who generated the signal
 * @param topicTagIds - Topic tags on the engaged article
 * @param categoryTagId - Category of the engaged article
 * @param weight - Signal weight
 */
async function updateInterestGraph(
  userId: string,
  topicTagIds: string[],
  categoryTagId: string,
  weight: number,
): Promise<void> {
  if (weight === 0) return;

  logger.debug('Updating interest graph', {
    userId,
    tags: topicTagIds.length,
    category: categoryTagId,
    weight,
  });

  // TODO: Firestore transaction for each tag:
  // For each topicTagId:
  //   Upsert users/{userId}/interest_graph/{topicTagId}
  //   Increment score by weight
  //   Update lastInteraction timestamp
  //
  // For category:
  //   Upsert users/{userId}/interest_graph/cat:{categoryTagId}
  //   Increment score by weight * 0.5 (category gets half weight)
}

/**
 * Increments an article's engagement points.
 * When points exceed the promotion threshold (10), promotes from candidate → permanent.
 *
 * @param articleId - Article to update
 * @param points - Points to add
 */
async function incrementArticleEngagement(
  articleId: string,
  points: number,
): Promise<void> {
  logger.debug('Incrementing article engagement', { articleId, points });

  // TODO: Firestore transaction:
  // 1. Increment articles/{articleId}.engagementPoints by points
  // 2. If engagementPoints >= PROMOTION_THRESHOLD (10):
  //    Update status from 'candidate' to 'permanent'
  //    Generate SEO fields if not already present
}

/**
 * Applies time decay to all users' interest graphs.
 * Called by a scheduled Cloud Function (weekly).
 * Decay rate: 5% per week (from INTEREST_DECAY_RATE constant).
 *
 * @param decayRate - Multiplicative decay factor (e.g., 0.95 for 5% decay)
 */
export async function applyInterestDecay(decayRate: number = 0.95): Promise<void> {
  logger.info('Applying interest graph decay', { decayRate });

  // TODO: Batch process all users' interest_graph subcollections:
  // For each entry: score = score * decayRate
  // Delete entries where score < 0.01 (negligible)
}
