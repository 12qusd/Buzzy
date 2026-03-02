/**
 * Zod validation schemas for signal API endpoints.
 *
 * @module @buzzy/api/validators/signals
 */

import { z } from 'zod';

const signalTypeEnum = z.enum([
  'impression',
  'click',
  'tap',
  'scroll',
  'like',
  'comment',
  'share',
  'bookmark',
  'source_click',
  'follow_tag',
  'follow_category',
]);

/** Schema for a single engagement signal */
export const signalSchema = z.object({
  userId: z.string().min(1),
  articleId: z.string().min(1),
  signalType: signalTypeEnum,
  value: z.number().optional(),
  topicTagIds: z.array(z.string()).default([]),
  categoryTagId: z.string().min(1),
});

/** Schema for batch signal recording */
export const batchSignalsSchema = z.object({
  signals: z.array(signalSchema).min(1).max(100),
});

export type SignalInput = z.infer<typeof signalSchema>;
export type BatchSignalsInput = z.infer<typeof batchSignalsSchema>;
