/**
 * @buzzy/notifications — Push and email notification service.
 * FCM for mobile push, SendGrid for transactional email.
 *
 * @module @buzzy/notifications
 */

export { sendWelcomeEmail, type WelcomeEmailData } from './email/welcomeEmail.js';
export { buildWelcomeEmailHtml } from './email/templates.js';
export {
  generateAndSendDailyDigest,
  getDigestUrl,
  buildDigestHtml,
  type DailyDigestContent,
  type DigestStory,
  type DigestResult,
} from './email/dailyDigest.js';
export {
  sendPushNotification,
  type PushNotificationPayload,
  type PushNotificationResult,
} from './push/pushService.js';
export {
  getUserNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from './preferences.js';
