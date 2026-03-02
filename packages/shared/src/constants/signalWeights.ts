/**
 * Signal weights for the User Interest Graph.
 * Each user action contributes a weighted value to topic/category tag scores.
 *
 * @see MVVVP User Interest Graph — Weighting Model
 */

export const SIGNAL_WEIGHTS = {
  impression: 0,
  click: 1,
  tap: 2,
  scroll: 3,
  like: 5,
  comment: 8,
  share: 10,
  follow_topic: 20,
  follow_category: 15,
} as const;

export type SignalWeightKey = keyof typeof SIGNAL_WEIGHTS;
