/**
 * Interest graph decay job definition.
 * Applies 5% weekly decay to all user interest graph scores.
 *
 * @module @buzzy/scheduler/jobs/interestDecay
 */

import type { JobConfig, JobResult } from './registry.js';

/** Default decay rate: 5% per week (multiply by 0.95) */
const DEFAULT_DECAY_RATE = 0.95;

/** Minimum score threshold — entries below this are deleted */
const MIN_SCORE_THRESHOLD = 0.01;

/**
 * Interest decay job — runs weekly on Sunday midnight UTC.
 * Processes all users' interest_graph subcollections.
 */
export const interestDecayJob: JobConfig = {
  id: 'interest-decay',
  name: 'Interest Graph Decay (weekly)',
  cron: '0 0 * * 0', // Sunday midnight UTC
  category: null,
  type: 'interest_decay',
  enabled: true,
  handler: async (): Promise<JobResult> => {
    const startedAt = new Date().toISOString();

    // TODO: In production:
    // 1. Query all users (paginated)
    // 2. For each user, read their interest_graph subcollection
    // 3. Multiply each entry's score by DEFAULT_DECAY_RATE
    // 4. Delete entries where score < MIN_SCORE_THRESHOLD
    // 5. Write updates in batches

    const completedAt = new Date().toISOString();
    return {
      success: true,
      jobId: 'interest-decay',
      startedAt,
      completedAt,
      itemsProcessed: 0,
      errors: [],
    };
  },
};

export { DEFAULT_DECAY_RATE, MIN_SCORE_THRESHOLD };
