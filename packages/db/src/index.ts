/**
 * @buzzy/db — Firestore database configuration, collections, and seed utilities.
 *
 * This package defines collection names, provides Firestore initialization helpers,
 * and contains seed data for bootstrapping the database.
 *
 * @module @buzzy/db
 */

/** Firestore collection name constants */
export const COLLECTIONS = {
  USERS: 'users',
  ARTICLES: 'articles',
  TOPIC_TAGS: 'topic_tags',
  CATEGORY_TAGS: 'category_tags',
  RSS_SOURCES: 'rss_sources',
  SIGNALS: 'signals',
  SUGGESTED_TAGS: 'suggested_tags',
  BUZZWORDS: 'buzzwords',
  DAILY_DIGESTS: 'daily_digests',
  USER_REPORTS: 'user_reports',
  AI_CONFIG: 'ai_config',
  PUBLISHING_QUOTAS: 'publishing_quotas',
} as const;

/** Subcollection name constants */
export const SUBCOLLECTIONS = {
  BOOKMARKS: 'bookmarks',
  FOLLOWED_TAGS: 'followed_tags',
  FOLLOWED_CATEGORIES: 'followed_categories',
  INTEREST_GRAPH: 'interest_graph',
  COMMENTS: 'comments',
} as const;
