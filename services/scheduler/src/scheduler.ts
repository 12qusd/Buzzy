/**
 * @buzzy/scheduler — Cron job orchestrator for Buzzy Today.
 * Manages scheduled tasks: RSS ingestion, article publishing, interest decay,
 * daily digest generation, quota resets, and stale article cleanup.
 *
 * Each job is defined with a cron expression, handler, and configuration.
 * In production, these run as Firebase Cloud Functions scheduled triggers.
 *
 * @module @buzzy/scheduler
 */

import { JobRegistry, type JobConfig } from './jobs/registry.js';
import { rssPollJob } from './jobs/rssPoll.js';
import { articlePublishJob } from './jobs/articlePublish.js';
import { interestDecayJob } from './jobs/interestDecay.js';
import { dailyDigestJob } from './jobs/dailyDigest.js';
import { quotaResetJob } from './jobs/quotaReset.js';
import { staleCleanupJob } from './jobs/staleCleanup.js';

/**
 * All scheduled jobs registered in the system.
 * Cron expressions use standard 5-field format: min hour day month weekday.
 */
const JOBS: JobConfig[] = [
  // RSS ingestion jobs — per-category frequencies
  rssPollJob('news', '0 */2 * * *'),            // News: every 2 hours
  rssPollJob('tech', '0 */6 * * *'),            // Tech: every 6 hours
  rssPollJob('science', '0 12 * * *'),           // Science: daily noon PST
  rssPollJob('health', '0 18 * * *'),            // Health: daily 6pm PST
  rssPollJob('sports', '0 */6 * * *'),           // Sports: every 6 hours
  rssPollJob('entertainment', '0 */6 * * *'),    // Entertainment: every 6 hours
  rssPollJob('politics', '0 */6 * * *'),         // Politics: every 6 hours
  rssPollJob('money', '0 */6 * * *'),            // Money: every 6 hours
  rssPollJob('markets', '*/30 * * * *'),         // Markets: every 30 min
  rssPollJob('crypto', '0 */6 * * *'),           // Crypto: every 6 hours
  rssPollJob('lifestyle', '0 */6 * * *'),        // Lifestyle: every 6 hours

  // Article publishing jobs — staggered after ingestion
  articlePublishJob('news', '0 */2 * * *', 60),            // 1 hour after import
  articlePublishJob('tech', '0 */6 * * *', 180),           // 3 hours after import
  articlePublishJob('science', '0 18 * * *', 360),          // 6 hours after import
  articlePublishJob('health', '0 0 * * *', 360),            // 6 hours after import
  articlePublishJob('sports', '0 */6 * * *', 120),         // 2 hours after import
  articlePublishJob('entertainment', '0 */6 * * *', 360),  // 6 hours after import
  articlePublishJob('politics', '0 */6 * * *', 120),       // 2 hours after import
  articlePublishJob('money', '0 */6 * * *', 180),          // ~3 hours after import
  articlePublishJob('markets', '*/30 * * * *', 30),         // 30 min after import

  // System maintenance jobs
  interestDecayJob,    // Weekly: Sunday midnight UTC
  dailyDigestJob,      // Daily: 8:00 AM ET (13:00 UTC)
  quotaResetJob,       // Daily: midnight UTC
  staleCleanupJob,     // Weekly: Monday 3:00 AM UTC
];

/** The global job registry */
export const registry = new JobRegistry(JOBS);

/**
 * Starts the scheduler (for local development).
 * In production, jobs are registered as Cloud Functions scheduled triggers.
 */
export async function startScheduler(): Promise<void> {
  console.log(`Buzzy Scheduler starting with ${registry.getJobCount()} jobs`);
  registry.listJobs().forEach((job) => {
    console.log(`  [${job.id}] ${job.name} — ${job.cron} (${job.enabled ? 'enabled' : 'disabled'})`);
  });
}

export { JobRegistry, type JobConfig };
