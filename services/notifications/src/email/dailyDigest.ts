/**
 * Daily Digest email generation for Buzzy Today.
 * Generates a digest with: What's Buzzy narrative, Top 5 Stories,
 * What People Are Saying, By Category, Buzzy Moment, Why This Matters.
 * Static URL by date.
 *
 * @module @buzzy/notifications/email/dailyDigest
 */

/** A story included in the daily digest */
export interface DigestStory {
  id: string;
  headline: string;
  tldr: string;
  categoryName: string;
  categoryColor: string;
  imageUrl: string;
  permalink: string;
  likeCount: number;
  commentCount: number;
}

/** Daily digest content */
export interface DailyDigestContent {
  date: string;
  whatsNewNarrative: string;
  topStories: DigestStory[];
  categoryHighlights: {
    categoryName: string;
    categoryColor: string;
    storyCount: number;
    topStory: DigestStory;
  }[];
  buzzyMoment: {
    headline: string;
    tldr: string;
    whyItMatters: string;
  };
  topComment: {
    authorName: string;
    articleHeadline: string;
    commentText: string;
  } | null;
}

/** Result of digest generation */
export interface DigestResult {
  digestId: string;
  date: string;
  staticUrl: string;
  html: string;
  recipientCount: number;
}

/**
 * Generates the static URL for a daily digest by date.
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns The static digest URL
 */
export function getDigestUrl(date: string): string {
  return `https://buzzy.today/digest/${date}`;
}

/**
 * Generates the daily digest content from the day's articles.
 *
 * @param date - Date to generate digest for (YYYY-MM-DD)
 * @returns Daily digest content
 */
export async function generateDigestContent(date: string): Promise<DailyDigestContent> {
  // TODO: Query Firestore for articles published on this date
  // 1. Get top 5 stories by engagement score
  // 2. Get category highlights (top story per category)
  // 3. Generate "What's Buzzy" narrative via AI or template
  // 4. Select "Buzzy Moment" (highest engagement story)
  // 5. Get top comment

  return {
    date,
    whatsNewNarrative: '',
    topStories: [],
    categoryHighlights: [],
    buzzyMoment: {
      headline: '',
      tldr: '',
      whyItMatters: '',
    },
    topComment: null,
  };
}

/**
 * Builds the HTML for the daily digest email.
 *
 * @param content - Generated digest content
 * @returns HTML string for the digest email
 */
export function buildDigestHtml(content: DailyDigestContent): string {
  const formattedDate = new Date(content.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const storiesHtml = content.topStories
    .map(
      (story) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #E5E7EB;">
          <a href="${escapeHtml(story.permalink)}" style="text-decoration: none;">
            <span style="display: inline-block; background: ${story.categoryColor}; color: white; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${escapeHtml(story.categoryName)}</span>
            <h3 style="color: #111827; font-size: 18px; margin: 8px 0 4px;">${escapeHtml(story.headline)}</h3>
            <p style="color: #6B7280; font-size: 14px; margin: 0; line-height: 1.5;">${escapeHtml(story.tldr)}</p>
          </a>
        </td>
      </tr>`
    )
    .join('');

  const categoryHtml = content.categoryHighlights
    .map(
      (cat) => `
      <td style="padding: 8px; text-align: center;">
        <div style="background: ${cat.categoryColor}; color: white; padding: 8px 12px; border-radius: 8px; font-size: 13px;">
          <strong>${escapeHtml(cat.categoryName)}</strong><br>
          <span style="font-size: 12px;">${cat.storyCount} stories</span>
        </div>
      </td>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buzzy Today Daily Digest - ${escapeHtml(formattedDate)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background: #3C82F6; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Buzzy Today</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Daily Digest &mdash; ${escapeHtml(formattedDate)}</p>
      </div>

      <div style="padding: 24px;">
        <!-- What's Buzzy -->
        ${content.whatsNewNarrative ? `
        <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h2 style="font-size: 16px; color: #111827; margin: 0 0 8px;">What's Buzzy</h2>
          <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 0;">${escapeHtml(content.whatsNewNarrative)}</p>
        </div>` : ''}

        <!-- Top Stories -->
        <h2 style="font-size: 18px; color: #111827; margin: 0 0 16px;">Top Stories</h2>
        <table style="width: 100%; border-collapse: collapse;">${storiesHtml}</table>

        <!-- Category Highlights -->
        ${categoryHtml ? `
        <h2 style="font-size: 18px; color: #111827; margin: 24px 0 12px;">By Category</h2>
        <table style="width: 100%;"><tr>${categoryHtml}</tr></table>` : ''}

        <!-- Buzzy Moment -->
        ${content.buzzyMoment.headline ? `
        <div style="background: #FEF3C7; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <h2 style="font-size: 16px; color: #92400E; margin: 0 0 8px;">Buzzy Moment</h2>
          <h3 style="font-size: 15px; color: #111827; margin: 0 0 8px;">${escapeHtml(content.buzzyMoment.headline)}</h3>
          <p style="font-size: 14px; color: #4B5563; margin: 0 0 8px;">${escapeHtml(content.buzzyMoment.tldr)}</p>
          <p style="font-size: 13px; color: #92400E; margin: 0;"><strong>Why this matters:</strong> ${escapeHtml(content.buzzyMoment.whyItMatters)}</p>
        </div>` : ''}

        <!-- Top Comment -->
        ${content.topComment ? `
        <div style="border-left: 3px solid #3C82F6; padding: 12px 16px; margin-top: 24px;">
          <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 4px;">What People Are Saying</p>
          <p style="font-size: 14px; color: #374151; margin: 0 0 8px;">"${escapeHtml(content.topComment.commentText)}"</p>
          <p style="font-size: 12px; color: #6B7280; margin: 0;">&mdash; ${escapeHtml(content.topComment.authorName)} on "${escapeHtml(content.topComment.articleHeadline)}"</p>
        </div>` : ''}
      </div>

      <!-- Footer -->
      <div style="padding: 16px 24px; background: #F9FAFB; text-align: center; border-top: 1px solid #E5E7EB;">
        <a href="${escapeHtml(getDigestUrl(content.date))}" style="color: #3C82F6; text-decoration: none; font-size: 13px;">View this digest online</a>
        <p style="font-size: 11px; color: #9CA3AF; margin: 8px 0 0;">&copy; ${new Date().getFullYear()} Buzzy Today</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates and sends the daily digest for a specific date.
 * Called by the scheduler Cloud Function.
 *
 * @param date - Date in YYYY-MM-DD format
 * @returns Digest generation result
 */
export async function generateAndSendDailyDigest(date: string): Promise<DigestResult> {
  const content = await generateDigestContent(date);
  const html = buildDigestHtml(content);
  const staticUrl = getDigestUrl(date);

  // TODO: Store digest HTML at static URL (Cloud Storage or CDN)
  // TODO: Send via SendGrid to all users with dailyDigestEnabled=true
  // TODO: Respect each user's digestSendTime preference

  return {
    digestId: `digest-${date}`,
    date,
    staticUrl,
    html,
    recipientCount: 0, // Stub: no recipients until Firestore wired
  };
}

/**
 * Escapes HTML special characters.
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
