import { isWithinLastHour, ONE_HOUR_MS } from './locationFreshness';

describe('isWithinLastHour', () => {
  const now = 1_750_000_000_000;

  test('includes timestamps at the one-hour boundary and at the current time', () => {
    expect(isWithinLastHour(now - ONE_HOUR_MS, now)).toBe(true);
    expect(isWithinLastHour(now, now)).toBe(true);
  });

  test('excludes stale, future, and invalid timestamps', () => {
    expect(isWithinLastHour(now - ONE_HOUR_MS - 1, now)).toBe(false);
    expect(isWithinLastHour(now + 1, now)).toBe(false);
    expect(isWithinLastHour(null, now)).toBe(false);
    expect(isWithinLastHour(Number.NaN, now)).toBe(false);
  });
});
