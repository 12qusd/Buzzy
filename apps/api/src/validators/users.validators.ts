/**
 * Zod validation schemas for user API endpoints.
 *
 * @module @buzzy/api/validators/users
 */

import { z } from 'zod';

/** Schema for user profile update */
export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

/** Schema for onboarding completion */
export const onboardingSchema = z.object({
  followedTagIds: z.array(z.string().min(1)).min(3, 'Must follow at least 3 tags'),
  followedCategoryIds: z.array(z.string().min(1)).optional(),
  notificationPreferences: z.object({
    pushEnabled: z.boolean().default(true),
    emailEnabled: z.boolean().default(true),
    dailyDigestEnabled: z.boolean().default(true),
  }).optional(),
});

/** Schema for submitting user feedback */
export const feedbackSchema = z.object({
  type: z.enum(['report_article', 'report_comment', 'improvement_general']),
  targetId: z.string().optional(),
  targetType: z.enum(['article', 'comment', 'none']).optional(),
  reason: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
