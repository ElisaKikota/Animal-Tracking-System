const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDateAndTime = (dateValue, timeValue) => {
  const dateMatch = String(dateValue || '').match(/^(\d{4})[-/_](\d{1,2})[-/_](\d{1,2})$/);
  if (!dateMatch) return null;

  const [, year, month, day] = dateMatch.map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const timeMatch = String(timeValue || '00:00:00').match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (!timeMatch) return null;

  const [, hours, minutes, seconds = '0'] = timeMatch;
  if (Number(hours) > 23 || Number(minutes) > 59 || Number(seconds) > 59) return null;

  const timestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds)
  );
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 ||
      date.getUTCDate() !== Number(day)) return null;
  return timestamp;
};

const getPointTimestamp = (point, path) => {
  const explicit = point.timestamp ?? point.updatedAt;
  if (explicit !== undefined && explicit !== null && explicit !== '') {
    let parsed;
    if (typeof explicit === 'number') {
      parsed = explicit < 1e11 ? explicit * 1000 : explicit;
    } else if (/^\d{10,13}$/.test(String(explicit))) {
      const numeric = Number(explicit);
      parsed = String(explicit).length === 10 ? numeric * 1000 : numeric;
    } else {
      parsed = Date.parse(explicit);
    }
    if (Number.isFinite(parsed) && Number.isFinite(new Date(parsed).getTime())) return parsed;
  }

  const pointDate = point.day ?? point.date ?? point.Date;
  const pointTime = point.time ?? point.Time;
  if (pointDate !== undefined) {
    const timestamp = parseDateAndTime(pointDate, pointTime);
    if (timestamp !== null) return timestamp;
  }

  for (let dateIndex = path.length - 1; dateIndex >= 0; dateIndex -= 1) {
    if (!/^\d{4}[-/_]\d{1,2}[-/_]\d{1,2}$/.test(String(path[dateIndex]))) continue;
    for (let timeIndex = dateIndex + 1; timeIndex < path.length; timeIndex += 1) {
      const timestamp = parseDateAndTime(path[dateIndex], path[timeIndex]);
      if (timestamp !== null) return timestamp;
    }
    const dateOnlyTimestamp = parseDateAndTime(path[dateIndex], '00:00:00');
    if (dateOnlyTimestamp !== null) return dateOnlyTimestamp;
  }
  return null;
};

const isCoordinatePoint = (value) => (
  value &&
  typeof value === 'object' &&
  parseNumericValue(value.Lat ?? value.lat ?? value.latitude) !== null &&
  parseNumericValue(value.Long ?? value.Lng ?? value.long ?? value.lon ?? value.longitude) !== null
);

export const extractLocationHistory = (locationData) => {
  const points = [];
  const visit = (value, path = []) => {
    if (!value || typeof value !== 'object') return;

    if (isCoordinatePoint(value)) {
      const latitude = parseNumericValue(value.Lat ?? value.lat ?? value.latitude);
      const longitude = parseNumericValue(value.Long ?? value.Lng ?? value.long ?? value.lon ?? value.longitude);
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return;

      points.push({
        latitude,
        longitude,
        timestamp: getPointTimestamp(value, path),
        activity: value.activity ?? null,
        temperature: parseNumericValue(value.temperature),
        heartRate: parseNumericValue(value.heart_rate ?? value.heartRate),
        satellites: parseNumericValue(value.satellites),
        altitude: parseNumericValue(value.altitude),
        recordedSpeedKnots: parseNumericValue(value.speed_knots ?? value.speedKnots),
      });
      return;
    }

    Object.entries(value).forEach(([key, nestedValue]) => visit(nestedValue, [...path, key]));
  };

  visit(locationData);
  return points
    .map((point, index) => ({ ...point, sourceIndex: index }))
    .sort((first, second) => {
      if (first.timestamp === null) return second.timestamp === null ? first.sourceIndex - second.sourceIndex : 1;
      if (second.timestamp === null) return -1;
      return first.timestamp - second.timestamp || first.sourceIndex - second.sourceIndex;
    })
    .map(({ sourceIndex, ...point }) => point);
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const distanceBetweenPointsKm = (first, second) => {
  const earthRadiusKm = 6371.0088;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(Math.min(1, haversine)));
};

export const calculateMovement = (points) => {
  const timedPoints = points.filter((point) => point.timestamp !== null);
  let distanceKm = 0;
  let observedDurationMs = 0;
  const segments = [];

  for (let index = 1; index < timedPoints.length; index += 1) {
    const previous = timedPoints[index - 1];
    const current = timedPoints[index];
    const durationMs = current.timestamp - previous.timestamp;
    if (durationMs <= 0) continue;

    const segmentDistanceKm = distanceBetweenPointsKm(previous, current);
    distanceKm += segmentDistanceKm;
    observedDurationMs += durationMs;

    if (durationMs <= 6 * 60 * 60 * 1000) {
      segments.push({
        distanceKm: segmentDistanceKm,
        durationHours: durationMs / (60 * 60 * 1000),
        speedKph: segmentDistanceKm / (durationMs / (60 * 60 * 1000)),
        from: previous,
        to: current,
      });
    }
  }

  const firstTimestamp = timedPoints[0]?.timestamp ?? null;
  const lastTimestamp = timedPoints[timedPoints.length - 1]?.timestamp ?? null;
  return {
    distanceKm,
    observedDurationHours: observedDurationMs / (60 * 60 * 1000),
    averageKph: observedDurationMs > 0
      ? distanceKm / (observedDurationMs / (60 * 60 * 1000))
      : null,
    timedFixes: timedPoints.length,
    segments,
    firstTimestamp,
    lastTimestamp,
  };
};

