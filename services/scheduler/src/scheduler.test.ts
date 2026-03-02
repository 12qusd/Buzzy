/**
 * Tests for the scheduler job registry and job definitions.
 *
 * @module @buzzy/scheduler/scheduler.test
 */

import { describe, it, expect } from 'vitest';
import { registry } from './scheduler.js';
import { JobRegistry, type JobConfig } from './jobs/registry.js';
import { DEFAULT_DECAY_RATE, MIN_SCORE_THRESHOLD } from './jobs/interestDecay.js';
import { STALE_THRESHOLD_DAYS } from './jobs/staleCleanup.js';

describe('JobRegistry', () => {
  it('loads all expected jobs', () => {
    // 11 rss-poll + 9 article-publish + 4 system = 24
    expect(registry.getJobCount()).toBe(24);
  });

  it('lists all jobs with correct structure', () => {
    const jobs = registry.listJobs();
    expect(jobs.length).toBe(24);

    for (const job of jobs) {
      expect(job.id).toBeTruthy();
      expect(job.name).toBeTruthy();
      expect(job.cron).toBeTruthy();
      expect(typeof job.enabled).toBe('boolean');
    }
  });

  it('gets a job by ID', () => {
    const job = registry.getJob('rss-poll-tech');
    expect(job).toBeDefined();
    expect(job?.name).toBe('RSS Poll: tech');
    expect(job?.type).toBe('rss_poll');
    expect(job?.category).toBe('tech');
  });

  it('returns undefined for unknown job ID', () => {
    const job = registry.getJob('nonexistent');
    expect(job).toBeUndefined();
  });

  it('filters jobs by type', () => {
    const rssJobs = registry.getJobsByType('rss_poll');
    expect(rssJobs.length).toBe(11);

    const publishJobs = registry.getJobsByType('article_publish');
    expect(publishJobs.length).toBe(9);

    const decayJobs = registry.getJobsByType('interest_decay');
    expect(decayJobs.length).toBe(1);

    const digestJobs = registry.getJobsByType('daily_digest');
    expect(digestJobs.length).toBe(1);

    const quotaJobs = registry.getJobsByType('quota_reset');
    expect(quotaJobs.length).toBe(1);

    const cleanupJobs = registry.getJobsByType('stale_cleanup');
    expect(cleanupJobs.length).toBe(1);
  });

  it('filters jobs by category', () => {
    const techJobs = registry.getJobsByCategory('tech');
    expect(techJobs.length).toBe(2); // rss-poll + article-publish

    const newsJobs = registry.getJobsByCategory('news');
    expect(newsJobs.length).toBe(2);

    const marketsJobs = registry.getJobsByCategory('markets');
    expect(marketsJobs.length).toBe(2);
  });

  it('executes a job and returns result', async () => {
    const result = await registry.executeJob('rss-poll-tech');
    expect(result.success).toBe(true);
    expect(result.jobId).toBe('rss-poll-tech');
    expect(result.startedAt).toBeTruthy();
    expect(result.completedAt).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  it('throws when executing unknown job', async () => {
    await expect(registry.executeJob('nonexistent')).rejects.toThrow('Job not found');
  });

  it('throws on duplicate job IDs', () => {
    const duplicate: JobConfig[] = [
      {
        id: 'dup', name: 'Dup', cron: '* * * * *', category: null,
        type: 'quota_reset', enabled: true,
        handler: async () => ({ success: true, jobId: 'dup', startedAt: '', completedAt: '', itemsProcessed: 0, errors: [] }),
      },
      {
        id: 'dup', name: 'Dup2', cron: '* * * * *', category: null,
        type: 'quota_reset', enabled: true,
        handler: async () => ({ success: true, jobId: 'dup', startedAt: '', completedAt: '', itemsProcessed: 0, errors: [] }),
      },
    ];
    expect(() => new JobRegistry(duplicate)).toThrow('Duplicate job ID');
  });
});

describe('Job configurations', () => {
  it('RSS poll jobs have valid cron expressions', () => {
    const rssJobs = registry.getJobsByType('rss_poll');
    for (const job of rssJobs) {
      // 5-field cron: min hour day month weekday
      const fields = job.cron.split(' ');
      expect(fields.length).toBe(5);
    }
  });

  it('article publish jobs have delay configured', () => {
    const publishJobs = registry.getJobsByType('article_publish');
    for (const job of publishJobs) {
      expect(job.publishDelayMinutes).toBeGreaterThan(0);
    }
  });

  it('markets has the highest frequency (every 30 min)', () => {
    const marketsRss = registry.getJob('rss-poll-markets');
    expect(marketsRss?.cron).toBe('*/30 * * * *');
  });

  it('interest decay uses correct constants', () => {
    expect(DEFAULT_DECAY_RATE).toBe(0.95);
    expect(MIN_SCORE_THRESHOLD).toBe(0.01);
  });

  it('stale cleanup threshold is 30 days', () => {
    expect(STALE_THRESHOLD_DAYS).toBe(30);
  });

  it('daily digest runs at 8 AM ET (13:00 UTC)', () => {
    const digest = registry.getJob('daily-digest');
    expect(digest?.cron).toBe('0 13 * * *');
  });

  it('quota reset runs at midnight UTC', () => {
    const quota = registry.getJob('quota-reset');
    expect(quota?.cron).toBe('0 0 * * *');
  });

  it('all jobs are enabled by default', () => {
    const jobs = registry.listJobs();
    for (const job of jobs) {
      expect(job.enabled).toBe(true);
    }
  });
});
