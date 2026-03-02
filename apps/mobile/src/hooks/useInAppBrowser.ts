/**
 * Hook for opening URLs in an in-app browser.
 * Uses Linking as a fallback until expo-web-browser is installed.
 *
 * @module @buzzy/mobile/hooks/useInAppBrowser
 */

import { useCallback } from 'react';
import { Linking } from 'react-native';

/**
 * Hook that provides a function to open URLs in the browser.
 *
 * @returns Object with an `open` function
 */
export function useInAppBrowser() {
  /**
   * Opens a URL. Attempts expo-web-browser first, falls back to Linking.
   *
   * @param url - The URL to open
   */
  const open = useCallback(async (url: string) => {
    try {
      // TODO: Replace with expo-web-browser for better UX
      // import * as WebBrowser from 'expo-web-browser';
      // await WebBrowser.openBrowserAsync(url);
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {
      // Silently fail — non-critical
    }
  }, []);

  return { open };
}
