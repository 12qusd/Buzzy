/**
 * Job registry for the scheduler.
 * Manages job definitions, execution tracking, and scheduling metadata.
 *
 * @module @buzzy/scheduler/jobs/registry
 */

/** Configuration for a scheduled job */
export interface JobConfig {
  /** Unique job identifier */
  id: string;
  /** Human-readable job name */
  name: string;
  /** Cron expression (5-field: min hour day month weekday) */
  cron: string;
  /** Category this job applies to (null for system-wide jobs) */
  category: string | null;
  /** Job type for grouping */
  type: 'rss_poll' | 'article_publish' | 'interest_decay' | 'daily_digest' | 'quota_reset' | 'stale_cleanup';
  /** Whether the job is enabled */
  enabled: boolean;
  /** Job handler function */
  handler: () => Promise<JobResult>;
  /** Optional delay in minutes (for publish jobs that run after ingestion) */
  publishDelayMinutes?: number;
}

/** Result of a job execution */
export interface JobResult {
  success: boolean;
  jobId: string;
  startedAt: string;
  completedAt: string;
  itemsProcessed: number;
  errors: string[];
}

/** Summary info for a registered job */
export interface JobSummary {
  id: string;
  name: string;
  cron: string;
  type: string;
  category: string | null;
  enabled: boolean;
}

/**
 * Registry that holds all scheduled job definitions.
 * Provides lookup, listing, and execution capabilities.
 */
export class JobRegistry {
  private readonly jobs: Map<string, JobConfig>;

  /**
   * Creates a new job registry.
   *
   * @param configs - Array of job configurations to register
   */
  constructor(configs: JobConfig[]) {
    this.jobs = new Map();
    for (const config of configs) {
      if (this.jobs.has(config.id)) {
        throw new Error(`Duplicate job ID: ${config.id}`);
      }
      this.jobs.set(config.id, config);
    }
  }

  /**
   * Gets the total number of registered jobs.
   *
   * @returns Job count
   */
  getJobCount(): number {
    return this.jobs.size;
  }

  /**
   * Lists all registered jobs as summaries.
   *
   * @returns Array of job summaries
   */
  listJobs(): JobSummary[] {
    return Array.from(this.jobs.values()).map((j) => ({
      id: j.id,
      name: j.name,
      cron: j.cron,
      type: j.type,
      category: j.category,
      enabled: j.enabled,
    }));
  }

  /**
   * Gets a job configuration by ID.
   *
   * @param id - Job ID
   * @returns Job config or undefined
   */
  getJob(id: string): JobConfig | undefined {
    return this.jobs.get(id);
  }

  /**
   * Gets all jobs of a specific type.
   *
   * @param type - Job type to filter by
   * @returns Array of matching jobs
   */
  getJobsByType(type: JobConfig['type']): JobConfig[] {
    return Array.from(this.jobs.values()).filter((j) => j.type === type);
  }

  /**
   * Gets all jobs for a specific category.
   *
   * @param category - Category slug
   * @returns Array of matching jobs
   */
  getJobsByCategory(category: string): JobConfig[] {
    return Array.from(this.jobs.values()).filter((j) => j.category === category);
  }

  /**
   * Executes a job by ID.
   *
   * @param id - Job ID to execute
   * @returns Job execution result
   * @throws Error if job not found or disabled
   */
  async executeJob(id: string): Promise<JobResult> {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }
    if (!job.enabled) {
      throw new Error(`Job is disabled: ${id}`);
    }
    return job.handler();
  }
}