const median = (values) => {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const detectMovementOutliers = (segments) => {
  if (segments.length < 5) return [];
  const speeds = segments.map(({ speedKph }) => speedKph);
  const baselineMedian = median(speeds);
  const medianAbsoluteDeviation = median(speeds.map((speed) => Math.abs(speed - baselineMedian)));
  const threshold = baselineMedian + Math.max(3 * medianAbsoluteDeviation, baselineMedian * 0.5, 0.05);

  return segments.filter(({ speedKph }) => speedKph > threshold).map((segment) => ({
    ...segment,
    baselineMedian,
    threshold,
  }));
};

export const calculateMinimumConvexPolygonAreaKm2 = (points) => {
  const uniquePoints = [...new Map(
    points.map((point) => [`${point.longitude},${point.latitude}`, point])
  ).values()];
  if (uniquePoints.length < 3) return null;

  const meanLatitude = uniquePoints.reduce((sum, point) => sum + point.latitude, 0) / uniquePoints.length;
  const projected = uniquePoints.map((point) => ({
    x: toRadians(point.longitude) * 6371.0088 * Math.cos(toRadians(meanLatitude)),
    y: toRadians(point.latitude) * 6371.0088,
  })).sort((first, second) => first.x - second.x || first.y - second.y);

  const cross = (origin, first, second) => (
    (first.x - origin.x) * (second.y - origin.y) -
    (first.y - origin.y) * (second.x - origin.x)
  );
  const lower = [];
  projected.forEach((point) => {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  });
  const upper = [];
  projected.slice().reverse().forEach((point) => {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  });
  const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
  if (hull.length < 3) return null;

  let twiceArea = 0;
  hull.forEach((point, index) => {
    const next = hull[(index + 1) % hull.length];
    twiceArea += point.x * next.y - next.x * point.y;
  });
  const area = Math.abs(twiceArea) / 2;
  return area > 0 ? area : null;
};

export const getHealthSeries = (points, field) => points
  .filter((point) => point.timestamp !== null && point[field] !== null && point[field] > 0)
  .map((point) => ({ timestamp: point.timestamp, value: point[field] }))
  .sort((first, second) => first.timestamp - second.timestamp);

export const getLocationFreshness = (point, now = Date.now()) => {
  if (!point || point.timestamp === null) return { label: 'Timestamp unavailable', state: 'unknown' };
  const ageMs = Math.max(0, now - point.timestamp);
  if (ageMs <= 60 * 60 * 1000) return { label: 'Updated within the last hour', state: 'fresh' };
  if (ageMs <= 24 * 60 * 60 * 1000) return { label: 'Updated within 24 hours', state: 'aging' };
  return { label: 'Older than 24 hours', state: 'stale' };
};

export const getExportRows = (animals) => animals.flatMap((animal) =>
  animal.history.map((point) => ({
    animalId: animal.id,
    name: animal.name || '',
    species: animal.species,
    timestamp: point.timestamp === null ? '' : new Date(point.timestamp).toISOString(),
    latitude: point.latitude,
    longitude: point.longitude,
    activity: point.activity || '',
    temperatureC: point.temperature ?? '',
    heartRateBpm: point.heartRate ?? '',
    satellites: point.satellites ?? '',
    altitudeM: point.altitude ?? '',
    recordedSpeedKnots: point.recordedSpeedKnots ?? '',
  }))
);

const CSV_COLUMNS = [
  ['animalId', 'animal_id'],
  ['name', 'name'],
  ['species', 'species'],
  ['timestamp', 'timestamp_utc'],
  ['latitude', 'latitude_deg'],
  ['longitude', 'longitude_deg'],
  ['activity', 'activity'],
  ['temperatureC', 'temperature_c'],
  ['heartRateBpm', 'heart_rate_bpm'],
  ['satellites', 'satellites'],
  ['altitudeM', 'altitude_m'],
  ['recordedSpeedKnots', 'recorded_speed_knots'],
];

const escapeCsvValue = (value) => {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const makeCsvExport = (animals) => [
  CSV_COLUMNS.map(([, header]) => header).join(','),
  ...getExportRows(animals).map((row) => CSV_COLUMNS
    .map(([key]) => escapeCsvValue(row[key]))
    .join(',')
  ),
].join('\r\n');

export const makeGeoJsonExport = (animals) => ({
  type: 'FeatureCollection',
  features: getExportRows(animals)
    .filter((row) => row.timestamp)
    .map((row) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [row.longitude, row.latitude],
      },
      properties: {
        animal_id: row.animalId,
        name: row.name,
        species: row.species,
        timestamp_utc: row.timestamp,
        activity: row.activity,
        temperature_c: row.temperatureC,
        heart_rate_bpm: row.heartRateBpm,
        satellites: row.satellites,
        altitude_m: row.altitudeM,
        recorded_speed_knots: row.recordedSpeedKnots,
      },
    })),
});
