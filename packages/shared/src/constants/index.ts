/**
 * Barrel export for all Buzzy Today constants.
 *
 * @module @buzzy/shared/constants
 */

export { SIGNAL_WEIGHTS } from './signalWeights.js';
export type { SignalWeightKey } from './signalWeights.js';

export { PROMOTION_POINTS } from './promotionPoints.js';

export { CATEGORIES, CATEGORY_COLORS } from './categories.js';
export type { CategoryConfig } from './categories.js';

export { TOPIC_TAG_TYPES } from './topicTagTypes.js';

export { CRON_SCHEDULES } from './cronSchedules.js';
export type { CronConfig } from './cronSchedules.js';

export { SUMMARIZATION_CONFIG } from './summarization.js';

export {
  KNOCKOUT_RULES,
  IMAGE_CRITERIA,
  TAG_MATCH_WEIGHTS,
} from './contentFiltering.js';

export {
  INTEREST_DECAY_RATE,
  SESSION_DEDUP_WINDOW,
  TTFS_TARGET_MS,
  COLD_START_TARGET_MS,
  SWIPE_LATENCY_TARGET_MS,
  PRELOAD_AHEAD_COUNT,
} from './interestGraph.js';
