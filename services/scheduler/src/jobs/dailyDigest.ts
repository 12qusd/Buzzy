/**
 * Daily digest generation job definition.
 * Generates the daily digest email content at 8:00 AM ET (13:00 UTC).
 *
 * @module @buzzy/scheduler/jobs/dailyDigest
 */

import type { JobConfig, JobResult } from './registry.js';

/**
 * Daily digest job — generates and sends the daily digest.
 * Runs at 8:00 AM ET (13:00 UTC) every day.
 *
 * Digest sections:
 * 1. What's Buzzy — 2-3 sentence narrative overview
 * 2. Top 5 Stories — highest engagement from last 24h
 * 3. What People Are Saying — top comments/reactions
 * 4. By Category — one highlight per category
 * 5. Buzzy Moment — standout story/trend
 * 6. Why This Matters — pattern recognition
 */
export const dailyDigestJob: JobConfig = {
  id: 'daily-digest',
  name: 'Daily Digest Generation',
  cron: '0 13 * * *', // 8:00 AM ET = 13:00 UTC
  category: null,
  type: 'daily_digest',
  enabled: true,
  handler: async (): Promise<JobResult> => {
    const startedAt = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    // TODO: In production:
    // 1. Query top stories from last 24h (by engagement score)
    // 2. Query top comments
    // 3. Get one highlight per category
    // 4. Generate narrative sections (may use AI)
    // 5. Store digest document in daily_digests collection with date as ID
    // 6. Build HTML email via notifications service (dailyDigest.ts)
    // 7. Send to all users with dailyDigest preference enabled
    // 8. Record delivery metrics

    const completedAt = new Date().toISOString();
    return {
      success: true,
      jobId: 'daily-digest',
      startedAt,
      completedAt,
      itemsProcessed: 0,
      errors: [],
    };
  },
};

export { };
