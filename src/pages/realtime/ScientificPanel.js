import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { Download, FileJson2, FileSpreadsheet, Microscope, X } from 'lucide-react';
import {
  calculateMinimumConvexPolygonAreaKm2,
  calculateMovement,
  detectMovementOutliers,
  getHealthSeries,
  getLocationFreshness,
  makeCsvExport,
  makeGeoJsonExport,
} from './utils/scienceUtils';
import './ScientificPanel.css';

const TIME_WINDOWS = [
  { label: '24 hours', milliseconds: 24 * 60 * 60 * 1000 },
  { label: '7 days', milliseconds: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', milliseconds: 30 * 24 * 60 * 60 * 1000 },
  { label: '90 days', milliseconds: 90 * 24 * 60 * 60 * 1000 },
  { label: 'All stored history', milliseconds: null },
];

const formatNumber = (value, digits = 2) => (
  value === null || !Number.isFinite(value) ? 'Not available' : value.toFixed(digits)
);

const median = (values) => {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const getHealthOutliers = (series) => {
  if (series.length < 5) return [];
  const values = series.map(({ value }) => value);
  const center = median(values);
  const deviation = median(values.map((value) => Math.abs(value - center)));
  const threshold = Math.max(deviation * 3, Math.abs(center) * 0.25, 0.1);
  return series.filter(({ value }) => Math.abs(value - center) > threshold)
    .map(({ timestamp, value }) => ({ timestamp, value, center }));
};

const HealthTrend = ({ title, unit, series }) => {
  if (series.length === 0) {
    return (
      <Box className="science-health-metric">
        <Typography className="science-health-title">{title}</Typography>
        <Typography className="science-muted">No timestamped readings available</Typography>
      </Box>
    );
  }

  const values = series.map(({ value }) => value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const latest = series[series.length - 1];
  const spread = maximum - minimum || Math.max(Math.abs(maximum) * 0.1, 1);
  const points = series.slice(-30).map(({ value }, index, sampled) => {
    const x = sampled.length === 1 ? 50 : (index / (sampled.length - 1)) * 100;
    const y = 25 - ((value - minimum) / spread) * 20;
    return `${x},${Math.max(4, Math.min(25, y))}`;
  }).join(' ');
  const outliers = getHealthOutliers(series);
  const latestIsOutlier = outliers.some((reading) => reading.timestamp === latest.timestamp);

  return (
    <Box className="science-health-metric">
      <Box className="science-health-heading">
        <Typography className="science-health-title">{title}</Typography>
        <Typography className="science-health-current">
          {formatNumber(latest.value, 1)} {unit}
        </Typography>
      </Box>
      <svg
        className="science-sparkline"
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${title} readings over the selected period, ${series.length} observations, ranging from ${minimum.toFixed(1)} to ${maximum.toFixed(1)} ${unit}`}
      >
        <polyline points={points} />
      </svg>
      <Box className="science-health-footer">
        <Typography>{series.length} readings · low {minimum.toFixed(1)} {unit} · high {maximum.toFixed(1)} {unit}</Typography>
        {latestIsOutlier && <Chip size="small" label="Review relative to baseline" color="warning" />}
      </Box>
    </Box>
  );
};

const downloadFile = (filename, contents, mimeType) => {
  const url = URL.createObjectURL(new Blob([contents], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const ScientificPanel = ({ animals, selectedAnimalId, onSelectAnimal, onClose, embedded = false }) => {
  const [timeWindow, setTimeWindow] = useState('30 days');
  const [now, setNow] = useState(Date.now());
  const selectedAnimal = animals.find((animal) => animal.id === selectedAnimalId) || animals[0] || null;
  const windowOption = TIME_WINDOWS.find(({ label }) => label === timeWindow);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const windowedPoints = useMemo(() => {
    if (!selectedAnimal) return [];
    const cutoff = windowOption?.milliseconds === null
      ? null
      : now - (windowOption?.milliseconds ?? TIME_WINDOWS[2].milliseconds);
    return selectedAnimal.history.filter((point) =>
      point.timestamp !== null && (cutoff === null || point.timestamp >= cutoff)
    );
  }, [now, selectedAnimal, windowOption]);

  const movement = useMemo(() => calculateMovement(windowedPoints), [windowedPoints]);
  const movementOutliers = useMemo(
    () => detectMovementOutliers(movement.segments),
    [movement.segments]
  );
  const temperatureSeries = useMemo(
    () => getHealthSeries(windowedPoints, 'temperature'),
    [windowedPoints]
  );
  const heartRateSeries = useMemo(
    () => getHealthSeries(windowedPoints, 'heartRate'),
    [windowedPoints]
  );
  const homeRangeArea = useMemo(
    () => calculateMinimumConvexPolygonAreaKm2(windowedPoints),
    [windowedPoints]
  );
  const latestPoint = selectedAnimal?.history
    .slice()
    .reverse()
    .find((point) => point.timestamp !== null) || selectedAnimal?.history.slice(-1)[0] || null;
  const freshness = getLocationFreshness(latestPoint, now);
  const latestQuality = latestPoint?.satellites;
  const timestampedHistoryCount = selectedAnimal?.history.filter((point) => point.timestamp !== null).length || 0;
  const exportAnimals = selectedAnimal ? [selectedAnimal] : [];

  const handleExport = (format) => {
    if (!selectedAnimal) return;
    const safeName = (selectedAnimal.name || selectedAnimal.id).replace(/[^a-z0-9_-]+/gi, '-');
    if (format === 'csv') {
      downloadFile(
        `${safeName}-tracking-observations.csv`,
        makeCsvExport(exportAnimals),
        'text/csv;charset=utf-8'
      );
    } else {
      downloadFile(
        `${safeName}-tracking-observations.geojson`,
        JSON.stringify(makeGeoJsonExport(exportAnimals), null, 2),
        'application/geo+json'
      );
    }
  };

  return (
    <Paper
      component="section"
      className={`science-panel${embedded ? ' science-panel-embedded' : ''}`}
      elevation={8}
      aria-label="Scientific observations"
    >
      <Box className="science-panel-header">
        <Box className="science-panel-title">
          <Microscope size={20} aria-hidden="true" />
          <Box>
            <Typography component="h2">Research tools</Typography>
            <Typography component="p">Exploratory summaries from recorded observations</Typography>
          </Box>
        </Box>
        <Button onClick={onClose} aria-label="Close research tools" className="science-close-button">
          <X size={20} aria-hidden="true" />
        </Button>
      </Box>

      <Box className="science-panel-content">
        {animals.length === 0 ? (
          <Alert severity="info">
            No animal location observations are available yet.
          </Alert>
        ) : (
          <>
            <FormControl fullWidth size="small" className="science-select">
              <InputLabel id="science-animal-label">Animal</InputLabel>
              <Select
                labelId="science-animal-label"
                value={selectedAnimal?.id || ''}
                label="Animal"
                onChange={(event) => {
                  const animal = animals.find((item) => item.id === event.target.value);
                  if (animal) onSelectAnimal(animal);
                }}
              >
                {animals.map((animal) => (
                  <MenuItem value={animal.id} key={animal.id}>
                    {animal.name || animal.id} · {animal.species}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" className="science-select">
              <InputLabel id="science-window-label">Time window</InputLabel>
              <Select
                labelId="science-window-label"
                value={timeWindow}
                label="Time window"
                onChange={(event) => setTimeWindow(event.target.value)}
              >
                {TIME_WINDOWS.map(({ label }) => <MenuItem key={label} value={label}>{label}</MenuItem>)}
              </Select>
            </FormControl>

            <Box className="science-section">
              <Typography component="h3">Location quality</Typography>
              <Box className="science-location-summary">
                <Chip
                  size="small"
                  label={freshness.label}
                  className={`science-freshness science-freshness-${freshness.state}`}
                />
                <Typography>
                  {latestQuality === null || latestQuality === undefined
                    ? 'Satellite count not recorded'
                    : `${latestQuality} GPS satellites reported`}
                </Typography>
                <Typography>
                  {timestampedHistoryCount} timestamped fixes in stored history
                </Typography>
              </Box>
              <Typography className="science-method-note">
                Freshness bands: within 1 hour, within 24 hours, or older than 24 hours.
                Satellite count is shown as reported; it is not an accuracy estimate.
              </Typography>
            </Box>

            <Box className="science-section">
              <Typography component="h3">Movement summary</Typography>
              <Box className="science-measure-grid">
                <Box><strong>{formatNumber(movement.distanceKm, 3)} km</strong><span>Observed path distance</span></Box>
                <Box><strong>{formatNumber(movement.averageKph, 2)} km/h</strong><span>Mean across observed time span</span></Box>
                <Box><strong>{formatNumber(homeRangeArea, 3)} km²</strong><span>Minimum convex polygon estimate</span></Box>
                <Box><strong>{windowedPoints.length}</strong><span>Timestamped fixes in window</span></Box>
              </Box>
              <Typography className="science-method-note">
                Straight-line distance between consecutive timestamped fixes. Home range uses a local
                equirectangular projection of the minimum convex polygon; at least 3 non-collinear fixes
                are required. The map line connects recorded fixes; it is not a modeled movement corridor.
                Estimates are not corrected for sampling bias or habitat.
              </Typography>
            </Box>

            <Box className="science-section">
              <Typography component="h3">Physiology readings</Typography>
              <Alert severity="info" className="science-disclaimer">
                Research signals only—not a medical assessment. Zero and missing sensor values are omitted.
              </Alert>
              <HealthTrend title="Temperature" unit="°C" series={temperatureSeries} />
              <HealthTrend title="Heart rate" unit="bpm" series={heartRateSeries} />
            </Box>

            <Box className="science-section">
              <Typography component="h3">Movement review</Typography>
              {movementOutliers.length === 0 ? (
                <Typography className="science-muted">
                  {movement.segments.length < 5
                    ? `Need at least 5 timestamped movement segments; currently ${movement.segments.length}.`
                    : 'No segment met the exploratory speed-deviation rule in this window.'}
                </Typography>
              ) : (
                <Alert severity="warning" className="science-outlier-alert">
                  {movementOutliers.length} segment(s) exceed this animal’s baseline speed rule.
                  Median speed: {formatNumber(movementOutliers[0].baselineMedian, 2)} km/h.
                  These are review prompts, not confirmed anomalies.
                </Alert>
              )}
              <Typography className="science-method-note">
                Exploratory rule: at least 5 segments within 6 hours, with speed above the median
                plus a robust median-absolute-deviation threshold. GPS noise and long gaps can affect results.
              </Typography>
            </Box>

            <Box className="science-section science-export-section">
              <Typography component="h3">Export observations</Typography>
              <Typography className="science-muted">
                Exports cover this animal’s full stored history, not just the selected analysis window.
                CSV includes untimestamped fixes; GeoJSON includes timestamped fixes only. Sensor fields
                include units and retain missing values.
              </Typography>
              <Box className="science-export-actions">
                <Button
                  variant="outlined"
                  startIcon={<FileSpreadsheet size={16} />}
                  onClick={() => handleExport('csv')}
                >
                  CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileJson2 size={16} />}
                  onClick={() => handleExport('geojson')}
                >
                  GeoJSON
                </Button>
                <Download size={16} aria-hidden="true" />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ScientificPanel;
