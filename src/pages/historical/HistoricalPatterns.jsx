import React, { useState, useEffect, useCallback } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../firebase';
import { Box, Typography, Button, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import AnimalSelector from './AnimalSelector';
import './HistoricalPatterns.css';
import { MapContainer, TileLayer, Polyline, ZoomControl, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Papa from 'papaparse';
import AnimalDetailsPanel from './AnimalDetailsPanel';
import { ModelTraining, DirectionsRun, Timeline, Public } from '@mui/icons-material';
import Slider from '@mui/material/Slider';

// Import animal icons
import elephantIcon from '../../assets/elephant.png';
import lionIcon from '../../assets/lion.png';
import giraffeIcon from '../../assets/giraffe.png';
import rhinoIcon from '../../assets/rhino.png';
import leopardIcon from '../../assets/leopard.png';

function HistoricalPatterns() {
  // eslint-disable-next-line no-unused-vars
  const [dataSource, setDataSource] = useState('predictive'); // Only use predictive/AnalysisData
  const [animalData, setAnimalData] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [pathData, setPathData] = useState([]);
  const [mapKey, setMapKey] = useState('initial');
  const [mapReady, setMapReady] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [animalSelectorCollapsed, setAnimalSelectorCollapsed] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loadingCSV, setLoadingCSV] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [csvError, setCsvError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [csvLoaded, setCsvLoaded] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showAnimalDetailsPanel, setShowAnimalDetailsPanel] = useState(false);
  const [predictionMode, setPredictionMode] = useState(false);
  const [predictedPathData, setPredictedPathData] = useState([]);
  const [predictAnimal, setPredictAnimal] = useState('');
  const [numPoints, setNumPoints] = useState(5);
  const [interval, setInterval] = useState(1); // in hours
  
  // Get main sidebar state from App's CSS classes
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);
  
  // Monitor main sidebar state changes
  useEffect(() => {
    const checkMainSidebar = () => {
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        const isOpen = appContainer.classList.contains('sidebar-open');
        if (isMainSidebarOpen !== isOpen) {
          setIsMainSidebarOpen(isOpen);
          // Only change map key if map is ready
          if (mapReady) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
              setMapKey(`map-${Date.now()}`);
            }, 100);
          }
        }
      }
    };
    
    // Check initial state
    checkMainSidebar();
    
    // Create a mutation observer to watch for class changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          checkMainSidebar();
        }
      });
    });
    
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      observer.observe(appContainer, { attributes: true });
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isMainSidebarOpen, mapReady]);

  // Load animal data based on selected data source
  useEffect(() => {
    loadPredictiveData();
  }, []); // Only run once on mount

  const loadPredictiveData = () => {
    const analysisDataRef = ref(database, 'AnalysisData');
    onValue(analysisDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedData = [];
        Object.entries(data).forEach(([species, animals]) => {
          Object.entries(animals).forEach(([id, animal]) => {
            const animalObj = {
              id,
              species,
              name: animal.name || 'Unnamed',
              sex: animal.sex || 'Unknown',
              age: animal.age || 'Unknown',
              locationHistory: [],
              csvUrl: animal.csvDownloadURL
            };
            fetchedData.push(animalObj);
          });
        });
        setAnimalData(fetchedData);
      }
    });
  };

  // Add new function to load CSV data
  const loadCSVData = useCallback(async (animal) => {
    if (!animal.csvUrl) {
      setCsvError('No CSV URL found for this animal');
      return;
    }

    setLoadingCSV(true);
    setCsvError(null);

    try {
      const response = await fetch(animal.csvUrl);
      if (!response.ok) throw new Error('Failed to fetch CSV file');
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const locationHistory = results.data
            .filter(row => row.latitude && row.longitude) // Filter out rows without coordinates
            .map(row => ({
              timestamp: new Date(row.timestamp || `${row.date} ${row.time}`).getTime(),
              date: row.date,
              time: row.time,
              lat: parseFloat(row.latitude),
              lng: parseFloat(row.longitude),
              temperature: row.temperature || 'N/A',
              activity: row.activity || 'N/A'
            }))
            .sort((a, b) => a.timestamp - b.timestamp);

          // Update the animal's location history
          setAnimalData(prevData => 
            prevData.map(a => 
              a.id === animal.id 
                ? { ...a, locationHistory } 
                : a
            )
          );
          setLoadingCSV(false);
        },
        error: (error) => {
          setCsvError(`Error parsing CSV: ${error.message}`);
          setLoadingCSV(false);
        }
      });
    } catch (error) {
      setCsvError(`Error loading CSV: ${error.message}`);
      setLoadingCSV(false);
    }
  }, []);

  // Modify the useEffect for selected animals to load CSV data
  useEffect(() => {
    if (selectedAnimals.length === 0) return;

    selectedAnimals.forEach(animalId => {
      const animal = animalData.find(a => a.id === animalId);
      if (!animal) return;

      if (dataSource === 'predictive' && animal.csvUrl && animal.locationHistory.length === 0) {
        loadCSVData(animal);
      }
    });
  }, [selectedAnimals, animalData, dataSource, loadCSVData]);



  const getAnimalIcon = (species) => {
    const iconUrl = species.toLowerCase().includes('elephant') ? elephantIcon :
                   species.toLowerCase().includes('lion') ? lionIcon :
                   species.toLowerCase().includes('rhino') ? rhinoIcon :
                   species.toLowerCase().includes('leopard') ? leopardIcon :
                   species.toLowerCase().includes('giraffe') ? giraffeIcon :
                   giraffeIcon; // Default to giraffe if no match

    return L.icon({
      iconUrl,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19]
    });
  };

  const getPathColor = (species) => {
    return species.toLowerCase().includes('elephant') ? '#FF6B6B' :
           species.toLowerCase().includes('lion') ? '#4ECDC4' :
           species.toLowerCase().includes('rhino') ? '#45B7D1' :
           species.toLowerCase().includes('leopard') ? '#96CEB4' :
           species.toLowerCase().includes('giraffe') ? '#FFEEAD' :
           '#FF6B6B'; // Default color
  };

  const getCurrentPositions = () => {
    if (!currentTimestamp) return [];

    return selectedAnimals.map(animalId => {
      const animal = animalData.find(a => a.id === animalId);
      if (!animal) return null;

      const position = animal.locationHistory.find(
        loc => loc.timestamp <= currentTimestamp
      );

      if (!position) return null;

      return {
        id: animal.id,
        name: animal.name,
        species: animal.species,
        position: [position.lat, position.lng],
        timestamp: position.timestamp,
        temperature: position.temperature,
        activity: position.activity
      };
    }).filter(Boolean);
  };

  const handleMapLoad = () => {
    setMapReady(true);
  };

  // Update path data when selected animals or date range changes
  useEffect(() => {
    if (selectedAnimals.length === 0) return;

    // Defensive checks for dateRange
    const startTimestamp = (dateRange.startDate instanceof Date && !isNaN(dateRange.startDate)) ? dateRange.startDate.getTime() : 0;
    const endTimestamp = (dateRange.endDate instanceof Date && !isNaN(dateRange.endDate)) ? dateRange.endDate.getTime() : Date.now();

    const newPathData = [];

    selectedAnimals.forEach(animalId => {
      const animal = animalData.find(a => a.id === animalId);
      if (!animal) return;

      const filteredLocations = animal.locationHistory.filter(
        loc => loc.timestamp >= startTimestamp && loc.timestamp <= endTimestamp
      );

      if (filteredLocations.length > 0) {
        newPathData.push({
          id: animal.id,
          name: animal.name,
          species: animal.species,
          path: filteredLocations.map(loc => [loc.lat, loc.lng]),
          locations: filteredLocations,
          color: getPathColor(animal.species)
        });
      }
    });

    setPathData(newPathData);
    
    // Set current timestamp to the earliest one in the range if not set
    if (!currentTimestamp && newPathData.length > 0) {
      const allTimestamps = newPathData.flatMap(animal => 
        animal.locations.map(loc => loc.timestamp)
      );
      if (allTimestamps.length > 0) {
        setCurrentTimestamp(Math.min(...allTimestamps));
      }
    }
  }, [selectedAnimals, animalData, dateRange, currentTimestamp]);

  // When animal selection changes, collapse if one animal is selected
  useEffect(() => {
    if (selectedAnimals.length === 1) setAnimalSelectorCollapsed(true);
    else setAnimalSelectorCollapsed(false);
  }, [selectedAnimals]);

  // Auto-set date range based on selected animal(s) data
  useEffect(() => {
    if (!selectedAnimals.length) return;
    let allTimestamps = [];
    selectedAnimals.forEach(animalId => {
      const animal = animalData.find(a => a.id === animalId);
      if (animal && animal.locationHistory && animal.locationHistory.length > 0) {
        // Ensure every location has a valid timestamp
        animal.locationHistory.forEach(loc => {
          let ts = loc.timestamp;
          if (!ts && loc.date && loc.time) {
            ts = new Date(`${loc.date} ${loc.time}`).getTime();
          }
          if (typeof ts === 'number' && !isNaN(ts)) {
            allTimestamps.push(ts);
          }
        });
      }
    });
    if (allTimestamps.length > 0) {
      const minDate = new Date(Math.min(...allTimestamps));
      const maxDate = new Date(Math.max(...allTimestamps));
      setDateRange({ startDate: minDate, endDate: maxDate });
    }
    // If no valid timestamps, do not update dateRange
  }, [selectedAnimals, animalData]);

  // After CSV is loaded, plot all coordinates
  useEffect(() => {
    if (dataSource === 'predictive' && selectedAnimals.length > 0) {
      // Check if all selected animals have locationHistory loaded
      const allLoaded = selectedAnimals.every(animalId => {
        const animal = animalData.find(a => a.id === animalId);
        return animal && animal.locationHistory && animal.locationHistory.length > 0;
      });
      setCsvLoaded(allLoaded);
      if (allLoaded) {
        // Plot all coordinates (set pathData to all points)
        const newPathData = selectedAnimals.map(animalId => {
          const animal = animalData.find(a => a.id === animalId);
          if (!animal) return null;
          return {
            id: animal.id,
            name: animal.name,
            species: animal.species,
            path: animal.locationHistory.map(loc => [loc.lat, loc.lng]),
            locations: animal.locationHistory,
            color: getPathColor(animal.species)
          };
        }).filter(Boolean);
        setPathData(newPathData);
      }
    }
  }, [dataSource, selectedAnimals, animalData]);

  // When a single animal is selected, show the details panel
  useEffect(() => {
    if (selectedAnimals.length === 1) {
      setShowAnimalDetailsPanel(true);
    } else {
      setShowAnimalDetailsPanel(false);
    }
  }, [selectedAnimals]);



  // New UI state for home panel and workflow
  const [mainPanel, setMainPanel] = useState('home'); // 'home', 'train', 'predict', 'patterns', 'geo'
  const [trainStep, setTrainStep] = useState(0); // 0: data source, 1: animal, 2: model type, 3: model, 4: params

  // Add state for modelType, selectedModel, availableModels
  const [modelType, setModelType] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);

  // Update availableModels when modelType changes (fetch from Firebase)
  useEffect(() => {
    if (!modelType) { setAvailableModels([]); return; }
    // Map modelType to Firebase node
    const typeLabel = modelType === 'random_forest' ? 'Random Forest' : 'LSTM';
    const modelsRef = ref(database, `Models/${typeLabel}`);
    get(modelsRef).then(snapshot => {
      const data = snapshot.val();
      if (data) {
        const models = Object.entries(data).map(([id, model]) => ({ id, ...model }));
        setAvailableModels(models);
      } else {
        setAvailableModels([]);
      }
    });
  }, [modelType]);

  // Predict Movement logic
  const handlePredictMovement = () => {
    setMainPanel('predict');
    setPredictionMode(false);
    setPredictedPathData([]);
    setNumPoints(5);
    setInterval(1);
    setPredictAnimal(selectedAnimals[0] || '');
  };

  const handleRunPrediction = () => {
    if (!predictAnimal) return;
    const animal = animalData.find(a => a.id === predictAnimal);
    if (!animal || !animal.locationHistory || animal.locationHistory.length < 5) return;
    const total = animal.locationHistory.length;
    const splitIdx = Math.max(1, total - numPoints);
    const historical = animal.locationHistory.slice(0, splitIdx);
    const predicted = animal.locationHistory.slice(splitIdx);
    setPathData([{
      ...animal,
      path: historical.map(loc => [loc.lat, loc.lng]),
      locations: historical,
      color: getPathColor(animal.species)
    }]);
    setPredictedPathData([{
      ...animal,
      path: predicted.map(loc => [loc.lat, loc.lng]),
      locations: predicted,
      color: '#a020f0',
      predicted: true
    }]);
    setPredictionMode(true);
  };

  // New Home Panel UI
  const HomePanel = () => (
    <Paper elevation={4} sx={{ p: 2, borderRadius: 3, width: 250, mt: 2, mr: 2, position: 'absolute', top: 0, right: 0, zIndex: 1200 }}>
      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 700, fontSize: 18 }}>AI Animal Tracking</Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Button fullWidth size="medium" variant="contained" color="primary" startIcon={<ModelTraining />} sx={{ py: 1, fontWeight: 600, fontSize: 15 }} onClick={() => { setMainPanel('train'); setTrainStep(0); }}>
            Train Model
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth size="medium" variant="contained" color="secondary" startIcon={<DirectionsRun />} sx={{ py: 1, fontWeight: 600, fontSize: 15 }} onClick={handlePredictMovement}>
            Predict Movement
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth size="medium" variant="contained" color="info" startIcon={<Timeline />} sx={{ py: 1, fontWeight: 600, fontSize: 15 }} onClick={() => setMainPanel('patterns')}>
            View Patterns
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth size="medium" variant="contained" color="success" startIcon={<Public />} sx={{ py: 1, fontWeight: 600, fontSize: 15 }} onClick={() => setMainPanel('geo')}>
            Geo-analysis
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  // Train Model Workflow Panel
  const TrainModelPanel = () => (
    <Paper elevation={4} sx={{ p: 2, borderRadius: 3, width: '100%', maxWidth: 480, minWidth: 340, mt: 2, mr: 2, position: 'absolute', top: 0, right: 0, zIndex: 1200, boxSizing: 'border-box' }}>
      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 700, fontSize: 18 }}>Train Model</Typography>
      {/* Step 1: Select Animal (skip data source step) */}
      {trainStep === 0 && (
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontSize: 15 }}>Select Animal</Typography>
          <AnimalSelector
            animals={animalData}
            selectedAnimals={selectedAnimals}
            onAnimalSelection={setSelectedAnimals}
            collapsed={false}
            onToggleCollapse={() => {}}
          />
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 3, fontSize: 15, py: 1 }} onClick={() => setTrainStep(1)} disabled={selectedAnimals.length === 0}>
            Next
          </Button>
        </Box>
      )}
      {/* Step 2: Select Model Type and go directly to parameters */}
      {trainStep === 1 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontSize: 15 }}>Select Model Type</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model Type</InputLabel>
            <Select
              value={modelType}
              label="Model Type"
              onChange={e => {
                setModelType(e.target.value);
                setSelectedModel('');
                setTrainStep(2); // Go directly to parameters step
              }}
            >
              <MenuItem value="random_forest">Random Forest</MenuItem>
              <MenuItem value="lstm">LSTM</MenuItem>
            </Select>
          </FormControl>
          <Button fullWidth sx={{ mt: 1, fontSize: 15, py: 1 }} onClick={() => setTrainStep(0)}>Back</Button>
        </Box>
      )}
      {/* Step 3: Parameters dashboard (trainStep 2) */}
      {trainStep === 2 && (
        <AnimalDetailsPanel
          animal={animalData.find(a => a.id === selectedAnimals[0])}
          onBack={() => setTrainStep(1)}
          dataSource={dataSource}
          modelType={modelType}
          selectedModel={selectedModel}
          availableModels={availableModels}
          showFullPanel
        />
      )}
      {/* Back to home */}
      <Button fullWidth sx={{ mt: 2, fontSize: 15, py: 1 }} onClick={() => setMainPanel('home')}>Back to Home</Button>
    </Paper>
  );

  // Prediction Panel
  const PredictPanel = () => (
    <Paper elevation={4} sx={{ p: 2, borderRadius: 3, width: 340, mt: 2, mr: 2, position: 'absolute', top: 0, right: 0, zIndex: 1200 }}>
      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 700, fontSize: 18 }}>Predict Movement</Typography>
      <Box sx={{ mb: 2 }}>
        <AnimalSelector
          animals={animalData}
          selectedAnimals={predictAnimal ? [predictAnimal] : []}
          onAnimalSelection={ids => setPredictAnimal(ids[0] || '')}
          collapsed={false}
          singleSelect={true}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Number of Points to Predict</Typography>
        <Slider
          value={numPoints}
          min={1}
          max={20}
          step={1}
          onChange={(_, v) => setNumPoints(v)}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Time Interval</InputLabel>
          <Select value={interval} label="Time Interval" onChange={e => setInterval(Number(e.target.value))}>
            <MenuItem value={1}>1 hour</MenuItem>
            <MenuItem value={6}>6 hours</MenuItem>
            <MenuItem value={12}>12 hours</MenuItem>
            <MenuItem value={24}>1 day</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Button fullWidth variant="contained" color="secondary" sx={{ mt: 2 }} onClick={handleRunPrediction} disabled={!predictAnimal}>
        Predict
      </Button>
      <Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={() => setMainPanel('home')}>
        Back to Menu
      </Button>
    </Paper>
  );

  return (
    <div className="historical-patterns">
      <div className="analysis-container">
        <div className="analysis-map">
          <MapContainer
            center={[-1.948, 34.1665]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            key={mapKey}
            whenReady={handleMapLoad}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {mapReady && pathData && pathData.map(animal => (
              <Polyline
                key={animal.id + '-historical'}
                positions={animal.path}
                color={getPathColor(animal.species)}
                weight={3}
                opacity={0.7}
              />
            ))}
            {mapReady && predictionMode && predictedPathData && predictedPathData.map(animal => (
              <>
                <Polyline
                  key={animal.id + '-predicted'}
                  positions={animal.path}
                  color={animal.color}
                  weight={4}
                  opacity={0.9}
                  dashArray="8 8"
                />
                {animal.locations.map((loc, idx) => (
                  <Marker
                    key={animal.id + '-predicted-marker-' + idx}
                    position={[loc.lat, loc.lng]}
                    icon={L.divIcon({
                      className: 'predicted-marker',
                      html: `<div style="background:#a020f0;border-radius:50%;width:18px;height:18px;border:2px solid #fff;box-shadow:0 0 6px #a020f0;"></div>`
                    })}
                  >
                    <Popup>
                      <div>
                        <strong>Predicted Point</strong><br />
                        Lat: {loc.lat}<br />
                        Lng: {loc.lng}<br />
                        {loc.timestamp && `Time: ${new Date(loc.timestamp).toLocaleString()}`}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            ))}
            {mapReady && getCurrentPositions().map(animal => (
              <Marker
                key={animal.id}
                position={animal.position}
                icon={getAnimalIcon(animal.species)}
              >
                <Popup>
                  <div>
                    <strong>{animal.name}</strong><br />
                    Species: {animal.species}<br />
                    Date: {new Date(animal.timestamp).toLocaleDateString()}<br />
                    Time: {new Date(animal.timestamp).toLocaleTimeString()}<br />
                    Temperature: {animal.temperature}°C<br />
                    Activity: {animal.activity}
                  </div>
                </Popup>
              </Marker>
            ))}
            <ZoomControl position="bottomright" />
          </MapContainer>
          {/* Prediction Results Panel */}
          {mainPanel === 'predict' && <PredictPanel />}
        </div>

       

        {/* New Home/Workflow Panel at top right */}
        {mainPanel === 'home' && <HomePanel />}
        {mainPanel === 'train' && <TrainModelPanel />}
        {/* TODO: Add panels for predict, patterns, geo as needed */}
      </div>
    </div>
  );
}

export default HistoricalPatterns;