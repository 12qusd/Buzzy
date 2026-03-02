/**
 * Interest graph configuration for personalization.
 * Decay rates and ranking parameters.
 *
 * @see MVVVP — User Interest Graph, Section 6
 */

/** Weekly decay rate applied to tag weights (5% per week) */
export const INTEREST_DECAY_RATE = 0.05;

/** Maximum number of stories to check for session dedup */
export const SESSION_DEDUP_WINDOW = 50;

/** Time-to-first-story target in milliseconds */
export const TTFS_TARGET_MS = 1500;

/** Cold start target in milliseconds on LTE */
export const COLD_START_TARGET_MS = 2500;

/** Swipe latency target in milliseconds */
export const SWIPE_LATENCY_TARGET_MS = 150;

/** Number of cards to preload ahead of current position */
export const PRELOAD_AHEAD_COUNT = 3;
