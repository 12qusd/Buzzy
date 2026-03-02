/**
 * User entity types for the Buzzy Today platform.
 * Represents user profiles, notification preferences, bookmarks, and interest graph data.
 *
 * @module @buzzy/shared/types/user
 */

import type { FirestoreTimestamp, NotificationLevel } from './common.types.js';

/** User notification preferences */
export interface NotificationPreferences {
  readonly pushEnabled: boolean;
  readonly emailEnabled: boolean;
  readonly dailyDigest: boolean;
  readonly commentReplies: boolean;
  readonly perTag: Record<string, NotificationLevel>;
  readonly perCategory: Record<string, NotificationLevel>;
  readonly dailyPushCap: number;
}

/** Core user profile stored in Firestore `users` collection */
export interface User {
  readonly uid: string;
  readonly email: string;
  readonly username: string;
  readonly displayName: string;
  readonly location?: string;
  readonly avatarUrl?: string;
  readonly onboardingCompleted: boolean;
  readonly notificationPreferences: NotificationPreferences;
  readonly createdAt: FirestoreTimestamp;
  readonly lastLoginAt: FirestoreTimestamp;
  readonly loginCount: number;
}

/** Bookmark stored in `users/{uid}/bookmarks` subcollection */
export interface UserBookmark {
  readonly articleId: string;
  readonly articleHeadline: string;
  readonly articleImageUrl: string;
  readonly categoryTagName: string;
  readonly categoryColor: string;
  readonly createdAt: FirestoreTimestamp;
}

/** Followed tag stored in `users/{uid}/followed_tags` subcollection */
export interface FollowedTag {
  readonly tagId: string;
  readonly tagName: string;
  readonly tagSlug: string;
  readonly categoryId: string;
  readonly followedAt: FirestoreTimestamp;
}

/** Followed category stored in `users/{uid}/followed_categories` subcollection */
export interface FollowedCategory {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly categorySlug: string;
  readonly followedAt: FirestoreTimestamp;
}

/** Interest graph entry stored in `users/{uid}/interest_graph` subcollection */
export interface InterestGraphEntry {
  readonly tagId: string;
  readonly tagType: 'topic' | 'category';
  readonly weight: number;
  readonly lastUpdatedAt: FirestoreTimestamp;
  readonly lastDecayAt: FirestoreTimestamp;
}
