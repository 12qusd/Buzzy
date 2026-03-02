/**
 * Quota reset job definition.
 * Resets daily publishing counters at midnight UTC.
 *
 * @module @buzzy/scheduler/jobs/quotaReset
 */

import type { JobConfig, JobResult } from './registry.js';

/**
 * Quota reset job — runs daily at midnight UTC.
 * Resets the publishedToday counter for all categories.
 */
export const quotaResetJob: JobConfig = {
  id: 'quota-reset',
  name: 'Daily Quota Reset',
  cron: '0 0 * * *', // Midnight UTC daily
  category: null,
  type: 'quota_reset',
  enabled: true,
  handler: async (): Promise<JobResult> => {
    const startedAt = new Date().toISOString();

    // TODO: In production:
    // 1. Query all category_tags documents
    // 2. Reset publishedToday to 0 for each category
    // 3. Log the reset for audit trail

    const completedAt = new Date().toISOString();
    return {
      success: true,
      jobId: 'quota-reset',
      startedAt,
      completedAt,
      itemsProcessed: 0,
      errors: [],
    };
  },
};
