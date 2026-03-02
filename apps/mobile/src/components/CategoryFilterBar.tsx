/**
 * CategoryFilterBar component for filtering feed by category.
 * Horizontal scrolling bar of category pills at the top of the feed.
 *
 * @module @buzzy/mobile/components/CategoryFilterBar
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

/** Category item for the filter bar */
interface CategoryItem {
  slug: string;
  name: string;
  color: string;
}

/** Available categories from the master spreadsheet */
const CATEGORIES: CategoryItem[] = [
  { slug: 'tech', name: 'Tech', color: '#3C82F6' },
  { slug: 'science', name: 'Science', color: '#10B981' },
  { slug: 'health', name: 'Health', color: '#8554F6' },
  { slug: 'politics', name: 'Politics', color: '#EF4444' },
  { slug: 'business', name: 'Business', color: '#F59E0B' },
  { slug: 'entertainment', name: 'Entertainment', color: '#EC4899' },
  { slug: 'sports', name: 'Sports', color: '#F97316' },
  { slug: 'world', name: 'World', color: '#06B6D4' },
  { slug: 'lifestyle', name: 'Lifestyle', color: '#14B8A6' },
  { slug: 'environment', name: 'Environment', color: '#22C55E' },
  { slug: 'education', name: 'Education', color: '#6366F1' },
];

interface CategoryFilterBarProps {
  /** Currently selected category slug (null for "All") */
  selectedCategory: string | null;
  /** Called when a category is selected */
  onSelect: (categorySlug: string | null) => void;
}

/**
 * Horizontally scrolling category filter bar.
 *
 * @param props - CategoryFilterBar props
 */
export function CategoryFilterBar({ selectedCategory, onSelect }: CategoryFilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "All" filter */}
        <Pressable
          style={[
            styles.pill,
            !selectedCategory && styles.pillActive,
          ]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.pillText, !selectedCategory && styles.pillTextActive]}>
            All
          </Text>
        </Pressable>

        {/* Category filters */}
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <Pressable
              key={cat.slug}
              style={[
                styles.pill,
                isActive && { backgroundColor: cat.color },
              ]}
              onPress={() => onSelect(cat.slug)}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});
