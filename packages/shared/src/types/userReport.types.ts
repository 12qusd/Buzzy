/**
 * User Report entity types for the Buzzy Today platform.
 * Handles user feedback: report article, report comment, suggest improvement.
 *
 * @module @buzzy/shared/types/userReport
 */

import type { FirestoreTimestamp, UserReportTargetType, UserReportType } from './common.types.js';

/** User report stored in Firestore `user_reports` collection */
export interface UserReport {
  readonly id: string;
  readonly userId: string;
  readonly reportType: UserReportType;
  readonly targetType: UserReportTargetType;
  readonly targetId?: string;
  readonly reasonSelected: string;
  readonly description?: string;
  readonly sourceLocation: string;
  readonly createdAt: FirestoreTimestamp;
}
