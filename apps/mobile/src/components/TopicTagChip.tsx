/**
 * TopicTagChip component for displaying tappable topic tags.
 *
 * @module @buzzy/mobile/components/TopicTagChip
 */

import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

interface TopicTagChipProps {
  /** Tag data */
  tag: {
    id: string;
    displayName: string;
    slug: string;
  };
  /** Called when the chip is tapped */
  onPress: () => void;
}

/**
 * Tappable pill-shaped chip for a topic tag.
 *
 * @param props - TopicTagChip props
 */
export function TopicTagChip({ tag, onPress }: TopicTagChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.chipPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.chipText}>{tag.displayName}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipPressed: {
    backgroundColor: colors.border,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
});
