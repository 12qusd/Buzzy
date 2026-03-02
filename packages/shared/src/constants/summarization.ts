/**
 * AI summarization global configuration.
 * Default model, word limits, and keyword counts from the Article Sourcing spreadsheet.
 *
 * @see Article Sourcing & Summarization System — MAIN sheet
 */

export const SUMMARIZATION_CONFIG = {
  model: 'gpt-5-nano',
  numSeoKeywords: 7,
  tldrWordsMin: 12,
  tldrWordsMax: 26,
  takeawaysWordsMin: 21,
  takeawaysWordsMax: 30,
  numKeyTakeaways: 3,
  numTopicTags: 2,
} as const;
