/**
 * Daily Digest entity types for the Buzzy Today platform.
 * Generated once daily — a static summary of what mattered in the last 24 hours.
 *
 * @module @buzzy/shared/types/dailyDigest
 */

import type { FirestoreTimestamp } from './common.types.js';

/** Top story entry within a daily digest */
export interface DigestTopStory {
  readonly articleId: string;
  readonly headline: string;
  readonly whyItBlewUp: string;
  readonly categoryName: string;
  readonly categoryColor: string;
  readonly thumbnailUrl: string;
}

/** By-category summary entry within a daily digest */
export interface DigestCategorySummary {
  readonly categoryName: string;
  readonly summary: string;
  readonly articleId: string;
}

/** Daily digest stored in Firestore `daily_digests` collection */
export interface DailyDigest {
  readonly id: string;
  readonly date: string;
  readonly url: string;
  readonly whatsNarrative: string;
  readonly top5Stories: DigestTopStory[];
  readonly whatPeopleAreSaying: string[];
  readonly byCategory: DigestCategorySummary[];
  readonly buzzyMoment: string;
  readonly whyThisMatters: string;
  readonly generatedAt: FirestoreTimestamp;
  readonly isPublic: boolean;
}
