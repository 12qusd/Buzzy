/**
 * TagDetailScreen — Topic tag detail page showing description,
 * related stories, and related tags with follow/unfollow.
 *
 * @module @buzzy/mobile/screens/TagDetailScreen
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
import { apiGet, apiPost, type ArticleFeedItem } from '../services/api';
import { TopicTagChip } from '../components/TopicTagChip';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

interface TagDetail {
  id: string;
  displayName: string;
  canonicalName: string;
  slug: string;
  topicTagType: string;
  categoryName: string;
  description: string | null;
  followerCount: number;
  articleCount: number;
  relatedTagIds: string[];
  isFollowed: boolean;
}

interface TagDetailResponse {
  tag: TagDetail;
}

interface TagArticlesResponse {
  articles: ArticleFeedItem[];
  tag: string;
}

interface RelatedTag {
  id: string;
  displayName: string;
  slug: string;
}

interface TagDetailScreenProps {
  /** Tag slug passed from navigation */
  tagSlug: string;
  /** Callback to navigate to another tag */
  onNavigateToTag: (slug: string) => void;
  /** Callback to navigate to an article */
  onNavigateToArticle: (articleId: string) => void;
}

/**
 * Tag detail screen with description, follow button, related stories, related tags.
 *
 * @param props - TagDetailScreen props
 */
export function TagDetailScreen({
  tagSlug,
  onNavigateToTag,
  onNavigateToArticle,
}: TagDetailScreenProps) {
  const [tag, setTag] = useState<TagDetail | null>(null);
  const [articles, setArticles] = useState<ArticleFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);

  const loadTag = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tagResponse, articlesResponse] = await Promise.all([
        apiGet<TagDetailResponse>(`/tags/${tagSlug}`),
        apiGet<TagArticlesResponse>(`/articles/tag/${tagSlug}`),
      ]);
      setTag(tagResponse.tag);
      setFollowing(tagResponse.tag?.isFollowed ?? false);
      setArticles(articlesResponse.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tag');
    } finally {
      setLoading(false);
    }
  }, [tagSlug]);

  useEffect(() => {
    void loadTag();
  }, [loadTag]);

  /**
   * Toggles follow status for this tag.
   */
  const handleFollowToggle = useCallback(async () => {
    if (!tag) return;
    const newFollowing = !following;
    setFollowing(newFollowing);
    try {
      await apiPost(`/tags/${tag.id}/follow`, {
        userId: 'dev-user-001', // TODO: Get from auth
        following: newFollowing,
      });
    } catch {
      setFollowing(!newFollowing); // Revert on error
    }
  }, [tag, following]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !tag) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Tag not found'}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadTag()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.tagName}>{tag.displayName}</Text>
            <Pressable
              style={[styles.followButton, following && styles.followButtonActive]}
              onPress={() => void handleFollowToggle()}
            >
              <Text style={[styles.followText, following && styles.followTextActive]}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.meta}>
            {tag.categoryName} &middot; {tag.followerCount.toLocaleString()} followers &middot; {tag.articleCount.toLocaleString()} articles
          </Text>

          {tag.description && (
            <Text style={styles.description}>{tag.description}</Text>
          )}

          {/* Related tags placeholder */}
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Related Tags</Text>
            <View style={styles.relatedTags}>
              {tag.relatedTagIds.length === 0 && (
                <Text style={styles.emptyText}>No related tags</Text>
              )}
              {/* TODO: Resolve relatedTagIds to full tag objects */}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Stories</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.articleCard, pressed && styles.cardPressed]}
          onPress={() => onNavigateToArticle(item.id)}
        >
          <Text style={styles.articleHeadline} numberOfLines={2}>
            {item.headline}
          </Text>
          <Text style={styles.articleSnippet} numberOfLines={2}>
            {item.snappySentence}
          </Text>
          <View style={styles.articleMeta}>
            <Text style={styles.articleSource}>{item.sourcePublisher}</Text>
            <Text style={styles.articleDate}>{item.publishedAt}</Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No stories with this tag yet</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  listContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tagName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  followButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followButtonActive: {
    backgroundColor: colors.primary,
  },
  followText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  followTextActive: {
    color: '#FFFFFF',
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  relatedSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  relatedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  articleCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  cardPressed: {
    backgroundColor: colors.surface,
  },
  articleHeadline: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  articleSnippet: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  articleSource: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  articleDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
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
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
