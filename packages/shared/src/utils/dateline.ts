/**
 * AP-style dateline formatting utilities.
 * Formats location + timestamp as: (NEW YORK) — Jan. 20, 2026, 11:12 a.m. ET
 *
 * @module @buzzy/shared/utils/dateline
 */

/** Abbreviated month names per AP style */
const AP_MONTHS = [
  'Jan.', 'Feb.', 'March', 'April', 'May', 'June',
  'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
] as const;

/**
 * Formats a time value to AP style (e.g., "11:12 a.m." or "3 p.m.").
 *
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @returns AP-formatted time string
 */
function formatAPTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'p.m.' : 'a.m.';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  if (minutes === 0) {
    return `${displayHour} ${period}`;
  }
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generates an AP-style dateline string.
 *
 * @param location - City/state location (will be uppercased). Pass null for no location.
 * @param date - The publication date
 * @param timezone - Timezone abbreviation (default "ET")
 * @returns Formatted dateline string
 *
 * @example
 * ```ts
 * formatDateline('New York', new Date('2026-01-20T11:12:00'))
 * // '(NEW YORK) — Jan. 20, 2026, 11:12 a.m. ET'
 *
 * formatDateline(null, new Date('2026-01-20T15:00:00'))
 * // 'Jan. 20, 2026, 3 p.m. ET'
 * ```
 */
export function formatDateline(
  location: string | null,
  date: Date,
  timezone: string = 'ET'
): string {
  const month = AP_MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const time = formatAPTime(date.getHours(), date.getMinutes());

  const dateTimePart = `${month} ${day}, ${year}, ${time} ${timezone}`;

  if (location) {
    return `(${location.toUpperCase()}) \u2014 ${dateTimePart}`;
  }
  return dateTimePart;
}
