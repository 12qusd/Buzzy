/**
 * Category service for the Buzzy Today API.
 * Handles category listing, detail, and follow/unfollow.
 *
 * @module @buzzy/api/services/categoryService
 */

import { logger } from '../logger.js';

/** Category data for API responses */
export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  articleCount: number;
  followerCount: number;
  isFollowed: boolean;
}

/**
 * Fetches all active categories.
 *
 * @param userId - Optional user ID to check follow status
 * @returns Array of categories
 */
export async function getAllCategories(userId?: string): Promise<CategoryDTO[]> {
  logger.info('Fetching all categories', { hasUser: !!userId });
  // TODO: Query Firestore category_tags collection
  return [];
}

/**
 * Fetches a single category by slug.
 *
 * @param slug - Category slug
 * @param userId - Optional user ID to check follow status
 * @returns Category detail or null
 */
export async function getCategoryBySlug(
  slug: string,
  userId?: string,
): Promise<CategoryDTO | null> {
  logger.info('Fetching category by slug', { slug, hasUser: !!userId });
  // TODO: Query Firestore category_tags where slug == slug
  return null;
}

/**
 * Toggles follow status for a category.
 *
 * @param categoryId - Category to follow/unfollow
 * @param userId - User performing the action
 * @param following - Whether to follow (true) or unfollow (false)
 * @returns Updated follow status
 */
export async function toggleCategoryFollow(
  categoryId: string,
  userId: string,
  following: boolean,
): Promise<{ following: boolean; followerCount: number }> {
  logger.info('Toggling category follow', { categoryId, userId, following });

  // TODO: Firestore transaction:
  // 1. If following: create users/{userId}/followed_categories/{categoryId}
  //    If unfollowing: delete users/{userId}/followed_categories/{categoryId}
  // 2. Record follow_category signal for interest graph

  return { following, followerCount: 0 };
}
