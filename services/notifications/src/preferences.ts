/**
 * Notification preferences service for Buzzy Today.
 * Manages per-user push and email notification settings.
 * Supports per-category/tag toggles and daily push cap.
 *
 * @module @buzzy/notifications/preferences
 */

/** Notification level for a category or tag */
export type NotificationLevel = 'off' | 'daily' | 'immediate';

/** Per-category notification preference */
export interface CategoryNotificationPref {
  categoryId: string;
  push: NotificationLevel;
  email: NotificationLevel;
}

/** Per-tag notification preference */
export interface TagNotificationPref {
  tagId: string;
  push: NotificationLevel;
  email: NotificationLevel;
}

/** Full notification preferences for a user */
export interface NotificationPreferences {
  userId: string;
  /** Global push opt-in */
  pushEnabled: boolean;
  /** Global email opt-in */
  emailEnabled: boolean;
  /** Daily push notification cap */
  dailyPushCap: number;
  /** Notify on comment replies */
  commentReplyNotifications: boolean;
  /** Per-category preferences */
  categoryPrefs: CategoryNotificationPref[];
  /** Per-tag preferences */
  tagPrefs: TagNotificationPref[];
  /** Daily digest opt-in */
  dailyDigestEnabled: boolean;
  /** Preferred digest send time (24h format, e.g., '08:00') */
  digestSendTime: string;
}

/** Default notification preferences for new users */
const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'userId'> = {
  pushEnabled: true,
  emailEnabled: true,
  dailyPushCap: 10,
  commentReplyNotifications: true,
  categoryPrefs: [],
  tagPrefs: [],
  dailyDigestEnabled: true,
  digestSendTime: '08:00',
};

/**
 * Fetches notification preferences for a user.
 * Returns defaults if no preferences are stored.
 *
 * @param userId - User ID
 * @returns User's notification preferences
 */
export async function getUserNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  // TODO: Query Firestore users/{userId}/notification_preferences
  // If not found, return defaults

  return {
    userId,
    ...DEFAULT_PREFERENCES,
  };
}

/**
 * Updates notification preferences for a user.
 *
 * @param userId - User ID
 * @param updates - Partial preference updates
 * @returns Updated preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<Omit<NotificationPreferences, 'userId'>>,
): Promise<NotificationPreferences> {
  const current = await getUserNotificationPreferences(userId);

  const updated: NotificationPreferences = {
    ...current,
    ...updates,
  };

  // TODO: Write to Firestore users/{userId}/notification_preferences
  console.log('Notification preferences updated (stub)', { userId, updates });

  return updated;
}

/**
 * Checks if a user should receive a push notification for a given category.
 *
 * @param prefs - User's notification preferences
 * @param categoryId - Category to check
 * @returns Whether push should be sent
 */
export function shouldSendPushForCategory(
  prefs: NotificationPreferences,
  categoryId: string,
): boolean {
  if (!prefs.pushEnabled) return false;

  const catPref = prefs.categoryPrefs.find((c) => c.categoryId === categoryId);
  if (!catPref) return true; // Default to enabled if no specific preference

  return catPref.push !== 'off';
}

/**
 * Checks if a user should receive an email notification for a given category.
 *
 * @param prefs - User's notification preferences
 * @param categoryId - Category to check
 * @returns Whether email should be sent
 */
export function shouldSendEmailForCategory(
  prefs: NotificationPreferences,
  categoryId: string,
): boolean {
  if (!prefs.emailEnabled) return false;

  const catPref = prefs.categoryPrefs.find((c) => c.categoryId === categoryId);
  if (!catPref) return true;

  return catPref.email !== 'off';
}
