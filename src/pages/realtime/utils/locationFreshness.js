export const ONE_HOUR_MS = 60 * 60 * 1000;

export const isWithinLastHour = (timestamp, now = Date.now()) => (
  Number.isFinite(timestamp) &&
  timestamp <= now &&
  timestamp >= now - ONE_HOUR_MS
);
