/**
 * App navigation structure for the Buzzy Today mobile app.
 * Shows onboarding for first-time users, then the feed.
 *
 * @module @buzzy/mobile/navigation/AppNavigator
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FeedScreen } from '../screens/FeedScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useOnboardingStore } from '../stores/onboardingStore';
import { colors } from '../utils/theme';

/**
 * Root navigator component.
 * Shows OnboardingScreen for first-time users.
 * After onboarding completion, renders FeedScreen.
 * TODO: Add React Navigation stack with tag detail, bookmarks, settings screens.
 */
export function AppNavigator() {
  const isOnboardingComplete = useOnboardingStore((s) => s.isComplete);

  return (
    <View style={styles.container}>
      {isOnboardingComplete ? <FeedScreen /> : <OnboardingScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
