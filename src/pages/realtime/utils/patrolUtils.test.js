import { getLatestPatrolLocation, getPatrolStatus } from './patrolUtils';

describe('patrol utilities', () => {
  test('extracts newest location from nested date/time records with lowercase coordinates', () => {
    const latest = getLatestPatrolLocation({
      '2025-01-02': {
        '18:41:00': { lat: '-6.79979', long: '39.28283' },
        '17:30:00': { lat: '-6.8', long: '39.28' },
      },
      '2024-12-31': {
        '09:15:00': { lat: '-6.81', long: '39.27' },
      },
    });

    expect(latest.location).toEqual({ Lat: -6.79979, Lng: 39.28283 });
    expect(latest.timestamp).toBe(Date.UTC(2025, 0, 2, 18, 41));
    expect(latest.date).toBe(new Date(latest.timestamp).toLocaleDateString());
    expect(latest.time).toBe(new Date(latest.timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }));
  });

  test('finds date and time keys even when a nested node appears between them', () => {
    const latest = getLatestPatrolLocation({
      '2025-01-02': {
        locationFix: {
          '18:41:00': { lat: '-6.79979', long: '39.28283' },
        },
      },
    });

    expect(latest.timestamp).toBe(Date.UTC(2025, 0, 2, 18, 41));
    expect(latest.date).toBe(new Date(latest.timestamp).toLocaleDateString());
  });

  test('parses Firebase patrol date keys using underscores', () => {
    const latest = getLatestPatrolLocation({
      '2025_01_02': {
        '18:41:00': { lat: '-6.79979', long: '39.28283' },
      },
    });

    expect(latest.timestamp).toBe(Date.UTC(2025, 0, 2, 18, 41));
    expect(latest.date).toBe(new Date(latest.timestamp).toLocaleDateString());
    expect(latest.time).not.toBe('Time unavailable');
  });

  test('returns null when no valid coordinates exist', () => {
    expect(getLatestPatrolLocation({
      '2025-01-02': { '18:41:00': { lat: 99, long: 200 } },
    })).toBeNull();
    expect(getLatestPatrolLocation(null)).toBeNull();
  });

  test('labels patrol and active state from stored boolean fields', () => {
    expect(getPatrolStatus({ on_patrol: false, active: 'false' })).toBe('Off patrol');
    expect(getPatrolStatus({ on_patrol: true })).toBe('On patrol');
    expect(getPatrolStatus({ active: 'true' })).toBe('Active');
    expect(getPatrolStatus({})).toBe('Status unavailable');
  });
});
