/**
 * Deep linking configuration for the Buzzy Today mobile app.
 * Maps web URLs to mobile app screens via expo-router.
 *
 * URL Scheme: buzzy://
 * Web Domain: buzzy.today
 *
 * @module @buzzy/mobile/utils/linking
 */

/**
 * Linking configuration for React Navigation.
 * Maps URL paths to screen names.
 */
export const linkingConfig = {
  prefixes: ['buzzy://', 'https://buzzy.today', 'https://www.buzzy.today'],
  config: {
    screens: {
      Feed: '',
      ArticleDetail: 'article/:id',
      TagDetail: 'tag/:slug',
      CategoryDetail: 'category/:slug',
      Bookmarks: 'bookmarks',
      TagBrowser: 'tags',
      Settings: 'settings',
    },
  },
} as const;

/** Screen name type union */
export type ScreenName = keyof typeof linkingConfig.config.screens;

/**
 * Builds a deep link URL for a given screen and params.
 *
 * @param screen - Screen name
 * @param params - Route parameters
 * @returns Deep link URL
 */
export function buildDeepLink(
  screen: ScreenName,
  params?: Record<string, string>,
): string {
  const path = linkingConfig.config.screens[screen];
  let url = `buzzy://${path}`;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  return url;
}

/**
 * Builds a web URL for a given screen and params (for sharing).
 *
 * @param screen - Screen name
 * @param params - Route parameters
 * @returns Web URL
 */
export function buildWebUrl(
  screen: ScreenName,
  params?: Record<string, string>,
): string {
  const path = linkingConfig.config.screens[screen];
  let url = `https://buzzy.today/${path}`;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  return url;
}
