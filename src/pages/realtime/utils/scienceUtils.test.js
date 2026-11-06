import {
  calculateMinimumConvexPolygonAreaKm2,
  calculateMovement,
  detectMovementOutliers,
  extractLocationHistory,
  getHealthSeries,
  getLocationFreshness,
  makeCsvExport,
  makeGeoJsonExport,
} from './scienceUtils';

describe('science utilities', () => {
  test('extracts chronologically sorted observations and sensor fields from nested location data', () => {
    const history = extractLocationHistory({
      '2024-08-21': {
        '13:37': { Lat: -1.945102, Long: 34.16392, temperature: 35.8 },
        '13:32': { Lat: -1.945002, Long: 34.16382, heart_rate: 64, satellites: 5 },
      },
      'bad-date': {
        latest: { Lat: -1, Long: 34 },
      },
      invalid: { Lat: 91, Long: 181 },
    });

    expect(history).toHaveLength(3);
    expect(history[0].timestamp).toBeLessThan(history[1].timestamp);
    expect(history[0].heartRate).toBe(64);
    expect(history[0].satellites).toBe(5);
    expect(history[2].timestamp).toBeNull();
  });

  test('interprets numeric-string timestamps as Unix milliseconds', () => {
    const timestamp = 1724247420000;
    const [point] = extractLocationHistory({
      fix: { Lat: -1, Long: 34, timestamp: String(timestamp) },
    });

    expect(point.timestamp).toBe(timestamp);
  });

  test('parses nested date keys that use underscores', () => {
    const [point] = extractLocationHistory({
      '2025_01_02': {
        '18:41:00': { lat: -6.79979, long: 39.28283 },
      },
    });

    expect(point.timestamp).toBe(Date.UTC(2025, 0, 2, 18, 41));
  });

  test('calculates distance and speed only from timestamped observations', () => {
    const movement = calculateMovement([
      { latitude: 0, longitude: 0, timestamp: Date.UTC(2024, 0, 1) },
      { latitude: 0, longitude: 0.01, timestamp: Date.UTC(2024, 0, 1, 1) },
      { latitude: 0, longitude: 0.02, timestamp: null },
    ]);

    expect(movement.distanceKm).toBeCloseTo(1.11195, 3);
    expect(movement.averageKph).toBeCloseTo(1.11195, 3);
    expect(movement.timedFixes).toBe(2);
    expect(movement.segments).toHaveLength(1);
  });

  test('estimates minimum convex polygon area for non-collinear fixes only', () => {
    const points = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0.01 },
      { latitude: 0.01, longitude: 0.01 },
      { latitude: 0.01, longitude: 0 },
    ];

    expect(calculateMinimumConvexPolygonAreaKm2(points)).toBeGreaterThan(1);
    expect(calculateMinimumConvexPolygonAreaKm2(points.slice(0, 2))).toBeNull();
    expect(calculateMinimumConvexPolygonAreaKm2([
      points[0],
      points[1],
      { latitude: 0, longitude: 0.02 },
    ])).toBeNull();
  });

  test('does not flag movement until the minimum baseline sample exists', () => {
    expect(detectMovementOutliers(Array(4).fill({ speedKph: 1 }))).toEqual([]);
    const segments = [
      ...Array(5).fill({ speedKph: 1 }),
      { speedKph: 10 },
    ];
    expect(detectMovementOutliers(segments)).toHaveLength(1);
  });

  test('omits zero and untimestamped health readings and reports location freshness', () => {
    const series = getHealthSeries([
      { timestamp: 1, temperature: 35.4 },
      { timestamp: 2, temperature: 0 },
      { timestamp: null, temperature: 35.6 },
    ], 'temperature');

    expect(series).toEqual([{ timestamp: 1, value: 35.4 }]);
    expect(getLocationFreshness({ timestamp: 0 }, 30 * 60 * 1000).state).toBe('fresh');
    expect(getLocationFreshness({ timestamp: 0 }, 2 * 60 * 60 * 1000).state).toBe('aging');
    expect(getLocationFreshness({ timestamp: 0 }, 2 * 24 * 60 * 60 * 1000).state).toBe('stale');
    expect(getLocationFreshness({ timestamp: null }).state).toBe('unknown');
  });

  test('exports observations with units in CSV and GeoJSON formats', () => {
    const animals = [{
      id: 'elephant-1',
      name: 'Elephant 1',
      species: 'Elephants',
      history: [{
        latitude: -1.9,
        longitude: 34.1,
        timestamp: Date.UTC(2024, 0, 1),
        activity: 'walking',
        temperature: 35.5,
        heartRate: 58,
        satellites: 6,
        altitude: 120,
        recordedSpeedKnots: 1.2,
      }],
    }];
    const csv = makeCsvExport(animals);
    const geoJson = makeGeoJsonExport(animals);

    expect(csv).toContain('temperature_c');
    expect(csv).toContain('heart_rate_bpm');
    expect(geoJson.features[0].geometry.coordinates).toEqual([34.1, -1.9]);
    expect(geoJson.features[0].properties.timestamp_utc).toBe('2024-01-01T00:00:00.000Z');
  });

  test('escapes commas and quotes in CSV fields', () => {
    const csv = makeCsvExport([{
      id: 'elephant-1',
      name: 'Elephant, "One"',
      species: 'Elephants',
      history: [{
        latitude: -1,
        longitude: 34,
        timestamp: null,
      }],
    }]);

    expect(csv).toContain('"Elephant, ""One"""');
  });
});
