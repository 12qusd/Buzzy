/**
 * Comment entity types for the Buzzy Today platform.
 * Comments are user-generated content on articles.
 *
 * @module @buzzy/shared/types/comment
 */

import type { FirestoreTimestamp } from './common.types.js';

/** Comment stored in Firestore `articles/{articleId}/comments` subcollection */
export interface Comment {
  readonly id: string;
  readonly articleId: string;
  readonly userId: string;
  readonly username: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly content: string;
  readonly likeCount: number;
  readonly isTopTake: boolean;
  readonly createdAt: FirestoreTimestamp;
  readonly updatedAt: FirestoreTimestamp;
}
