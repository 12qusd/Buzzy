/**
 * Tag service for the Buzzy Today API.
 * Handles tag search (prefix + fuzzy), trending tags, and follow/unfollow logic.
 *
 * @module @buzzy/api/services/tagService
 */

import { logger } from '../logger.js';

/** Tag search result item */
export interface TagSearchResult {
  id: string;
  displayName: string;
  canonicalName: string;
  slug: string;
  topicTagType: string;
  categoryId: string;
  categoryName: string;
  followerCount: number;
  articleCount: number;
  isFollowed: boolean;
}

/** Tag detail for the tag page */
export interface TagDetail {
  id: string;
  displayName: string;
  canonicalName: string;
  slug: string;
  topicTagType: string;
  categoryId: string;
  categoryName: string;
  bucketId: string;
  bucketName: string;
  description: string | null;
  synonyms: string[];
  followerCount: number;
  articleCount: number;
  relatedTagIds: string[];
  isFollowed: boolean;
}

/**
 * Searches tags by prefix matching on canonicalName.
 * Firestore doesn't support native fuzzy search, so we use:
 * 1. Prefix match on canonicalName (>= query, < query + '\uf8ff')
 * 2. Client-side fuzzy filtering for substring matches
 *
 * @param query - Search query string
 * @param limit - Maximum results to return
 * @param userId - Optional user ID to check follow status
 * @returns Array of matching tags
 */
export async function searchTags(
  query: string,
  limit: number = 20,
  userId?: string,
): Promise<TagSearchResult[]> {
  const normalizedQuery = query.toLowerCase().trim();
  logger.info('Searching tags', { query: normalizedQuery, limit, hasUser: !!userId });

  // TODO: Firestore query
  // const tagsRef = db.collection('topic_tags')
  //   .where('canonicalName', '>=', normalizedQuery)
  //   .where('canonicalName', '<', normalizedQuery + '\uf8ff')
  //   .where('isActive', '==', true)
  //   .orderBy('canonicalName')
  //   .orderBy('followerCount', 'desc')
  //   .limit(limit);

  return [];
}

/**
 * Fetches trending tags (most articles in last 24h).
 *
 * @param limit - Maximum results to return
 * @returns Array of trending tags
 */
export async function getTrendingTags(limit: number = 20): Promise<TagSearchResult[]> {
  logger.info('Fetching trending tags', { limit });

  // TODO: Firestore query ordered by articleCount DESC, filtered to active tags

  return [];
}

/**
 * Fetches tags belonging to a specific category.
 *
 * @param categoryId - Category ID to filter by
 * @param limit - Maximum results to return
 * @returns Array of tags in the category
 */
export async function getTagsByCategory(
  categoryId: string,
  limit: number = 50,
): Promise<TagSearchResult[]> {
  logger.info('Fetching tags by category', { categoryId, limit });

  // TODO: Firestore query
  // db.collection('topic_tags')
  //   .where('categoryId', '==', categoryId)
  //   .where('isActive', '==', true)
  //   .orderBy('followerCount', 'desc')
  //   .limit(limit)

  return [];
}

/**
 * Fetches a single tag by its slug.
 * If the slug matches a synonym, returns the canonical tag for a redirect.
 *
 * @param slug - Tag slug to look up
 * @param userId - Optional user ID to check follow status
 * @returns Tag detail or null with optional redirect slug
 */
export async function getTagBySlug(
  slug: string,
  userId?: string,
): Promise<{ tag: TagDetail | null; redirectSlug: string | null }> {
  logger.info('Fetching tag by slug', { slug, hasUser: !!userId });

  // TODO: Firestore query
  // 1. Query topic_tags where slug == slug
  // 2. If not found, check synonyms array contains slug
  // 3. If synonym match, return redirectSlug for 301

  return { tag: null, redirectSlug: null };
}

/**
 * Toggles follow status for a tag.
 * Updates the user's followed_tags subcollection and the tag's followerCount.
 *
 * @param tagId - Tag to follow/unfollow
 * @param userId - User performing the action
 * @param following - Whether to follow (true) or unfollow (false)
 * @returns Updated follow status
 */
export async function toggleTagFollow(
  tagId: string,
  userId: string,
  following: boolean,
): Promise<{ following: boolean; followerCount: number }> {
  logger.info('Toggling tag follow', { tagId, userId, following });

  // TODO: Firestore transaction:
  // 1. If following: create users/{userId}/followed_tags/{tagId}
  //    If unfollowing: delete users/{userId}/followed_tags/{tagId}
  // 2. Increment/decrement topic_tags/{tagId}.followerCount
  // 3. Record follow_tag signal for interest graph

  return { following, followerCount: 0 };
}
