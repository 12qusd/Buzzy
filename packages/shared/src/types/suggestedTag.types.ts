/**
 * Suggested Tag entity types for the Buzzy Today platform.
 * AI-suggested tags pending editorial review before promotion to canonical tags.
 *
 * @module @buzzy/shared/types/suggestedTag
 */

import type { FirestoreTimestamp, SuggestedTagStatus } from './common.types.js';

/** Suggested tag stored in Firestore `suggested_tags` collection */
export interface SuggestedTag {
  readonly id: string;
  readonly term: string;
  readonly normalizedSlug: string;
  readonly suggestedBucket: string;
  readonly proposedTagType: string;
  readonly proposedCategoryId: string;
  readonly aiConfidenceScore: number;
  readonly sourceArticleId: string;
  readonly status: SuggestedTagStatus;
  readonly reviewedBy?: string;
  readonly reviewedAt?: FirestoreTimestamp;
  readonly createdAt: FirestoreTimestamp;
}
