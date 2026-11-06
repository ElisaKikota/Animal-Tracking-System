const formatDate = (year, month, day) => {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date.toLocaleDateString();
};

const formatTime = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;

  let [, hourText, minuteText, secondText = '0', meridiem] = match;
  let hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);

  if (minute > 59 || second > 59) return null;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0);
  } else if (hour > 23) {
    return null;
  }

  const date = new Date(2000, 0, 1, hour, minute, second);
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    ...(secondText !== '0' ? { second: '2-digit' } : {}),
  });
};

const parseReportDay = (value) => {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  return formatDate(year, month, day);
};

const parseReportDate = (value) => {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 &&
    date.getDate() === day
    ? { year, month, day }
    : null;
};

const parseReportTime = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;

  let [, hourText, minuteText, secondText = '0', meridiem] = match;
  let hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (minute > 59 || second > 59) return null;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0);
  } else if (hour > 23) {
    return null;
  }

  return { hour, minute, second };
};

const parseTimestamp = (value) => {
  if (value === null || value === undefined || value === '') return null;
  let timestamp;
  if (typeof value === 'number' || /^\d{10,13}$/.test(String(value))) {
    timestamp = Number(value);
    if (timestamp < 1e11) timestamp *= 1000;
  } else {
    timestamp = Date.parse(value);
  }

  const date = new Date(timestamp);
  return Number.isFinite(timestamp) && Number.isFinite(date.getTime()) ? date : null;
};

export const getReportTimestamp = (report) => {
  const timestampDate = parseTimestamp(report?.timestamp);
  if (timestampDate) return timestampDate.getTime();

  const date = parseReportDate(report?.day ?? report?.date);
  const time = parseReportTime(report?.time);
  if (!date || !time) return null;

  return new Date(
    date.year,
    date.month - 1,
    date.day,
    time.hour,
    time.minute,
    time.second
  ).getTime();
};

export const getReportDateTime = (report) => {
  const timestampDate = parseTimestamp(report?.timestamp);
  const dayDate = parseReportDay(report?.day ?? report?.date);
  const timeValue = formatTime(report?.time);

  if (timestampDate) {
    return {
      date: timestampDate.toLocaleDateString(),
      time: timestampDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
  }

  return {
    date: dayDate || 'Date unavailable',
    time: timeValue || 'Time unavailable',
  };
};
