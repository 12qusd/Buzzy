/**
 * BookmarksScreen — Displays the user's saved/bookmarked articles.
 *
 * @module @buzzy/mobile/screens/BookmarksScreen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { apiGet, type ArticleFeedItem } from '../services/api';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

interface BookmarksResponse {
  bookmarks: ArticleFeedItem[];
}

/**
 * Screen showing all bookmarked articles as a compact list.
 */
export function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<ArticleFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet<BookmarksResponse>('/users/me/bookmarks');
      setBookmarks(response.bookmarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookmarks();
  }, [loadBookmarks]);

  /**
   * Renders a compact bookmark list item.
   */
  const renderItem = useCallback(
    ({ item }: { item: ArticleFeedItem }) => (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => {
          // TODO: Navigate to article detail or open in feed
          console.log('Open bookmarked article:', item.id);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryDot, { backgroundColor: item.categoryTag.color }]} />
          <Text style={styles.categoryName}>{item.categoryTag.name}</Text>
          <Text style={styles.publishedAt}>{item.publishedAt}</Text>
        </View>
        <Text style={styles.headline} numberOfLines={2}>
          {item.headline}
        </Text>
        <Text style={styles.snippet} numberOfLines={2}>
          {item.snappySentence}
        </Text>
      </Pressable>
    ),
    [],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadBookmarks()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Stories</Text>
      <FlatList
        data={bookmarks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No saved stories yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the save button on any story to add it here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  publishedAt: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  headline: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  snippet: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
