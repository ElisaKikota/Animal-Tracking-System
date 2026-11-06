const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const parseTimestamp = (value) => {
  if (value === null || value === undefined || value === '') return null;
  let timestamp;
  if (typeof value === 'number' || /^\d{10,13}$/.test(String(value).trim())) {
    timestamp = Number(value);
    if (timestamp < 1e11) timestamp *= 1000;
  } else {
    timestamp = Date.parse(value);
  }
  return Number.isFinite(timestamp) && Number.isFinite(new Date(timestamp).getTime())
    ? timestamp
    : null;
};

const parseNestedTimestamp = (point, path) => {
  const explicitTimestamp = parseTimestamp(point.timestamp ?? point.updatedAt);
  if (explicitTimestamp !== null) return explicitTimestamp;

  const dateValue = point.day ?? point.date ?? point.Date ??
    path.slice().reverse()
      .find((segment) => /^\d{4}[-/_]\d{1,2}[-/_]\d{1,2}$/.test(String(segment).trim()));
  if (dateValue === undefined) return null;

  const dateMatch = String(dateValue).trim().match(/^(\d{4})[-/_](\d{1,2})[-/_](\d{1,2})$/);
  if (!dateMatch) return null;

  const [, year, month, day] = dateMatch.map(Number);
  const timeValue = point.time ?? point.Time ??
    path.slice().reverse()
      .find((segment) => /^\d{1,2}:\d{2}(?::\d{2})?$/.test(String(segment).trim()));
  const timeMatch = String(timeValue || '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  const hours = timeMatch ? Number(timeMatch[1]) : 0;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;
  const seconds = timeMatch && timeMatch[3] ? Number(timeMatch[3]) : 0;
  if (!timeMatch || hours > 23 || minutes > 59 || seconds > 59) return null;

  const timestamp = Date.UTC(year, month - 1, day, hours, minutes, seconds);
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day) return null;
  return timestamp;
};

const formatPatrolFix = (point, timestamp) => ({
  location: { Lat: point.latitude, Lng: point.longitude },
  timestamp,
  date: timestamp === null ? 'Date unavailable' : new Date(timestamp).toLocaleDateString(),
  time: timestamp === null
    ? 'Time unavailable'
    : new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }),
});

export const getLatestPatrolLocation = (locationData) => {
  const fixes = [];
  const visit = (value, path = []) => {
    if (!value || typeof value !== 'object') return;

    const latitude = parseNumericValue(value.Lat ?? value.lat ?? value.latitude);
    const longitude = parseNumericValue(value.Long ?? value.Lng ?? value.long ?? value.lon ?? value.longitude);
    if (latitude !== null && longitude !== null) {
      if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        fixes.push(formatPatrolFix(
          { latitude, longitude },
          parseNestedTimestamp(value, path)
        ));
      }
      return;
    }

    Object.entries(value).forEach(([key, child]) => visit(child, [...path, key]));
  };

  visit(locationData);
  if (fixes.length === 0) return null;
  return fixes.reduce((latest, fix) =>
    fix.timestamp !== null && (latest.timestamp === null || fix.timestamp > latest.timestamp)
      ? fix
      : latest
  );
};

export const getPatrolStatus = (patrol) => {
  if (patrol?.status) return patrol.status;

  const onPatrol = patrol?.on_patrol;
  if (onPatrol === true || String(onPatrol).toLowerCase() === 'true') return 'On patrol';
  if (onPatrol === false || String(onPatrol).toLowerCase() === 'false') return 'Off patrol';

  const active = patrol?.active;
  if (active === true || String(active).toLowerCase() === 'true') return 'Active';
  if (active === false || String(active).toLowerCase() === 'false') return 'Inactive';

  return 'Status unavailable';
};
