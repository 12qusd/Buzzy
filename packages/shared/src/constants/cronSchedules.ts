/**
 * Cron schedule configuration for RSS pulling and publishing per category.
 * Sourced from the Buzzy Categories Master — Chron Job Frequency tab.
 *
 * @see buzzy-execution-plan.md — Cron Schedule
 */

export interface CronConfig {
  readonly category: string;
  readonly rssPull: string;
  readonly publishDelay: string;
}

export const CRON_SCHEDULES: readonly CronConfig[] = [
  { category: 'News', rssPull: 'Every 2 hours', publishDelay: '1 hour after import' },
  { category: 'Tech', rssPull: 'Every 6 hours', publishDelay: '3 hours after import' },
  { category: 'Science', rssPull: 'Daily noon PST', publishDelay: '6 hours after import' },
  { category: 'Health', rssPull: 'Daily 6pm PST', publishDelay: '6 hours after import' },
  { category: 'Sports', rssPull: 'Every 6 hours', publishDelay: '2 hours after import' },
  { category: 'Entertainment', rssPull: 'Every 6 hours', publishDelay: '6 hours after import' },
  { category: 'Politics', rssPull: 'Every 6 hours', publishDelay: '2 hours after import' },
  { category: 'Money', rssPull: 'Every 6 hours', publishDelay: 'varies' },
  { category: 'Markets', rssPull: 'Every 30 min', publishDelay: '30 min after import' },
] as const;
