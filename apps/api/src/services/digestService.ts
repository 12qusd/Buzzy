/**
 * Digest service for the Buzzy Today API.
 * Handles retrieval of daily digest documents from Firestore.
 * Digest generation is handled by the notifications service (services/notifications).
 *
 * @module @buzzy/api/services/digestService
 */

import { logger } from '../logger.js';

/** Daily digest as returned from the API */
export interface DigestDTO {
  id: string;
  date: string;
  url: string;
  whatsNarrative: string;
  top5Stories: Array<{
    articleId: string;
    headline: string;
    whyItBlewUp: string;
    categoryName: string;
    categoryColor: string;
    thumbnailUrl: string;
  }>;
  whatPeopleAreSaying: string[];
  byCategory: Array<{
    categoryName: string;
    summary: string;
    articleId: string;
  }>;
  buzzyMoment: string;
  whyThisMatters: string;
  generatedAt: string;
  isPublic: boolean;
}

/**
 * Fetches the latest published daily digest.
 *
 * @returns Latest digest or null if none exists
 */
export async function getLatestDigest(): Promise<DigestDTO | null> {
  logger.info('Fetching latest digest');

  // TODO: Firestore query
  // const snapshot = await db.collection('daily_digests')
  //   .where('isPublic', '==', true)
  //   .orderBy('date', 'desc')
  //   .limit(1)
  //   .get();
  // if (snapshot.empty) return null;
  // return mapDigestDoc(snapshot.docs[0]);

  return null;
}

/**
 * Fetches a daily digest by date.
 *
 * @param date - Date in YYYY-MM-DD format
 * @returns Digest for the given date or null
 */
export async function getDigestByDate(date: string): Promise<DigestDTO | null> {
  logger.info('Fetching digest by date', { date });

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    logger.warn('Invalid date format for digest', { date });
    return null;
  }

  // TODO: Firestore read
  // The digest ID is the date string (e.g., "2026-03-01")
  // const doc = await db.collection('daily_digests').doc(date).get();
  // if (!doc.exists) return null;
  // return mapDigestDoc(doc);

  return null;
}
