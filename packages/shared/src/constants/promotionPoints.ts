/**
 * Permanent Article promotion point values.
 * Candidate Articles accumulate points from user engagement.
 * Articles crossing the threshold are promoted to Permanent status.
 *
 * @see MVVVP — Candidate Articles section
 */

export const PROMOTION_POINTS = {
  click: 1,
  comment: 5,
  share: 10,
  threshold: 10,
} as const;
