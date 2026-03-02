/**
 * Content filtering / knockout rules for the ingestion pipeline.
 * Articles failing these checks are rejected before further processing.
 *
 * @see Buzzy Categories Master — Content Filtering sheet
 */

export const KNOCKOUT_RULES = {
  /** Minimum word count required for article to pass */
  minWordCount: 70,
  /** Whether a missing image triggers knockout */
  requireImage: true,
} as const;

/** Image size and aspect ratio criteria */
export const IMAGE_CRITERIA = {
  minWidth: 400,
  minHeight: 300,
  aspectRatioMin: 3 / 4,
  aspectRatioMax: 3 / 4.5,
} as const;

/** Tag matching scoring weights for categorization */
export const TAG_MATCH_WEIGHTS = {
  title: 5,
  description: 3,
  content: 1,
} as const;
