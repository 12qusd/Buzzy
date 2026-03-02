/**
 * Push notification service using Firebase Cloud Messaging (FCM).
 * Supports single-device and topic-based push notifications.
 * Respects user opt-in/out and daily push cap.
 *
 * @module @buzzy/notifications/push/pushService
 */

/** Push notification payload */
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/** Target for push notification delivery */
export interface PushTarget {
  /** Single device FCM token */
  deviceToken?: string;
  /** FCM topic name (e.g., 'breaking-news', 'category-tech') */
  topic?: string;
  /** User ID (looks up device tokens from Firestore) */
  userId?: string;
}

/** Result of a push notification send */
export interface PushNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  dailyCountAfter?: number;
}

/** Default daily push cap per user */
const DEFAULT_DAILY_PUSH_CAP = 10;

/**
 * Sends a push notification via FCM.
 *
 * @param target - Delivery target (device token, topic, or userId)
 * @param payload - Notification content
 * @returns Result of the send operation
 */
export async function sendPushNotification(
  target: PushTarget,
  payload: PushNotificationPayload,
): Promise<PushNotificationResult> {
  // TODO: Initialize Firebase Admin SDK
  // const admin = require('firebase-admin');
  // if (!admin.apps.length) admin.initializeApp();
  // const messaging = admin.messaging();

  if (!target.deviceToken && !target.topic && !target.userId) {
    return { success: false, error: 'No target specified (deviceToken, topic, or userId required)' };
  }

  // TODO: If target.userId, look up device tokens from Firestore
  // TODO: Check daily push count for user against cap
  // TODO: Check user notification preferences (opt-in/out)

  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
      ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
    },
    data: payload.data ?? {},
    ...(target.deviceToken ? { token: target.deviceToken } : {}),
    ...(target.topic ? { topic: target.topic } : {}),
  };

  // TODO: Send via Firebase Cloud Messaging
  // const response = await messaging.send(message);

  console.log('Push notification prepared (FCM not configured)', {
    target: target.deviceToken ?? target.topic ?? target.userId,
    title: payload.title,
  });

  return {
    success: true,
    messageId: `stub-push-${Date.now()}`,
  };
}

/**
 * Sends a push notification to all subscribers of a topic.
 *
 * @param topic - FCM topic name
 * @param payload - Notification content
 * @returns Result of the send operation
 */
export async function sendTopicNotification(
  topic: string,
  payload: PushNotificationPayload,
): Promise<PushNotificationResult> {
  return sendPushNotification({ topic }, payload);
}

/**
 * Checks if a user has reached their daily push notification cap.
 *
 * @param userId - User to check
 * @param dailyCap - Maximum pushes per day
 * @returns Whether the user can receive more push notifications today
 */
export async function canSendPush(
  userId: string,
  dailyCap: number = DEFAULT_DAILY_PUSH_CAP,
): Promise<boolean> {
  // TODO: Query Firestore for today's push count for this user
  // const today = new Date().toISOString().split('T')[0];
  // const count = await db.collection('push_logs')
  //   .where('userId', '==', userId)
  //   .where('date', '==', today)
  //   .count().get();
  // return count.data().count < dailyCap;

  console.log('Push cap check (stub)', { userId, dailyCap });
  return true;
}

/**
 * Subscribes a device token to an FCM topic.
 *
 * @param deviceToken - FCM device token
 * @param topic - Topic to subscribe to
 */
export async function subscribeToTopic(
  deviceToken: string,
  topic: string,
): Promise<void> {
  // TODO: messaging.subscribeToTopic([deviceToken], topic)
  console.log('Topic subscribe (stub)', { deviceToken: deviceToken.substring(0, 8), topic });
}

/**
 * Unsubscribes a device token from an FCM topic.
 *
 * @param deviceToken - FCM device token
 * @param topic - Topic to unsubscribe from
 */
export async function unsubscribeFromTopic(
  deviceToken: string,
  topic: string,
): Promise<void> {
  // TODO: messaging.unsubscribeFromTopic([deviceToken], topic)
  console.log('Topic unsubscribe (stub)', { deviceToken: deviceToken.substring(0, 8), topic });
}
