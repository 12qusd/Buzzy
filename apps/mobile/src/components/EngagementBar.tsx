/**
 * EngagementBar component for article interaction buttons.
 * Sits at the bottom of each StoryCard with like, share, and bookmark actions.
 *
 * @module @buzzy/mobile/components/EngagementBar
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

interface EngagementBarProps {
  /** Whether the article is currently bookmarked */
  isBookmarked: boolean;
  /** Called when like is pressed */
  onLike: () => void;
  /** Called when share is pressed */
  onShare: () => void;
  /** Called when bookmark is pressed */
  onBookmark: () => void;
}

/**
 * Bottom action bar for article engagement.
 *
 * @param props - EngagementBar props
 */
export function EngagementBar({
  isBookmarked,
  onLike,
  onShare,
  onBookmark,
}: EngagementBarProps) {
  return (
    <View style={styles.container}>
      <ActionButton label="Like" icon="heart" onPress={onLike} />
      <ActionButton label="Share" icon="share" onPress={onShare} />
      <ActionButton
        label={isBookmarked ? 'Saved' : 'Save'}
        icon="bookmark"
        active={isBookmarked}
        onPress={onBookmark}
      />
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  icon: string;
  active?: boolean;
  onPress: () => void;
}

/**
 * Individual action button in the engagement bar.
 * Uses text labels as icon placeholders until a proper icon library is added.
 */
function ActionButton({ label, active, onPress }: ActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.actionButtonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.actionLabel, active && styles.actionLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonPressed: {
    backgroundColor: colors.surface,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionLabelActive: {
    color: colors.primary,
  },
});
