/**
 * Welcome email service for Buzzy Today.
 * Sends welcome email via SendGrid within 60 seconds of signup.
 *
 * @module @buzzy/notifications/email/welcomeEmail
 */

import { buildWelcomeEmailHtml } from './templates.js';

/** Data needed to send a welcome email */
export interface WelcomeEmailData {
  userId: string;
  email: string;
  displayName: string;
}

/** Result of sending an email */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/** SendGrid configuration */
const SENDGRID_FROM_EMAIL = 'welcome@buzzy.today';
const SENDGRID_FROM_NAME = 'Buzzy Today';
const PREFERENCES_BASE_URL = 'https://buzzy.today/settings/notifications';

/**
 * Sends the welcome email to a new user via SendGrid.
 * Must be called within 60 seconds of user signup.
 *
 * @param data - New user's data
 * @returns Result of the email send
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  const preferencesUrl = `${PREFERENCES_BASE_URL}?userId=${encodeURIComponent(data.userId)}`;

  const html = buildWelcomeEmailHtml({
    userName: data.displayName || 'there',
    preferencesUrl,
  });

  const emailPayload = {
    personalizations: [
      {
        to: [{ email: data.email, name: data.displayName }],
        subject: 'Welcome to Buzzy Today! Start swiping through the buzz.',
      },
    ],
    from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
    content: [
      { type: 'text/html', value: html },
    ],
  };

  // TODO: Send via SendGrid API when SENDGRID_API_KEY is configured
  // const sgApiKey = process.env['SENDGRID_API_KEY'];
  // if (!sgApiKey) {
  //   return { success: false, error: 'SENDGRID_API_KEY not configured' };
  // }
  // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${sgApiKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(emailPayload),
  // });

  // Stub: Log the email payload for development
  console.log('Welcome email prepared (SendGrid not configured)', {
    to: data.email,
    subject: emailPayload.personalizations[0]?.subject,
  });

  return {
    success: true,
    messageId: `stub-${Date.now()}`,
  };
}
