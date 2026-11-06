import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  Activity,
  ArrowRight,
  Brain,
  Clock3,
  Database,
  MapPin,
  PawPrint,
  Radio,
  Shield,
} from 'lucide-react';
import { onValue, ref } from 'firebase/database';
import { database } from '../firebase';

const DATA_SOURCES = [
  { key: 'animals', path: 'Animals' },
  { key: 'patrols', path: 'PatrolOfficers' },
  { key: 'reports', path: 'Reports' },
];

const EMPTY_SOURCE = { data: null, loaded: false, error: null };

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseLocationTime(path, location) {
  const directTimestamp = location.timestamp || location.updatedAt || location.date;
  if (directTimestamp) {
    const timestamp = typeof directTimestamp === 'number'
      ? directTimestamp
      : Date.parse(directTimestamp);
    if (Number.isFinite(timestamp)) return timestamp;
  }

  for (let index = path.length - 1; index >= 0; index -= 1) {
    const datePart = path[index];
    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(datePart)) continue;
    const dateTimestamp = Date.parse(datePart);
    if (!Number.isFinite(dateTimestamp)) continue;

    const timePart = path[index + 1];
    if (timePart && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(timePart)) {
      const normalizedTime = timePart.length === 5 ? `${timePart}:00` : timePart;
      const combinedTimestamp = Date.parse(`${datePart}T${normalizedTime}`);
      if (Number.isFinite(combinedTimestamp)) return combinedTimestamp;
    }
    return dateTimestamp;
  }

  return null;
}

function findLocations(location, path = [], locations = []) {
  if (!location || typeof location !== 'object') return locations;

  const latitude = parseNumber(location.Lat ?? location.latitude ?? location.lat);
  const longitude = parseNumber(location.Long ?? location.Lng ?? location.longitude ?? location.lng);
  if (latitude !== null && longitude !== null) {
    locations.push({
      latitude,
      longitude,
      timestamp: parseLocationTime(path, location),
    });
    return locations;
  }

  Object.entries(location).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      findLocations(value, [...path, key], locations);
    }
  });
  return locations;
}

function summarizeAnimals(animalsData) {
  const speciesCounts = Object.entries(animalsData || {}).map(([species, records]) => {
    const animals = Object.values(records || {}).filter(
      (animal) => animal && typeof animal === 'object'
    );
    const locatedAnimals = animals.filter(
      (animal) => findLocations(animal.location).length > 0
    ).length;

    return { species, count: animals.length, located: locatedAnimals };
  }).filter((species) => species.count > 0)
    .sort((first, second) => second.count - first.count);

  return {
    total: speciesCounts.reduce((sum, species) => sum + species.count, 0),
    located: speciesCounts.reduce((sum, species) => sum + species.located, 0),
    species: speciesCounts.length,
    speciesCounts,
  };
}

