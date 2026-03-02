/**
 * RSS polling job definition.
 * Triggers the Python ingestion pipeline for a specific category.
 *
 * @module @buzzy/scheduler/jobs/rssPoll
 */

import type { JobConfig, JobResult } from './registry.js';

/**
 * Creates an RSS poll job for a specific category.
 *
 * @param category - Category slug to poll RSS feeds for
 * @param cron - Cron expression for scheduling
 * @returns Job configuration
 */
export function rssPollJob(category: string, cron: string): JobConfig {
  return {
    id: `rss-poll-${category}`,
    name: `RSS Poll: ${category}`,
    cron,
    category,
    type: 'rss_poll',
    enabled: true,
    handler: async (): Promise<JobResult> => {
      const startedAt = new Date().toISOString();

      // TODO: In production, this triggers the Python ingestion pipeline:
      // 1. Fetch active RSS sources for this category from Firestore
      // 2. Call ingestion service: POST /ingestion/run { category }
      // 3. The ingestion pipeline handles: fetch → knockout → dedup → categorize → summarize

      const completedAt = new Date().toISOString();
      return {
        success: true,
        jobId: `rss-poll-${category}`,
        startedAt,
        completedAt,
        itemsProcessed: 0,
        errors: [],
      };
    },
  };
}
