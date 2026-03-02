/**
 * Barrel export for all Buzzy Today entity types.
 *
 * @module @buzzy/shared/types
 */

export type {
  FirestoreTimestamp,
  ArticleStatus,
  ImageSource,
  SuggestedTagStatus,
  UserReportType,
  UserReportTargetType,
  SignalType,
  NotificationLevel,
  TopicTagType,
} from './common.types.js';

export type {
  User,
  NotificationPreferences,
  UserBookmark,
  FollowedTag,
  FollowedCategory,
  InterestGraphEntry,
} from './user.types.js';

export type {
  Article,
  OpenGraphTags,
  TwitterCardTags,
  SchemaMarkup,
} from './article.types.js';

export type { TopicTag } from './topicTag.types.js';

export type {
  CategoryTag,
  SummarizationConfig,
} from './categoryTag.types.js';

export type {
  RssSource,
  FeedStructure,
} from './rssSource.types.js';

export type { Signal } from './signal.types.js';

export type { SuggestedTag } from './suggestedTag.types.js';

export type { Buzzword } from './buzzword.types.js';

export type {
  DailyDigest,
  DigestTopStory,
  DigestCategorySummary,
} from './dailyDigest.types.js';

export type { UserReport } from './userReport.types.js';

export type { Comment } from './comment.types.js';
