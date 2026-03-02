/**
 * TagBrowserScreen — Browse topic tags grouped by category.
 * Provides a search bar at the top and categorized tag clouds.
 *
 * @module @buzzy/mobile/screens/TagBrowserScreen
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { apiGet } from '../services/api';
import { TopicTagChip } from '../components/TopicTagChip';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

interface TagItem {
  id: string;
  displayName: string;
  slug: string;
  followerCount: number;
}

interface TagSearchResponse {
  tags: TagItem[];
  query: string;
}

interface CategoryTagsResponse {
  tags: TagItem[];
  categoryId: string;
}

/** Categories with their display info */
const CATEGORIES = [
  { id: 'tech', name: 'Tech', color: '#3C82F6' },
  { id: 'science', name: 'Science', color: '#10B981' },
  { id: 'health', name: 'Health', color: '#8554F6' },
  { id: 'politics', name: 'Politics', color: '#EF4444' },
  { id: 'business', name: 'Business', color: '#F59E0B' },
  { id: 'entertainment', name: 'Entertainment', color: '#EC4899' },
  { id: 'sports', name: 'Sports', color: '#F97316' },
  { id: 'world', name: 'World', color: '#06B6D4' },
  { id: 'lifestyle', name: 'Lifestyle', color: '#14B8A6' },
  { id: 'environment', name: 'Environment', color: '#22C55E' },
  { id: 'education', name: 'Education', color: '#6366F1' },
];

interface TagBrowserScreenProps {
  /** Callback when a tag is selected */
  onSelectTag: (tagSlug: string) => void;
}

/**
 * Tag browser with search and category-grouped tag clouds.
 *
 * @param props - TagBrowserScreen props
 */
export function TagBrowserScreen({ onSelectTag }: TagBrowserScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TagItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [categoryTags, setCategoryTags] = useState<Record<string, TagItem[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  /**
   * Searches tags via the API.
   */
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await apiGet<TagSearchResponse>('/tags/search', { q: query });
      setSearchResults(response.tags);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  /**
   * Debounced search on query change.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      void handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  /**
   * Loads tags for each category on mount.
   */
  useEffect(() => {
    async function loadCategoryTags() {
      setLoadingCategories(true);
      const results: Record<string, TagItem[]> = {};
      // Load tags for each category in parallel
      await Promise.all(
        CATEGORIES.map(async (cat) => {
          try {
            const response = await apiGet<CategoryTagsResponse>(
              `/tags/category/${cat.id}`,
            );
            results[cat.id] = response.tags;
          } catch {
            results[cat.id] = [];
          }
        }),
      );
      setCategoryTags(results);
      setLoadingCategories(false);
    }
    void loadCategoryTags();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tags..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Search results */}
      {searchQuery.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : searchResults.length > 0 ? (
            <View style={styles.tagCloud}>
              {searchResults.map((tag) => (
                <TopicTagChip
                  key={tag.id}
                  tag={tag}
                  onPress={() => onSelectTag(tag.slug)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No tags found</Text>
          )}
        </View>
      )}

      {/* Category-grouped tag clouds */}
      {searchQuery.length === 0 && (
        <>
          {loadingCategories ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            CATEGORIES.map((cat) => {
              const tags = categoryTags[cat.id] ?? [];
              return (
                <View key={cat.id} style={styles.section}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.sectionTitle}>{cat.name}</Text>
                  </View>
                  {tags.length > 0 ? (
                    <View style={styles.tagCloud}>
                      {tags.map((tag) => (
                        <TopicTagChip
                          key={tag.id}
                          tag={tag}
                          onPress={() => onSelectTag(tag.slug)}
                        />
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>No tags yet</Text>
                  )}
                </View>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.sm,
  },
});
