/**
 * Article entity types for the Buzzy Today platform.
 * Represents the full article lifecycle from raw ingestion to permanent publication.
 *
 * @module @buzzy/shared/types/article
 */

import type { ArticleStatus, FirestoreTimestamp, ImageSource } from './common.types.js';

/** Open Graph metadata for SEO */
export interface OpenGraphTags {
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly url: string;
  readonly type: string;
  readonly siteName: string;
}

/** Twitter Card metadata for SEO */
export interface TwitterCardTags {
  readonly card: string;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly site: string;
}

/** Schema.org structured data for SEO */
export interface SchemaMarkup {
  readonly '@context': string;
  readonly '@type': string;
  readonly headline: string;
  readonly description: string;
  readonly image: string;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly author: {
    readonly '@type': string;
    readonly name: string;
  };
  readonly publisher: {
    readonly '@type': string;
    readonly name: string;
  };
}

/** Core article record stored in Firestore `articles` collection */
export interface Article {
  readonly id: string;
  readonly status: ArticleStatus;

  /** Source data from RSS ingestion */
  readonly sourceTitle: string;
  readonly sourceContent: string;
  readonly sourceUrl: string;
  readonly sourcePublisher: string;
  readonly sourcePublishedAt: FirestoreTimestamp;
  readonly sourceImageUrl?: string;
  readonly rssFeedUrl: string;

  /** Classification */
  readonly sectionName: string;
  readonly categoryTagId: string;
  readonly categoryTagName: string;
  readonly categoryColor: string;
  readonly topicTagIds: string[];
  readonly topicTagNames: string[];
  readonly seoTags: string[];

  /** AI-generated summary */
  readonly aiHeadline: string;
  readonly tldr: string;
  readonly keyTakeaways: string[];
  readonly buzzyTake?: string;
  readonly snappySentence: string;
  readonly metaDescription: string;
  readonly seoKeywords: string[];

  /** Scoring */
  readonly candidateScore: number;
  readonly buzzwordScore: number;
  readonly engagementScore: number;
  readonly permanentArticlePoints: number;

  /** Engagement counters */
  readonly viewCount: number;
  readonly likeCount: number;
  readonly commentCount: number;
  readonly shareCount: number;

  /** Image */
  readonly imageUrl: string;
  readonly imageSource: ImageSource;

  /** SEO (for Permanent Articles) */
  readonly slug?: string;
  readonly permalink?: string;
  readonly schemaMarkup?: SchemaMarkup;
  readonly openGraphTags?: OpenGraphTags;
  readonly twitterCardTags?: TwitterCardTags;

  /** Location/dateline */
  readonly location?: string;
  readonly dateline?: string;

  /** Metadata */
  readonly contentHash: string;
  readonly summarizationModel: string;
  readonly createdAt: FirestoreTimestamp;
  readonly publishedAt?: FirestoreTimestamp;
  readonly promotedAt?: FirestoreTimestamp;
}
