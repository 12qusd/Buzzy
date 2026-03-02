/**
 * User feedback service for the Buzzy Today API.
 * Handles article reports, comment reports, and general improvement suggestions.
 *
 * @module @buzzy/api/services/feedbackService
 */

import { logger } from '../logger.js';

/** Feedback report type */
export type FeedbackType = 'report_article' | 'report_comment' | 'improvement_general';

/** Feedback submission input */
export interface FeedbackInput {
  type: FeedbackType;
  userId: string;
  targetId?: string;
  targetType?: 'article' | 'comment' | 'none';
  reason: string;
  details?: string;
}

/** Feedback record stored in Firestore */
export interface FeedbackRecord extends FeedbackInput {
  id: string;
  status: 'open' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Submits a user feedback report.
 *
 * @param input - Feedback submission data
 * @returns The created feedback record
 */
export async function submitFeedback(input: FeedbackInput): Promise<FeedbackRecord> {
  const id = `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const record: FeedbackRecord = {
    ...input,
    id,
    status: 'open',
    createdAt: now,
  };

  logger.info('Feedback submitted', {
    feedbackId: id,
    type: input.type,
    userId: input.userId,
    targetId: input.targetId,
  });

  // TODO: Write to Firestore user_reports collection

  return record;
}

/**
 * Fetches feedback reports for admin review.
 *
 * @param status - Filter by status
 * @param limit - Maximum records to return
 * @returns Array of feedback records
 */
export async function getFeedbackReports(
  status?: string,
  limit: number = 50,
): Promise<FeedbackRecord[]> {
  logger.debug('Fetching feedback reports', { status, limit });

  // TODO: Query Firestore user_reports collection

  return [];
}
