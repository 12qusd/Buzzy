/**
 * Category Tag entity types for the Buzzy Today platform.
 * Category Tags are top-level content sections with summarization config and publishing quotas.
 *
 * @module @buzzy/shared/types/categoryTag
 */

import type { FirestoreTimestamp } from './common.types.js';

/** Per-category AI summarization configuration */
export interface SummarizationConfig {
  readonly tone: string;
  readonly headlineGuide: string;
  readonly readingLevel: string;
  readonly hedgeLevel: string;
  readonly buzzyTakeStyle: string;
  readonly emojisAllowed: boolean;
  readonly fallbackImageUrls: string[];
}

/** Category tag stored in Firestore `category_tags` collection */
export interface CategoryTag {
  readonly id: string;
  readonly name: string;
  readonly sectionName: string;
  readonly color: string;
  readonly slug: string;
  readonly permalink: string;
  readonly newsblurFeedUrl?: string;
  readonly summarizationConfig: SummarizationConfig;
  readonly publishingQuota: number;
  readonly pullFrequency: string;
  readonly publishFrequency: string;
  readonly followerCount: number;
  readonly isActive: boolean;
  readonly createdAt: FirestoreTimestamp;
}
