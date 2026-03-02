/**
 * Email HTML templates for Buzzy Today notifications.
 *
 * @module @buzzy/notifications/email/templates
 */

/** Data for building the welcome email template */
interface WelcomeTemplateData {
  userName: string;
  preferencesUrl: string;
}

/**
 * Builds the HTML for the welcome email.
 * Contains product explanation and manage preferences link.
 *
 * @param data - Template data
 * @returns HTML string for the welcome email
 */
export function buildWelcomeEmailHtml(data: WelcomeTemplateData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Buzzy Today</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 24px; font-weight: 700; color: #3C82F6; margin-bottom: 24px; }
    h1 { font-size: 22px; color: #111827; margin: 0 0 16px; }
    p { font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 16px; }
    .feature { display: flex; margin-bottom: 12px; }
    .feature-icon { font-size: 20px; margin-right: 12px; }
    .feature-text { font-size: 14px; color: #374151; }
    .cta { display: inline-block; background: #3C82F6; color: #ffffff; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; }
    .preferences { font-size: 13px; color: #9CA3AF; margin-top: 32px; text-align: center; }
    .preferences a { color: #3C82F6; text-decoration: none; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #9CA3AF; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Buzzy Today</div>
      <h1>Welcome, ${escapeHtml(data.userName)}!</h1>
      <p>You're all set to stay in the know. Here's what Buzzy Today does for you:</p>

      <div class="feature">
        <span class="feature-icon">&#x26A1;</span>
        <span class="feature-text"><strong>TL;DR Summaries</strong> &mdash; Every story distilled to its essence. Key takeaways, not click-bait.</span>
      </div>
      <div class="feature">
        <span class="feature-icon">&#x1F9E0;</span>
        <span class="feature-text"><strong>Personalized Feed</strong> &mdash; The more you read, the smarter your feed gets. Follow topics you care about.</span>
      </div>
      <div class="feature">
        <span class="feature-icon">&#x1F4F1;</span>
        <span class="feature-text"><strong>Swipe to Browse</strong> &mdash; One story at a time, designed for how you actually read news on mobile.</span>
      </div>
      <div class="feature">
        <span class="feature-icon">&#x1F4AC;</span>
        <span class="feature-text"><strong>Buzzy Take</strong> &mdash; Our signature editorial perspective on every story.</span>
      </div>

      <p>Start swiping through today's top stories now:</p>
      <a href="https://buzzy.today" class="cta">Open Buzzy Today</a>

      <div class="preferences">
        <a href="${escapeHtml(data.preferencesUrl)}">Manage your notification preferences</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Buzzy Today. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Escapes HTML special characters to prevent XSS.
 *
 * @param text - Text to escape
 * @returns HTML-safe text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
