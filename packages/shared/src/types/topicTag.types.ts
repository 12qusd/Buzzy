/**
 * Topic Tag entity types for the Buzzy Today platform.
 * Topic Tags are the core taxonomy unit — canonical, unique-slug, followable metadata labels.
 *
 * @module @buzzy/shared/types/topicTag
 */

import type { FirestoreTimestamp, TopicTagType } from './common.types.js';

/** Topic tag stored in Firestore `topic_tags` collection */
export interface TopicTag {
  readonly id: string;
  readonly displayName: string;
  readonly canonicalName: string;
  readonly slug: string;
  readonly topicTagType: TopicTagType;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly bucketId: string;
  readonly bucketName: string;
  readonly description?: string;
  readonly synonyms: string[];
  readonly followerCount: number;
  readonly articleCount: number;
  readonly relatedTagIds: string[];
  readonly isActive: boolean;
  readonly createdAt: FirestoreTimestamp;
  readonly updatedAt: FirestoreTimestamp;
}
