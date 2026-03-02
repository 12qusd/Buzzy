/**
 * StoryCard component for the Buzzy Today feed.
 * Full-screen card displaying headline, TL;DR, key takeaways, buzzy take,
 * topic tags, source attribution, and dateline.
 *
 * Uses progressive disclosure:
 * - Headline frames the story
 * - TL;DR explains what happened and why
 * - Key takeaways lock in understanding
 *
 * @module @buzzy/mobile/components/StoryCard
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  type ViewStyle,
} from 'react-native';
import { type ArticleFeedItem } from '../services/api';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';
import { TopicTagChip } from './TopicTagChip';
import { EngagementBar } from './EngagementBar';

interface StoryCardProps {
  /** The article data to display */
  article: ArticleFeedItem;
  /** Callback when the source link is tapped */
  onSourcePress: (url: string) => void;
  /** Callback when a topic tag chip is tapped */
  onTagPress: (tagSlug: string) => void;
  /** Callback when the like button is pressed */
  onLike: () => void;
  /** Callback when the share button is pressed */
  onShare: () => void;
  /** Callback when the bookmark button is pressed */
  onBookmark: () => void;
}

/**
 * Full-screen story card for the vertical swipe feed.
 *
 * @param props - StoryCard props
 */
export function StoryCard({
  article,
  onSourcePress,
  onTagPress,
  onLike,
  onShare,
  onBookmark,
}: StoryCardProps) {
  const categoryColor = article.categoryTag.color || colors.primary;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {article.imageUrl && (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        {/* Category badge */}
        <View style={styles.categoryRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{article.categoryTag.name}</Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>{article.headline}</Text>

        {/* Dateline */}
        <Text style={styles.dateline}>{article.dateline}</Text>

        {/* TL;DR */}
        <View style={[styles.tldrContainer, { borderLeftColor: categoryColor }]}>
          <Text style={styles.tldrLabel}>TL;DR</Text>
          <Text style={styles.tldrText}>{article.tldr}</Text>
        </View>

        {/* Key Takeaways */}
        {article.keyTakeaways.length > 0 && (
          <View style={styles.takeawaysContainer}>
            {article.keyTakeaways.map((takeaway, index) => (
              <View key={index} style={styles.takeawayRow}>
                <View style={[styles.takeawayBullet, { backgroundColor: categoryColor }]} />
                <Text style={styles.takeawayText}>{takeaway}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Buzzy Take */}
        {article.buzzyTake && (
          <View style={styles.buzzyTakeContainer}>
            <Text style={styles.buzzyTakeLabel}>Buzzy Take</Text>
            <Text style={styles.buzzyTakeText}>{article.buzzyTake}</Text>
          </View>
        )}

        {/* Topic Tags */}
        <View style={styles.tagsRow}>
          {article.topicTags.map((tag) => (
            <TopicTagChip
              key={tag.id}
              tag={tag}
              onPress={() => onTagPress(tag.slug)}
            />
          ))}
        </View>

        {/* Source attribution */}
        <Pressable
          style={styles.sourceRow}
          onPress={() => onSourcePress(article.sourceUrl)}
        >
          <Text style={styles.sourceLabel}>Source: </Text>
          <Text style={styles.sourceLink}>{article.sourcePublisher}</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom engagement bar */}
      <EngagementBar
        isBookmarked={article.isBookmarked}
        onLike={onLike}
        onShare={onShare}
        onBookmark={onBookmark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } satisfies ViewStyle,
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: fontSize.headline,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    lineHeight: 32,
  },
  dateline: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    fontStyle: 'italic',
  },
  tldrContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
  },
  tldrLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  tldrText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  takeawaysContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  takeawayBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  takeawayText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },
  buzzyTakeContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  buzzyTakeLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  buzzyTakeText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  sourceRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  sourceLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sourceLink: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
});
