import { describe, it, expect } from 'vitest';
import { formatDateline } from './dateline.js';

describe('formatDateline', () => {
  it('formats with location in AP style', () => {
    const date = new Date(2026, 0, 20, 11, 12); // Jan 20, 2026, 11:12 AM
    expect(formatDateline('New York', date)).toBe('(NEW YORK) \u2014 Jan. 20, 2026, 11:12 a.m. ET');
  });

  it('formats without location', () => {
    const date = new Date(2026, 0, 20, 15, 0); // Jan 20, 2026, 3:00 PM
    expect(formatDateline(null, date)).toBe('Jan. 20, 2026, 3 p.m. ET');
  });

  it('handles midnight', () => {
    const date = new Date(2026, 2, 1, 0, 0); // March 1, 2026, midnight
    expect(formatDateline(null, date)).toBe('March 1, 2026, 12 a.m. ET');
  });

  it('handles noon', () => {
    const date = new Date(2026, 2, 1, 12, 0); // March 1, 2026, noon
    expect(formatDateline(null, date)).toBe('March 1, 2026, 12 p.m. ET');
  });

  it('uppercases location', () => {
    const date = new Date(2026, 5, 15, 9, 30);
    expect(formatDateline('san francisco', date)).toBe('(SAN FRANCISCO) \u2014 June 15, 2026, 9:30 a.m. ET');
  });

  it('supports custom timezone', () => {
    const date = new Date(2026, 0, 20, 11, 12);
    expect(formatDateline('Chicago', date, 'CT')).toBe('(CHICAGO) \u2014 Jan. 20, 2026, 11:12 a.m. CT');
  });
});
