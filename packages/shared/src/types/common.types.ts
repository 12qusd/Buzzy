/**
 * Common types used across the Buzzy Today platform.
 * These are shared primitives and utility types referenced by all entity types.
 *
 * @module @buzzy/shared/types/common
 */

/** Firestore Timestamp representation for cross-platform compatibility */
export interface FirestoreTimestamp {
  readonly seconds: number;
  readonly nanoseconds: number;
}

/** Article lifecycle status */
export type ArticleStatus = 'raw' | 'potential_candidate' | 'candidate' | 'permanent';

/** Image source priority tier */
export type ImageSource = 'original' | 'buzzy_bank' | 'pixabay';

/** Suggested tag review status */
export type SuggestedTagStatus = 'pending' | 'approved' | 'rejected';

/** User report type */
export type UserReportType = 'report_article' | 'report_comment' | 'improvement_general';

/** User report target type */
export type UserReportTargetType = 'article' | 'comment' | 'none';

/** Signal types for user engagement tracking */
export type SignalType =
  | 'impression'
  | 'click'
  | 'tap'
  | 'scroll'
  | 'like'
  | 'comment'
  | 'share'
  | 'bookmark'
  | 'source_click'
  | 'follow_tag'
  | 'follow_category';

/** Notification preference level */
export type NotificationLevel = 'off' | 'daily' | 'immediate';

/** Topic Tag type classification — the "bucket" a tag lives in */
export type TopicTagType =
  | 'Person'
  | 'Organization'
  | 'SportsTeam'
  | 'Brand'
  | 'Product'
  | 'Feature'
  | 'Platform'
  | 'Law'
  | 'RecurringEvent'
  | 'NotableEvent'
  | 'Transaction'
  | 'Concept'
  | 'Technology'
  | 'Trend'
  | 'Metric'
  | 'RiskFactor'
  | 'Place'
  | 'FinancialInstrument'
  | 'LegalAndCourt'
  | 'MediaAndCreative'
  | 'Academic'
  | 'Ailment'
  | 'Treatment'
  | 'Location'
  | 'CryptoName'
  | 'CryptoTicker'
  | 'FiatCurrency'
  | 'PublicCompanyTicker'
  | 'Company'
  | 'NonProfit'
  | 'GovernmentAgency'
  | 'CourtCase'
  | 'Index'
  | 'PoliticalFigure'
  | 'Celebrity'
  | 'Athlete'
  | 'Musician'
  | 'Actor'
  | 'Composer'
  | 'ScientificTerm'
  | 'Conference'
  | 'Industry'
  | 'Protocol'
  | 'Song'
  | 'MediaTitle'
  | 'Book'
  | 'Movie'
  | 'TVShow'
  | 'ArtisticGenre'
  | 'Award'
  | 'HistoricalEvent';
