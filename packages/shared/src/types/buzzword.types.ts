/**
 * Buzzword entity types for the Buzzy Today platform.
 * Buzzwords are internal scoring signals used to boost article ranking.
 *
 * @module @buzzy/shared/types/buzzword
 */

import type { FirestoreTimestamp } from './common.types.js';

/** Buzzword stored in Firestore `buzzwords` collection */
export interface Buzzword {
  readonly id: string;
  readonly term: string;
  readonly isActive: boolean;
  readonly createdAt: FirestoreTimestamp;
}
