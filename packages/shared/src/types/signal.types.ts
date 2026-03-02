/**
 * Signal entity types for the Buzzy Today platform.
 * Signals are user engagement events that feed the interest graph and ranking.
 *
 * @module @buzzy/shared/types/signal
 */

import type { FirestoreTimestamp, SignalType } from './common.types.js';

/** Engagement signal stored in Firestore `signals` collection */
export interface Signal {
  readonly id: string;
  readonly userId: string;
  readonly articleId: string;
  readonly signalType: SignalType;
  readonly value?: number;
  readonly weight: number;
  readonly topicTagIds: string[];
  readonly categoryTagId: string;
  readonly timestamp: FirestoreTimestamp;
}
