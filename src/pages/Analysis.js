import React, { useState, useEffect, useCallback } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import AnalysisDataPage from './AnalysisDataPage';
import ScientificPanel from './realtime/ScientificPanel';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { extractLocationHistory } from './realtime/utils/scienceUtils';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function Analysis() {
  const [tabValue, setTabValue] = useState(0);
  const [animals, setAnimals] = useState([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);

  // Fetch animal data for the Research panel
  useEffect(() => {
    if (!database) {
      console.error('Database is not initialized');
      return;
    }

    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    const fetchedData = {};

    const unsubscribes = animalSpecies.map(species => {
      const speciesRef = ref(database, `Animals/${species}`);
      return onValue(speciesRef, (snapshot) => {
        const data = snapshot.val();
        Object.keys(fetchedData)
          .filter((key) => key.startsWith(`${species}-`))
          .forEach((key) => delete fetchedData[key]);

        if (data && typeof data === 'object') {
          Object.entries(data).forEach(([id, animal]) => {
            const history = extractLocationHistory(animal?.location);
            const latestPoint = history.slice().reverse()
              .find((point) => point.timestamp !== null) || history[history.length - 1];

            if (latestPoint) {
              fetchedData[`${species}-${id}`] = {
                id: `${species}-${id}`,
                species,
                name: animal.name || `${species.slice(0, -1)} ${id}`,
                age: animal.age,
                sex: animal.sex || 'Unknown',
                date: latestPoint.timestamp === null ? 'Unknown' : new Date(latestPoint.timestamp).toISOString().slice(0, 10),
                time: latestPoint.timestamp === null ? 'Unknown' : new Date(latestPoint.timestamp).toISOString().slice(11, 19),
                timestamp: latestPoint.timestamp,
                history,
                location: {
                  Lat: latestPoint.latitude,
                  Lng: latestPoint.longitude,
                  activity: latestPoint.activity,
                  temperature: latestPoint.temperature,
                  heart_rate: latestPoint.heartRate,
                  satellites: latestPoint.satellites,
                  altitude: latestPoint.altitude,
                  speed_knots: latestPoint.recordedSpeedKnots,
                }
              };
            }
          });
        }

        const animalArray = Object.values(fetchedData);
        setAnimals(animalArray);
        if (animalArray.length > 0 && !selectedAnimalId) {
          setSelectedAnimalId(animalArray[0].id);
        }
      }, (error) => {
        console.error(`Error fetching data for ${species}:`, error);
      });
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [selectedAnimalId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectAnimal = useCallback((animal) => {
    setSelectedAnimalId(animal.id);
  }, []);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Analysis tabs">
          <Tab label="Data Upload" />
          <Tab label="Research Tools" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
        <TabPanel value={tabValue} index={0}>
          <AnalysisDataPage />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Research & Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Exploratory summaries from recorded animal observations and tracking data.
            </Typography>
            <ScientificPanel
              animals={animals}
              selectedAnimalId={selectedAnimalId}
              onSelectAnimal={handleSelectAnimal}
              onClose={() => {}}
              embedded
            />
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
}

export default Analysis;