/**
 * FeedScreen — Main vertical swipe feed for the Buzzy Today app.
 * Displays full-screen StoryCards with swipe-up/down navigation,
 * preloading of next 3 cards, and session dedup.
 *
 * @module @buzzy/mobile/screens/FeedScreen
 */

import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  type ViewToken,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useFeedStore } from '../stores/feedStore';
import { StoryCard } from '../components/StoryCard';
import { CategoryFilterBar } from '../components/CategoryFilterBar';
import { type ArticleFeedItem, recordSignals, toggleBookmark } from '../services/api';
import { colors, spacing, fontSize } from '../utils/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
/** Height for the category filter bar */
const FILTER_BAR_HEIGHT = 48;
/** Height available for each card */
const CARD_HEIGHT = SCREEN_HEIGHT - FILTER_BAR_HEIGHT;

// TODO: Get from Firebase Auth
const MOCK_USER_ID = 'dev-user-001';

/**
 * Main feed screen with vertical swipe navigation.
 */
export function FeedScreen() {
  const {
    articles,
    currentIndex,
    loading,
    error,
    categoryFilter,
    loadFeed,
    nextArticle,
    setCategoryFilter,
    toggleBookmark: toggleBookmarkState,
  } = useFeedStore();

  const flatListRef = useRef<FlatList<ArticleFeedItem>>(null);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  /**
   * Handles viewability changes for swipe tracking.
   */
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const firstVisible = viewableItems[0];
        if (firstVisible?.index != null && firstVisible.index > currentIndex) {
          nextArticle();
        }
      }
    },
    [currentIndex, nextArticle],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  /**
   * Handles source link press — opens in-app browser.
   *
   * @param url - Source URL to open
   */
  const handleSourcePress = useCallback((url: string) => {
    // TODO: Open in-app browser with expo-web-browser
    console.log('Opening source:', url);
  }, []);

  /**
   * Handles topic tag chip press — navigates to tag page.
   *
   * @param tagSlug - Tag slug to navigate to
   */
  const handleTagPress = useCallback((tagSlug: string) => {
    // TODO: Navigate to tag detail screen
    console.log('Tag pressed:', tagSlug);
  }, []);

  /**
   * Records an engagement signal.
   *
   * @param article - The article being engaged with
   * @param signalType - Type of engagement signal
   */
  const recordSignal = useCallback(
    (article: ArticleFeedItem, signalType: string) => {
      void recordSignals([
        {
          userId: MOCK_USER_ID,
          articleId: article.id,
          signalType,
          categoryTagId: article.categoryTag.id,
          topicTagIds: article.topicTags.map((t) => t.id),
        },
      ]);
    },
    [],
  );

  /**
   * Renders a single story card item.
   */
  const renderItem = useCallback(
    ({ item }: { item: ArticleFeedItem }) => (
      <View style={{ height: CARD_HEIGHT }}>
        <StoryCard
          article={item}
          onSourcePress={handleSourcePress}
          onTagPress={handleTagPress}
          onLike={() => recordSignal(item, 'like')}
          onShare={() => recordSignal(item, 'share')}
          onBookmark={() => {
            toggleBookmarkState(item.id);
            void toggleBookmark(item.id, MOCK_USER_ID, !item.isBookmarked);
            recordSignal(item, 'bookmark');
          }}
        />
      </View>
    ),
    [handleSourcePress, handleTagPress, recordSignal, toggleBookmarkState],
  );

  const keyExtractor = useCallback((item: ArticleFeedItem) => item.id, []);

  // Error state
  if (error && articles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadFeed()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CategoryFilterBar
        selectedCategory={categoryFilter}
        onSelect={setCategoryFilter}
      />

      {loading && articles.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={articles}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          pagingEnabled
          snapToInterval={CARD_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          getItemLayout={(_data, index) => ({
            length: CARD_HEIGHT,
            offset: CARD_HEIGHT * index,
            index,
          })}
          windowSize={7}
          maxToRenderPerBatch={3}
          initialNumToRender={2}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No stories yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
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
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
});
