/**
 * Zod validation schemas for admin API endpoints.
 * Used by the admin route handlers for request validation.
 *
 * @module @buzzy/api/validators/admin
 */

import { z } from 'zod';

/** Schema for adding a new RSS source */
export const addRssSourceSchema = z.object({
  channelName: z.string().min(1).max(200),
  publisherName: z.string().min(1).max(200),
  feedUrl: z.string().url(),
  assignedCategoryId: z.string().optional(),
  tagBasedClassification: z.boolean().default(true),
});

/** Schema for approving a suggested tag */
export const approveTagSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bucketId: z.string().optional(),
  tagType: z.string().optional(),
  categoryId: z.string().optional(),
});

/** Schema for rejecting a suggested tag */
export const rejectTagSchema = z.object({
  reason: z.string().max(500).optional(),
});

/** Schema for updating a publishing quota */
export const updateQuotaSchema = z.object({
  dailyLimit: z.number().int().min(0).max(1000),
  randomInjectionPercent: z.number().min(0).max(100).optional(),
});

/** Schema for updating AI summarization config */
export const updateSummarizationConfigSchema = z.object({
  tone: z.string().max(100).optional(),
  headlineGuide: z.string().max(500).optional(),
  readingLevel: z.string().max(50).optional(),
  hedgeLevel: z.string().max(50).optional(),
  buzzyTakeStyle: z.string().max(200).optional(),
  emojisAllowed: z.boolean().optional(),
  fallbackImageUrls: z.array(z.string().url()).optional(),
});

export type AddRssSourceInput = z.infer<typeof addRssSourceSchema>;
export type ApproveTagInput = z.infer<typeof approveTagSchema>;
export type RejectTagInput = z.infer<typeof rejectTagSchema>;
export type UpdateQuotaInput = z.infer<typeof updateQuotaSchema>;
export type UpdateSummarizationConfigInput = z.infer<typeof updateSummarizationConfigSchema>;
