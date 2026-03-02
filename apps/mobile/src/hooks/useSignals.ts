/**
 * Hook for recording user engagement signals.
 * Batches signals and sends them periodically to avoid excessive API calls.
 *
 * @module @buzzy/mobile/hooks/useSignals
 */

import { useCallback, useRef } from 'react';
import { recordSignals } from '../services/api';

interface PendingSignal {
  userId: string;
  articleId: string;
  signalType: string;
  categoryTagId: string;
  topicTagIds?: string[];
  value?: number;
}

/** Batch flush interval in milliseconds */
const FLUSH_INTERVAL_MS = 5000;

/** Maximum batch size before forced flush */
const MAX_BATCH_SIZE = 20;

/**
 * Hook that batches engagement signals and flushes them to the API.
 *
 * @param userId - The current user's ID
 * @returns Object with a `record` function to queue signals
 */
export function useSignals(userId: string) {
  const pendingRef = useRef<PendingSignal[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Flushes pending signals to the API.
   */
  const flush = useCallback(async () => {
    if (pendingRef.current.length === 0) return;

    const batch = [...pendingRef.current];
    pendingRef.current = [];

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      await recordSignals(batch);
    } catch {
      // Silently drop failed signals — they're non-critical
    }
  }, []);

  /**
   * Schedules a flush if one isn't already pending.
   */
  const scheduleFlush = useCallback(() => {
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        void flush();
      }, FLUSH_INTERVAL_MS);
    }
  }, [flush]);

  /**
   * Records an engagement signal.
   *
   * @param articleId - Article being engaged with
   * @param signalType - Type of engagement
   * @param categoryTagId - Category of the article
   * @param topicTagIds - Topic tags on the article
   * @param value - Optional signal value
   */
  const record = useCallback(
    (
      articleId: string,
      signalType: string,
      categoryTagId: string,
      topicTagIds?: string[],
      value?: number,
    ) => {
      pendingRef.current.push({
        userId,
        articleId,
        signalType,
        categoryTagId,
        topicTagIds,
        value,
      });

      if (pendingRef.current.length >= MAX_BATCH_SIZE) {
        void flush();
      } else {
        scheduleFlush();
      }
    },
    [userId, flush, scheduleFlush],
  );

  return { record, flush };
}
