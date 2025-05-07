import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Box, Card, CardContent, CircularProgress
} from '@mui/material';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import 'leaflet/dist/leaflet.css';
import DateRangeSelector from './DateRangeSelector';
import AnimalSelector from './AnimalSelector';
import TimelineControl from './TimelineControl';
import AnalysisFeatures from './AnalysisFeatures';
import './HistoricalPatterns.css';
import { MapContainer, TileLayer, Polyline, ZoomControl, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import animal icons
import elephantIcon from '../../assets/elephant.png';
import lionIcon from '../../assets/lion.png';
import giraffeIcon from '../../assets/giraffe.png';
import rhinoIcon from '../../assets/rhino.png';
import leopardIcon from '../../assets/leopard.png';

function HistoricalPatterns() {
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animalData, setAnimalData] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    endDate: new Date()
  });
  const [activeMenu, setActiveMenu] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [pathData, setPathData] = useState([]);
  const [mapKey, setMapKey] = useState('initial');
  const [mapReady, setMapReady] = useState(false);
  const [animalSelectorCollapsed, setAnimalSelectorCollapsed] = useState(false);
  
  // Get main sidebar state from App's CSS classes
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);
  const containerRef = useRef(null);
  
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

  // Load all animal data
  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];
    const fetchedData = [];

    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.entries(data).forEach(([id, animal]) => {
            const animalObj = {
              id,
              species: species.slice(0, -1),
              name: animal.name,
              sex: animal.sex,
              age: animal.age,
              locationHistory: []
            };

            // Process location history
            if (animal.location) {
              Object.entries(animal.location).forEach(([date, times]) => {
                Object.entries(times).forEach(([time, location]) => {
                  const timestamp = new Date(`${date} ${time}`).getTime();
                  animalObj.locationHistory.push({
                    timestamp,
                    date,
                    time,
                    lat: parseFloat(location.Lat),
                    lng: parseFloat(location.Long),
                    temperature: location.temperature || 'N/A',
                    activity: location.activity || 'N/A'
                  });
                });
              });
              
              // Sort location history by timestamp
              animalObj.locationHistory.sort((a, b) => a.timestamp - b.timestamp);
            }

            fetchedData.push(animalObj);
          });
        }
        setAnimalData(fetchedData);
      });
    });
  }, []);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleAnimalSelection = (selectedIds) => {
    setSelectedAnimals(selectedIds);
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const handleTimelineChange = (timestamp) => {
    setCurrentTimestamp(timestamp);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

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

    const newPathData = [];
    const startTimestamp = dateRange.startDate.getTime();
    const endTimestamp = dateRange.endDate.getTime();

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

  return (
    <div 
      className={isMainSidebarOpen ? 'analysis-container sidebar-open' : 'analysis-container'} 
      ref={containerRef}
    >
      <div className="analysis-map" style={{ position: 'relative', width: '100%', height: '100%' }}>
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
          {mapReady && pathData.map(animal => (
            <Polyline
              key={animal.id}
              positions={animal.path}
              color={getPathColor(animal.species)}
              weight={3}
              opacity={0.7}
            />
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
        <div className="controls-panel unified-panel" style={{ position: 'absolute', top: 0, right: 0, width: 400, maxWidth: '95vw', margin: 24, zIndex: 1000, background: 'rgba(255,255,255,0.95)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2>Analysis</h2>
          <DateRangeSelector 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate}
            onDateRangeChange={handleDateRangeChange}
          />
          <AnimalSelector 
            animals={animalData}
            selectedAnimals={selectedAnimals}
            onAnimalSelection={ids => {
              setSelectedAnimals(ids.slice(0, 1));
              setAnimalSelectorCollapsed(ids.length === 1);
            }}
            collapsed={animalSelectorCollapsed && selectedAnimals.length === 1}
            onExpand={() => setAnimalSelectorCollapsed(false)}
            singleSelect // Pass a prop to render as single select if needed
          />
          {pathData.length > 0 && (
            <TimelineControl
              paths={pathData}
              currentTime={currentTimestamp}
              onTimeChange={handleTimelineChange}
              isPlaying={isPlaying}
              onPlayToggle={togglePlayback}
              playbackSpeed={playbackSpeed}
              onSpeedChange={handleSpeedChange}
            />
          )}
          {/* Advanced Analysis: Only show if one animal is selected */}
          {selectedAnimals.length === 1 && (
            <div style={{ marginTop: 24 }}>
              <AnalysisFeatures
                animalData={animalData}
                selectedAnimals={selectedAnimals}
                dateRange={dateRange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoricalPatterns;