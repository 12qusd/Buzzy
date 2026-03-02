/**
 * Stale article cleanup job definition.
 * Archives articles older than 30 days with no engagement.
 *
 * @module @buzzy/scheduler/jobs/staleCleanup
 */

import type { JobConfig, JobResult } from './registry.js';

/** Days after which articles with zero engagement are archived */
const STALE_THRESHOLD_DAYS = 30;

/**
 * Stale cleanup job — runs weekly on Monday at 3:00 AM UTC.
 * Identifies and archives old articles with no engagement.
 */
export const staleCleanupJob: JobConfig = {
  id: 'stale-cleanup',
  name: 'Stale Article Cleanup (weekly)',
  cron: '0 3 * * 1', // Monday 3:00 AM UTC
  category: null,
  type: 'stale_cleanup',
  enabled: true,
  handler: async (): Promise<JobResult> => {
    const startedAt = new Date().toISOString();

    // TODO: In production:
    // 1. Calculate cutoff date: now - STALE_THRESHOLD_DAYS
    // 2. Query articles where:
    //    - publishedAt < cutoff
    //    - engagementScore == 0
    //    - status == 'candidate'
    // 3. Update status to 'archived' in batches
    // 4. Log archived article count

    const completedAt = new Date().toISOString();
    return {
      success: true,
      jobId: 'stale-cleanup',
      startedAt,
      completedAt,
      itemsProcessed: 0,
      errors: [],
    };
  },
};

export { STALE_THRESHOLD_DAYS };
