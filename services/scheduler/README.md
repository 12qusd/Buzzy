# Buzzy Scheduler Service

Cron job orchestrator for Buzzy Today scheduled tasks.

## Scheduled Jobs
- RSS feed polling (per-category frequency)
- Article publishing (per-category delay after import)
- Interest graph time decay (weekly)
- Daily Digest generation

## Configuration

Cron schedules are defined in `@buzzy/shared/constants/cronSchedules`.
