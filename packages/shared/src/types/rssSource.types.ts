/**
 * RSS Source entity types for the Buzzy Today platform.
 * Represents RSS feed registrations with AI-detected structure caching.
 *
 * @module @buzzy/shared/types/rssSource
 */

import type { FirestoreTimestamp } from './common.types.js';

/** Cached AI-detected feed field mapping */
export interface FeedStructure {
  readonly titleField: string;
  readonly imageUrlField: string;
  readonly descriptionField: string;
  readonly contentField: string;
}

/** RSS source stored in Firestore `rss_sources` collection */
export interface RssSource {
  readonly id: string;
  readonly channelName: string;
  readonly publisherName: string;
  readonly feedUrl: string;
  readonly assignedCategoryId?: string;
  readonly tagBasedClassification: boolean;
  readonly feedStructure?: FeedStructure;
  readonly lastPollAt?: FirestoreTimestamp;
  readonly lastSuccessAt?: FirestoreTimestamp;
  readonly failureCount: number;
  readonly isActive: boolean;
  readonly createdAt: FirestoreTimestamp;
}
