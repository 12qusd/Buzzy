/**
 * Publishing quota service for the Buzzy Today API.
 * Manages per-category daily publishing limits, random injection,
 * and quota utilization tracking.
 *
 * @module @buzzy/api/services/quotaService
 */

import { logger } from '../logger.js';

/** Quota configuration for a category */
export interface QuotaConfig {
  categoryId: string;
  dailyLimit: number;
  randomInjectionPercent: number;
  publishedToday: number;
  lastResetDate: string;
}

/** Quota utilization summary */
export interface QuotaUtilization {
  categoryId: string;
  categoryName: string;
  dailyLimit: number;
  publishedToday: number;
  utilizationPercent: number;
  remainingSlots: number;
  randomInjectionSlots: number;
}

/**
 * Fetches quota utilization for all categories.
 *
 * @returns Array of quota utilization records
 */
export async function getQuotaUtilization(): Promise<QuotaUtilization[]> {
  logger.info('Fetching quota utilization');

  // TODO: Query Firestore category_tags collection for publishing quotas
  // For each category:
  //   Read daily_limit from category_tags/{id}.publishingQuota
  //   Count articles published today where categoryTagId == id
  //   Calculate utilization

  return [];
}

/**
 * Updates the daily publishing limit for a category.
 *
 * @param categoryId - Category to update
 * @param dailyLimit - New daily article limit
 * @param randomInjectionPercent - Percentage of slots for serendipity content
 */
export async function updateQuota(
  categoryId: string,
  dailyLimit: number,
  randomInjectionPercent?: number,
): Promise<void> {
  logger.info('Updating quota', { categoryId, dailyLimit, randomInjectionPercent });

  // TODO: Update Firestore category_tags/{categoryId}.publishingQuota
}

/**
 * Checks if a category has remaining publishing slots for today.
 *
 * @param categoryId - Category to check
 * @returns Whether the category can accept more articles today
 */
export async function hasRemainingQuota(categoryId: string): Promise<boolean> {
  logger.debug('Checking quota', { categoryId });

  // TODO: Compare publishedToday count against dailyLimit
  return true; // Stub: always has room
}

/**
 * Increments the published count for a category.
 *
 * @param categoryId - Category to increment
 */
export async function incrementPublishedCount(categoryId: string): Promise<void> {
  logger.debug('Incrementing published count', { categoryId });

  // TODO: Atomic increment of daily counter in Firestore
}

/**
 * Calculates the number of random injection slots for a category.
 *
 * @param dailyLimit - Total daily limit
 * @param randomInjectionPercent - Percentage for random injection
 * @returns Number of slots reserved for random/serendipity content
 */
export function calculateRandomSlots(
  dailyLimit: number,
  randomInjectionPercent: number,
): number {
  return Math.floor(dailyLimit * (randomInjectionPercent / 100));
}
