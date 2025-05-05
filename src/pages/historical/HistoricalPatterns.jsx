import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Box, Card, CardContent, CircularProgress
} from '@mui/material';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Sidebar from './Sidebar';
import DateRangeSelector from './DateRangeSelector';
import AnimalSelector from './AnimalSelector';
import TimelineControl from './TimelineControl';
import './HistoricalPatterns.css';

// Import animal icons
import elephantIcon from '../../assets/elephant.png';
import lionIcon from '../../assets/lion.png';
import giraffeIcon from '../../assets/giraffe.png';
import rhinoIcon from '../../assets/rhino.png';
import leopardIcon from '../../assets/leopard.png';

// Replace with your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpc2FraWtvdGEiLCJhIjoiY2x6MTkwYWRiMnE0ZTJpcjR5bzFjMzNrZyJ9.HRBoAER-bGLPEcdhbUsW_A';

function HistoricalPatterns() {
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
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

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [-1.948, 34.1665],
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup on unmount
    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !historicalData.length) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    historicalData.forEach(data => {
      const el = document.createElement('div');
      el.className = 'marker';
      
      // Set icon based on species, handling both singular and plural forms
      const speciesLower = data.species.toLowerCase();
      const iconUrl = speciesLower.includes('elephant') ? elephantIcon :
                     speciesLower.includes('lion') ? lionIcon :
                     speciesLower.includes('rhino') ? rhinoIcon :
                     speciesLower.includes('leopard') ? leopardIcon :
                     speciesLower.includes('giraffe') ? giraffeIcon :
                     giraffeIcon; // Default to giraffe if no match

      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.width = '38px';
      el.style.height = '38px';
      el.style.backgroundSize = 'cover';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([data.location.Lng, data.location.Lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 10px;">
                <strong>${data.name}</strong><br>
                Species: ${data.species}<br>
                Date: ${data.date}<br>
                Time: ${data.time}
              </div>
            `)
        )
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [historicalData]);

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
      });
    });

    setAnimalData(fetchedData);
  }, []);

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

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleAnimalSelection = (selectedIds) => {
    setSelectedAnimals(selectedIds);
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    setCurrentTimestamp(null); // Reset timestamp when date range changes
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
    const iconUrl = 
      species.toLowerCase() === 'elephant' ? elephantIcon :
      species.toLowerCase() === 'lion' ? lionIcon :
      species.toLowerCase() === 'giraffe' ? giraffeIcon :
      species.toLowerCase() === 'rhino' ? rhinoIcon :
      species.toLowerCase() === 'leopard' ? leopardIcon :
      elephantIcon; // Default

    return {
      url: iconUrl,
      size: [38, 38],
      anchor: [19, 38]
    };
  };

  const getPathColor = (species) => {
    switch(species.toLowerCase()) {
      case 'elephant': return '#4a7c59';
      case 'lion': return '#f39237';
      case 'giraffe': return '#d63230';
      case 'rhino': return '#5b85aa';
      case 'leopard': return '#8b5fbf';
      default: return '#3f88c5';
    }
  };

  // Get current positions based on the timeline
  const getCurrentPositions = () => {
    if (!currentTimestamp) return [];
    
    return pathData.map(animal => {
      // Find the location closest to current timestamp (before or equal)
      const locationsBeforeTimestamp = animal.locations.filter(
        loc => loc.timestamp <= currentTimestamp
      );
      
      if (locationsBeforeTimestamp.length === 0) return null;
      
      const currentLocation = locationsBeforeTimestamp[locationsBeforeTimestamp.length - 1];
      return {
        id: animal.id,
        name: animal.name,
        species: animal.species,
        position: [currentLocation.lat, currentLocation.lng],
        timestamp: currentLocation.timestamp,
        temperature: currentLocation.temperature,
        activity: currentLocation.activity
      };
    }).filter(position => position !== null);
  };

  const currentPositions = getCurrentPositions();
  
  // Safely handle map loading
  const handleMapLoad = () => {
    setMapReady(true);
  };

  return (
    <Container maxWidth="xl">
      <div 
        className={isMainSidebarOpen ? 'historical-patterns-container sidebar-open' : 'historical-patterns-container'} 
        ref={containerRef}
      >
        <Sidebar 
          onMenuSelect={toggleMenu} 
          activeMenu={activeMenu}
          isMainSidebarOpen={isMainSidebarOpen}
        />
        
        <div className="controls-panel">
          <h2>Historical Movement Patterns</h2>
          <DateRangeSelector 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate}
            onDateRangeChange={handleDateRangeChange}
          />
          <AnimalSelector 
            animals={animalData}
            selectedAnimals={selectedAnimals}
            onAnimalSelection={handleAnimalSelection}
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
        </div>

        <div className="historical-map">
          <div ref={mapContainer} className="map" style={{ height: '500px', width: '100%', marginTop: '20px' }} />
        </div>
      </div>
    </Container>
  );
}

export default HistoricalPatterns;