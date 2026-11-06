import { getReportDateTime, getReportTimestamp } from './reportDateUtils';

describe('getReportDateTime', () => {
  test('formats Firebase day and time fields', () => {
    const result = getReportDateTime({ day: '2024-08-26', time: '19:45' });
    const expectedDate = new Date(2024, 7, 26).toLocaleDateString();
    const expectedTime = new Date(2000, 0, 1, 19, 45).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    expect(result).toEqual({ date: expectedDate, time: expectedTime });
  });

  test('prefers a valid timestamp when present', () => {
    const timestamp = Date.UTC(2024, 7, 26, 19, 45);

    expect(getReportDateTime({ timestamp, day: 'invalid', time: 'bad' })).toEqual({
      date: new Date(timestamp).toLocaleDateString(),
      time: new Date(timestamp).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    });
  });

  describe('getReportTimestamp', () => {
    test('combines Firebase day and time fields into a local timestamp', () => {
      const timestamp = getReportTimestamp({ day: '2024-08-26', time: '7:45 PM' });

      expect(timestamp).toBe(new Date(2024, 7, 26, 19, 45).getTime());
    });

    test('prefers an explicit timestamp', () => {
      const timestamp = Date.UTC(2024, 7, 26, 19, 45);

      expect(getReportTimestamp({ timestamp, day: 'invalid', time: 'bad' })).toBe(timestamp);
    });

    test('returns null when report date or time is invalid', () => {
      expect(getReportTimestamp({ day: '2024-02-31', time: '25:90' })).toBeNull();
      expect(getReportTimestamp({ day: '2024-08-26' })).toBeNull();
    });
  });

  test('handles numeric timestamp strings and missing values without invalid dates', () => {
    expect(getReportDateTime({ timestamp: '1724701500000' }).date).not.toBe('Invalid Date');
    expect(getReportDateTime({})).toEqual({
      date: 'Date unavailable',
      time: 'Time unavailable',
    });
  });

  test('rejects impossible calendar dates and malformed times', () => {
    expect(getReportDateTime({ day: '2024-02-31', time: '25:90' })).toEqual({
      date: 'Date unavailable',
      time: 'Time unavailable',
    });
  });
});
