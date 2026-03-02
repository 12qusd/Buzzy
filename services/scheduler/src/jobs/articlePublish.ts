/**
 * Article publishing job definition.
 * Promotes candidate articles through the demand filter and publishes them.
 *
 * @module @buzzy/scheduler/jobs/articlePublish
 */

import type { JobConfig, JobResult } from './registry.js';

/**
 * Creates an article publish job for a specific category.
 * Runs after RSS ingestion with a configurable delay.
 *
 * @param category - Category slug to publish articles for
 * @param cron - Cron expression for scheduling
 * @param delayMinutes - Minutes after import to publish
 * @returns Job configuration
 */
export function articlePublishJob(category: string, cron: string, delayMinutes: number): JobConfig {
  return {
    id: `article-publish-${category}`,
    name: `Publish: ${category} (${delayMinutes}m delay)`,
    cron,
    category,
    type: 'article_publish',
    enabled: true,
    publishDelayMinutes: delayMinutes,
    handler: async (): Promise<JobResult> => {
      const startedAt = new Date().toISOString();

      // TODO: In production:
      // 1. Query candidate articles for this category that were ingested >= delayMinutes ago
      // 2. Check publishing quota for this category (quotaService.hasRemainingQuota)
      // 3. Apply demand filter (demandFilterService.applyDemandFilter)
      // 4. Calculate F&E scores (feScoreService.processArticleFEScore)
      // 5. Update accepted articles status to 'candidate' (published)
      // 6. Increment published count (quotaService.incrementPublishedCount)
      // 7. Check for promotion eligibility (promotionService)

      const completedAt = new Date().toISOString();
      return {
        success: true,
        jobId: `article-publish-${category}`,
        startedAt,
        completedAt,
        itemsProcessed: 0,
        errors: [],
      };
    },
  };
}