function getReportTimestamp(report) {
  const timestamp = report.timestamp || report.createdAt || report.date;
  if (typeof timestamp === 'number') return timestamp;
  if (timestamp) {
    const parsed = /^\d+$/.test(String(timestamp))
      ? Number(timestamp)
      : Date.parse(timestamp);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (report.day) {
    const parsed = Date.parse(`${report.day} ${report.time || ''}`);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function getReports(reportsData) {
  return Object.entries(reportsData || {}).flatMap(([category, records]) =>
    Object.entries(records || {}).filter(([, report]) => report && typeof report === 'object')
      .map(([id, report]) => ({
        id,
        category,
        title: report.title || category.replace(/_/g, ' '),
        timestamp: getReportTimestamp(report),
        location: report.location || null,
      }))
  ).sort((first, second) => (second.timestamp || 0) - (first.timestamp || 0));
}

function formatReportTime(timestamp) {
  if (!timestamp) return 'Time not recorded';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

const DashboardStat = ({ title, value, detail, icon: Icon, to }) => (
  <Card component={Link} to={to} className="dashboard-stat-card" elevation={0}>
    <CardContent className="dashboard-stat-content">
      <Box className="dashboard-stat-heading">
        <Typography variant="body2" className="dashboard-stat-label">{title}</Typography>
        <Avatar className="dashboard-stat-icon">
          <Icon size={20} aria-hidden="true" />
        </Avatar>
      </Box>
      <Typography variant="h3" component="p" className="dashboard-stat-value">
        {value}
      </Typography>
      <Typography variant="body2" className="dashboard-stat-detail">{detail}</Typography>
    </CardContent>
  </Card>
);

const QuickAction = ({ title, description, icon: Icon, to }) => (
  <Button component={Link} to={to} className="dashboard-action" variant="outlined">
    <Avatar className="dashboard-action-icon">
      <Icon size={20} aria-hidden="true" />
    </Avatar>
    <span className="dashboard-action-copy">
      <strong>{title}</strong>
      <small>{description}</small>
    </span>
    <ArrowRight className="dashboard-action-arrow" size={18} aria-hidden="true" />
  </Button>
);

const Welcome = () => {
  const [sources, setSources] = useState({
    animals: EMPTY_SOURCE,
    patrols: EMPTY_SOURCE,
    reports: EMPTY_SOURCE,
  });

  useEffect(() => {
    const unsubscribers = DATA_SOURCES.map(({ key, path }) =>
      onValue(
        ref(database, path),
        (snapshot) => {
          setSources((current) => ({
            ...current,
            [key]: { data: snapshot.val(), loaded: true, error: null },
          }));
        },
        (error) => {
          console.error(`Unable to load dashboard ${key} data:`, error);
          setSources((current) => ({
            ...current,
            [key]: { ...current[key], loaded: true, error },
          }));
        }
      )
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const animalSummary = useMemo(
    () => summarizeAnimals(sources.animals.data),
    [sources.animals.data]
  );
  const reports = useMemo(() => getReports(sources.reports.data), [sources.reports.data]);
  const patrolCount = Object.values(sources.patrols.data || {}).filter(
    (officer) => officer && typeof officer === 'object'
  ).length;
  const allLoaded = DATA_SOURCES.every(({ key }) => sources[key].loaded);
  const errors = DATA_SOURCES.filter(({ key }) => sources[key].error);
  const allConnected = allLoaded && errors.length === 0;
  const maxSpeciesCount = Math.max(1, ...animalSummary.speciesCounts.map(({ count }) => count));
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="welcome-page dashboard-page">
      <Container maxWidth="xl" className="welcome-content dashboard-content">
        <Box component="header" className="dashboard-header">
          <Box>
            <Typography variant="overline" className="dashboard-date">{today}</Typography>
            <Typography variant="h1" component="h1" className="dashboard-title">
              Wildlife operations
            </Typography>
            <Typography variant="body1" className="dashboard-subtitle">
              A live overview of your tracked animals, field reports, and patrol team.
            </Typography>
          </Box>
          <Chip
            className={`dashboard-live-chip ${allLoaded ? 'is-connected' : ''}`}
            icon={<Radio size={16} aria-hidden="true" />}
            label={allConnected ? 'Live data connected' : errors.length ? 'Some data unavailable' : 'Connecting to live data'}
            variant="outlined"
          />
        </Box>

        {errors.length > 0 && (
          <Alert severity="error" className="dashboard-error" role="alert">
            Some dashboard data could not be loaded ({errors.map(({ path }) => path).join(', ')}).
            Check your connection or database permissions; other live data remains available.
          </Alert>
        )}

        <Box component="section" aria-label="System overview" className="dashboard-stat-grid">
          <DashboardStat
            title="Animals monitored"
            value={sources.animals.error ? '—' : sources.animals.loaded ? animalSummary.total.toLocaleString() : <Skeleton width={54} />}
            detail="Registered in the tracking system"
            icon={PawPrint}
            to="/view_animals"
          />
          <DashboardStat
            title="With location data"
            value={sources.animals.error ? '—' : sources.animals.loaded ? animalSummary.located.toLocaleString() : <Skeleton width={54} />}
            detail="Animals with saved coordinates"
            icon={MapPin}
            to="/real_time"
          />
          <DashboardStat
            title="Field reports"
            value={sources.reports.error ? '—' : sources.reports.loaded ? reports.length.toLocaleString() : <Skeleton width={54} />}
            detail="Reports across all categories"
            icon={Activity}
            to="/real_time"
          />
          <DashboardStat
            title="Patrol officers"
            value={sources.patrols.error ? '—' : sources.patrols.loaded ? patrolCount.toLocaleString() : <Skeleton width={54} />}
            detail="Registered in the patrol team"
            icon={Shield}
            to="/real_time"
          />
        </Box>

        <Box component="section" className="dashboard-section">
          <Box className="dashboard-section-heading">
            <Box>
              <Typography variant="h2" component="h2">Quick actions</Typography>
              <Typography variant="body2">Go straight to the tools you use most.</Typography>
            </Box>
          </Box>
          <Box className="dashboard-actions-grid">
            <QuickAction
              title="Open live tracking"
              description="View animals, patrols, and reports on the map"
              icon={MapPin}
              to="/real_time"
            />
            <QuickAction
              title="Browse animals"
              description="Search the animal registry and locations"
              icon={PawPrint}
              to="/view_animals"
            />
            <QuickAction
              title="Explore analysis"
              description="Review movement patterns and predictions"
              icon={Brain}
              to="/analysis"
            />
            <QuickAction
              title="Upload tracking data"
              description="Import a CSV tracking dataset"
              icon={Database}
              to="/analysis_data"
            />
          </Box>
        </Box>

        <Box className="dashboard-details-grid">
          <Card component="section" className="dashboard-panel" elevation={0}>
            <CardContent>
              <Box className="dashboard-section-heading">
                <Box>
                  <Typography variant="h2" component="h2">Animals by species</Typography>
                  <Typography variant="body2">
                    {sources.animals.error
                      ? 'Registry unavailable'
                      : sources.animals.loaded
                      ? `${animalSummary.species} species in the registry`
                      : 'Loading registry summary'}
                  </Typography>
                </Box>
                <Button component={Link} to="/view_animals" endIcon={<ArrowRight size={16} />}>
                  View animals
                </Button>
              </Box>

              {sources.animals.error ? (
                <Alert severity="error">Animal registry data is unavailable.</Alert>
              ) : !sources.animals.loaded ? (
                <Box className="dashboard-loading-bars" role="status" aria-label="Loading species">
                  <Skeleton height={42} />
                  <Skeleton height={42} />
                  <Skeleton height={42} />
                </Box>
              ) : animalSummary.speciesCounts.length === 0 ? (
                <Box className="dashboard-empty-state">
                  <PawPrint size={24} aria-hidden="true" />
                  <Typography variant="body2">
                    No animals have been added yet. The species breakdown will appear here.
                  </Typography>
                  <Button component={Link} to="/view_animals">Open animal registry</Button>
                </Box>
              ) : (
                <Box className="dashboard-species-list">
                  {animalSummary.speciesCounts.slice(0, 6).map(({ species, count, located }) => (
                    <Box className="dashboard-species-row" key={species}>
                      <Box className="dashboard-species-label">
                        <Typography component="span">{species}</Typography>
                        <Typography component="span" className="dashboard-species-count">
                          {count} {count === 1 ? 'animal' : 'animals'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(count / maxSpeciesCount) * 100}
                        aria-label={`${species}: ${count} animals`}
                      />
                      <Typography component="span" className="dashboard-species-located">
                        {located} located
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Card component="section" className="dashboard-panel" elevation={0}>
            <CardContent>
              <Box className="dashboard-section-heading">
                <Box>
                  <Typography variant="h2" component="h2">Recent field reports</Typography>
                  <Typography variant="body2">Latest records received by the system.</Typography>
                </Box>
                <Button component={Link} to="/real_time" endIcon={<ArrowRight size={16} />}>
                  Open map
                </Button>
              </Box>

              {sources.reports.error ? (
                <Alert severity="error">Field report data is unavailable.</Alert>
              ) : !sources.reports.loaded ? (
                <Box className="dashboard-loading-bars" role="status" aria-label="Loading reports">
                  <Skeleton height={58} />
                  <Skeleton height={58} />
                  <Skeleton height={58} />
                </Box>
              ) : reports.length === 0 ? (
                <Box className="dashboard-empty-state">
                  <Activity size={24} aria-hidden="true" />
                  <Typography variant="body2">
                    No field reports yet. New reports will appear here as they are received.
                  </Typography>
                </Box>
              ) : (
                <Box className="dashboard-report-list">
                  {reports.slice(0, 5).map((report) => (
                    <Box className="dashboard-report-row" key={`${report.category}-${report.id}`}>
                      <Avatar className="dashboard-report-icon">
                        <Activity size={17} aria-hidden="true" />
                      </Avatar>
                      <Box className="dashboard-report-copy">
                        <Typography component="strong">{report.title}</Typography>
                        <Typography component="span">
                          {report.category.replace(/_/g, ' ')}
                        </Typography>
                      </Box>
                      <Typography className="dashboard-report-time">
                        <Clock3 size={14} aria-hidden="true" />
                        {formatReportTime(report.timestamp)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </div>
  );
};

export default Welcome;
