/**
 * Theme constants for the Buzzy Today mobile app.
 * Category colors from the Categories Master spreadsheet.
 *
 * @module @buzzy/mobile/utils/theme
 */

export const colors = {
  primary: '#3C82F6',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',

  /** Category colors from spreadsheet */
  category: {
    tech: '#3C82F6',
    science: '#10B981',
    health: '#8554F6',
    politics: '#EF4444',
    business: '#F59E0B',
    entertainment: '#EC4899',
    sports: '#F97316',
    world: '#06B6D4',
    lifestyle: '#14B8A6',
    environment: '#22C55E',
    education: '#6366F1',
  } as Record<string, string>,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  headline: 24,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;
