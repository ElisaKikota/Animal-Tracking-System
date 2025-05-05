import '../styles/RealTime.css';
import "leaflet/dist/leaflet.css"

import React, { useEffect, useState } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { database } from '../firebase'; // Adjust the path if needed

import ReportMenu from './ReportMenu';  // Adjust the path as needed


// import ctIcon from '../assets/CT_Icon_Sighting.png';

import reportsIcon from '../assets/reports.png';
import patrolsIcon from '../assets/patrols.png';
import layersIcon from '../assets/layers.png';
import animalIcon from '../assets/animal.png';
import remoteControlIcon from '../assets/Remote Control Tag.png'

import outdoorsIcon from '../assets/outdoors.png';
import lightIcon from '../assets/light.png';
import darkIcon from '../assets/dark.png';
import satelliteIcon from '../assets/satellite.png';
import threeDIcon from '../assets/3d.png';
import heatmapIcon from '../assets/heatmap.png';
import locationIcon from '../assets/location.png'

import CTIcon from '../assets/CT_Icon_Sighting.png';
import fireIcon from '../assets/Fire.png';
import humanWildlifeIcon from '../assets/Human_Wildlife_Contact.png';
import injuredAnimalIcon from '../assets/Injured_Animal.png';
import invasiveSpeciesIcon from '../assets/Invasive_Species_Sighting.png';
import rainfallIcon from '../assets/Rainfall.png';
import rhinoSightingIcon from '../assets/Rhino_Sighting.png';
import wildlifeSightingIcon from '../assets/Wildlife_Sighting.png';

import elephantIcon from '../assets/elephant.png'
import lionIcon from '../assets/lion.png';
import giraffeIcon from '../assets/giraffe.png';
import rhinoIcon from '../assets/rhino.png';
import leopardIcon from '../assets/leopard.png';

import { Icon } from "leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';

export default function RealTime() {
  const [animalData, setAnimalData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [map] = useState(null);
  const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
  const [isReportMenuVisible, setIsReportMenuVisible] = useState(false);
  const [isPatrolMenuVisible, setIsPatrolMenuVisible] = useState(false);
  const [isAnimalMenuVisible, setIsAnimalMenuVisible] = useState(false);
  const [isRemoteControlMenuVisible, setIsRemoteControlMenuVisible] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    reports: [],
    patrols: [],
    animals: [],
    remoteControl: []
  });
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

  const [remoteControlSearchTerm, setRemoteControlSearchTerm] = useState('');
  const [remoteControlFilter, setRemoteControlFilter] = useState('all');

  useEffect(() => {
    const animalSpecies = ['Elephants', 'Giraffes', 'Lions', 'Leopards', 'Rhinos'];

    animalSpecies.forEach((species) => {
      const animalsRef = ref(database, `Animals/${species}`);
      onValue(animalsRef, (snapshot) => {
        const data = snapshot.val();
        const animalArray = Object.keys(data).map((key) => {
          const animal = data[key];
          const latestTimestamp = Object.keys(animal.location).sort().pop();
          const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
          const location = animal.location[latestTimestamp][latestTime];

          return {
            ...animal,
            id: key,
            species: species.slice(0, -1),
            location: {
              Lat: parseFloat(location.Lat),
              Lng: parseFloat(location.Long),
            },
            upload_interval: parseInt(animal.upload_interval) || 0, // Parse as integer, default to 0
            date: latestTimestamp,
            time: latestTime,
          };
        });

        setAnimalData(prevData => {
          const updatedData = [...prevData];
          animalArray.forEach(newAnimal => {
            const index = updatedData.findIndex(animal => animal.id === newAnimal.id);
            if (index !== -1) {
              updatedData[index] = newAnimal;
            } else {
              updatedData.push(newAnimal);
            }
          });
          return updatedData;
        });
      }, (error) => {
        console.error('Error fetching animal data:', error);
      });
    });
  }, []);

  useEffect(() => {
    const reportCategories = [
      'CT_Icon_Sighting',
      'Fire',
      'Human_Wildlife_Contact',
      'Injured_Animal',
      'Invasive_Species_Sighting',
      'Rainfall',
      'Rhino_Sighting',
      'Wildlife_Sighting'
    ];

    const reportsRef = ref(database, 'Reports');

    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedReports = reportCategories.flatMap(category => {
          const categoryReports = data[category] || {};
          return Object.entries(categoryReports).map(([key, report]) => ({
            ...report,
            id: key,
            type: category,
            location: report.location ? {
              Lat: parseFloat(report.location.Lat),
              Lng: parseFloat(report.location.Long),
            } : null,
            day: report.day || 'N/A',
            time: report.time || 'N/A'
          }));
        });
        setReportData(fetchedReports);
      }
    }, (error) => {
      console.error('Error fetching report data:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleLayerChange = (style) => {
    if (map) {
      map.setStyle(`mapbox://styles/${style}`);
    }
  };

  const toggleReportMenu = () => {
    setIsReportMenuVisible(!isReportMenuVisible);
    setIsLayerMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const togglePatrolMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(!isPatrolMenuVisible);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleLayerMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(!isLayerMenuVisible);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleAnimalMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(!isAnimalMenuVisible);
    setIsRemoteControlMenuVisible(false);
  };

  const toggleRemoteControlMenu = () => {
    setIsReportMenuVisible(false);
    setIsPatrolMenuVisible(false);
    setIsLayerMenuVisible(false);
    setIsAnimalMenuVisible(false);
    setIsRemoteControlMenuVisible(!isRemoteControlMenuVisible);
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setIsModalOpen(false);
  };

  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>{report.type.replace(/_/g, ' ')}</h2>
          <p><strong>Date:</strong> {report.day}</p>
          <p><strong>Time:</strong> {report.time}</p>
          <p><strong>Reported by:</strong> {report.reported_by || 'N/A'}</p>
          <p><strong>Location:</strong> Lat: {report.location.Lat}, Long: {report.location.Lng}</p>
          <p><strong>Description:</strong> {report.description || 'N/A'}</p>
          {report.notes && <p><strong>Notes:</strong> {report.notes}</p>}
          {report.pictures && (
            <div>
              <h3>Attached Images</h3>
              {report.pictures.map((img, index) => (
                <img key={index} src={img} alt="Attached" className="attached-image" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleIntervalChange = (e, animalId, species) => {
    const newIntervalString = e.target.value;
    const newInterval = newIntervalString === '' ? 0 : parseInt(newIntervalString, 10);

    if (isNaN(newInterval)) {
      console.error('Invalid input: Not a number');
      return; // Exit the function if input is not a valid number
    }

    // Update local state immediately to reflect in the input field
    setAnimalData(prevData =>
      prevData.map(animal =>
        animal.id === animalId
          ? { ...animal, upload_interval: newInterval }
          : animal
      )
    );

    // Clear the previous timeout to prevent multiple updates
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timeout to update Firebase after a short delay
    const timeoutId = setTimeout(() => {
      const pluralSpecies = species === 'Elephant' ? 'Elephants' :
        species === 'Lion' ? 'Lions' :
          species === 'Giraffe' ? 'Giraffes' :
            species === 'Rhino' ? 'Rhinos' :
              species === 'Leopard' ? 'Leopards' : species;

      // Update Firebase after the delay
      const animalRef = ref(database, `Animals/${pluralSpecies}/${animalId}`);
      update(animalRef, {
        upload_interval: newInterval
      })
        .then(() => {
          console.log("Upload interval updated successfully in Firebase");
        })
        .catch((error) => {
          console.error("Error updating upload interval in Firebase:", error);
          // Revert local state if Firebase update fails
          setAnimalData(prevData =>
            prevData.map(animal =>
              animal.id === animalId
                ? { ...animal, upload_interval: animal.upload_interval }
                : animal
            )
          );
        });
    }, 1000); // Update Firebase after 1 second delay

    setTypingTimeout(timeoutId); // Store the timeout ID
  };

  // Filter functions
  const filterData = (data, type) => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => {
        const searchStr = searchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchStr) ||
          item.category?.toLowerCase().includes(searchStr) ||
          item.species?.toLowerCase().includes(searchStr)
        );
      });
    }

    return filtered;
  };

  // Filter toggle handlers
  const toggleFilter = (type, filter) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(filter)
        ? prev[type].filter(f => f !== filter)
        : [...prev[type], filter]
    }));
  };

  // Render filter section
  const renderFilters = (type) => {
    return (
      <div className={`${type}-filters`}>
        <input
          type="text"
          className="search-bar"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    );
  };

  const renderReportItem = (report) => {
    return (
      <div key={report.id} className="report-item" onClick={() => openModal(report)}>
        <img src={getReportIcon(report.type)} alt={report.type} className="report-image" />
        <span className="report-name">{report.type.replace(/_/g, ' ')}</span>
        <div className="report-day-time">
          <div>{report.day}</div>
          <div>{report.time}</div>
        </div>
        <button className="locate-icon" onClick={(e) => {
          e.stopPropagation();
          handleLocateClick(report);
        }}>
          <img src={locateIcon} alt="Locate" className="locate-icon" />
        </button>
      </div>
    );
  };

  const renderMenuItem = (item, type) => {
    const getIcon = () => {
      switch(type) {
        case 'patrols':
          return patrolsIcon;
        case 'animals':
          return item.species.toLowerCase() === 'elephant' ? elephantIcon :
                 item.species.toLowerCase() === 'lion' ? lionIcon :
                 item.species.toLowerCase() === 'giraffe' ? giraffeIcon :
                 item.species.toLowerCase() === 'rhino' ? rhinoIcon :
                 item.species.toLowerCase() === 'leopard' ? leopardIcon :
                 animalIcon;
        case 'remoteControl':
          return remoteControlIcon;
        default:
          return animalIcon;
      }
    };

    return (
      <div key={item.id} className={`${type}-item`}>
        <img src={getIcon()} alt={type} className={`${type}-image`} />
        <span className={`${type}-name`}>{item.name || item.species}</span>
        <div className={`${type}-day-time`}>
          <div>{item.date || 'N/A'}</div>
          <div>{item.time || 'N/A'}</div>
        </div>
        <button className="locate-icon" onClick={() => handleLocateClick(item)}>
          <img src={locateIcon} alt="Locate" className="locate-icon" />
        </button>
      </div>
    );
  };

  const renderMenu = (type, data) => {
    const filteredData = filterData(data, type);
    
    const isVisible = {
      reports: isReportMenuVisible,
      patrols: isPatrolMenuVisible,
      animals: isAnimalMenuVisible,
      remoteControl: isRemoteControlMenuVisible
    }[type];

    const toggleMenu = {
      reports: toggleReportMenu,
      patrols: togglePatrolMenu,
      animals: toggleAnimalMenu,
      remoteControl: toggleRemoteControlMenu
    }[type];
    
    return (
      <div className={`${type}-menu ${isVisible ? 'show' : 'hide'}`}>
        <div className={`${type}-header`}>
          <span className={`${type}-title`}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          <span className="close-sign" onClick={toggleMenu}>&times;</span>
        </div>
        {renderFilters(type)}
        <div className={`${type}-list`}>
          {type === 'reports' 
            ? filteredData.map(report => renderReportItem(report))
            : filteredData.map(item => renderMenuItem(item, type))
          }
        </div>
      </div>
    );
  };

  const filteredRemoteControls = animalData.filter(animal => remoteControlFilter === 'all' || remoteControlFilter === animal.status);

  return (
    <div className="realtime-container">
      <div className="fixed-sidebar">
        <button className={`sidebar-button ${isReportMenuVisible ? 'active' : ''}`} onClick={toggleReportMenu}>
          <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
          <span>Reports</span>
        </button>
        <button className={`sidebar-button ${isPatrolMenuVisible ? 'active' : ''}`} onClick={togglePatrolMenu}>
          <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
          <span>Patrols</span>
        </button>
        <button className={`sidebar-button ${isLayerMenuVisible ? 'active' : ''}`} onClick={toggleLayerMenu}>
          <img src={layersIcon} alt="Layers" className="sidebar-icon" />
          <span>Layers</span>
        </button>
        <button className={`sidebar-button ${isAnimalMenuVisible ? 'active' : ''}`} onClick={toggleAnimalMenu}>
          <img src={animalIcon} alt="Animals" className="sidebar-icon" />
          <span>Animals</span>
        </button>
        <button className={`sidebar-button ${isRemoteControlMenuVisible ? 'active' : ''}`} onClick={toggleRemoteControlMenu}>
          <img src={remoteControlIcon} alt="Remote Control" className="sidebar-icon" />
          <span>Remote Control</span>
        </button>
      </div>

      <div className="map">
        <MapContainer
          center={[0, 0]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MarkerClusterGroup chunkedLoading>
            {reportData.map(report => {
              const reportIcon = new Icon({
                iconUrl:
                  report.type === 'CT_Icon_Sighting' ? CTIcon :
                    report.type === 'Fire' ? fireIcon :
                      report.type === 'Human_Wildlife_Contact' ? humanWildlifeIcon :
                        report.type === 'Injured_Animal' ? injuredAnimalIcon :
                          report.type === 'Invasive_Species_Sighting' ? invasiveSpeciesIcon :
                            report.type === 'Rainfall' ? rainfallIcon :
                              report.type === 'Rhino_Sighting' ? rhinoSightingIcon :
                                wildlifeSightingIcon,
                iconSize: [38, 38]
              });

              return (
                <Marker
                  key={report.id}
                  position={[report.location.Lat, report.location.Lng]}
                  icon={reportIcon}
                >
                  <Popup>
                    <div style={{ padding: '0px', borderRadius: '1px' }}>
                      <strong>{report.type.replace(/_/g, ' ')}</strong><br />
                      Location: {report.location.Lat}, {report.location.Lng}<br />
                      Date: {report.day}<br />
                      Time: {report.time}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {animalData.map(animal => {
              // Determine the icon based on species
              const speciesIcon = new Icon({
                iconUrl:
                  animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                    animal.species.toLowerCase() === 'lion' ? lionIcon :
                      animal.species.toLowerCase() === 'giraffe' ? giraffeIcon :
                        animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                          animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                            animalIcon, // Default icon for other species
                iconSize: [38, 38] // Adjust size as needed
              });

              return (
                <Marker
                  key={animal.id} // Ensure each marker has a unique key
                  position={[animal.location.Lat, animal.location.Lng]}
                  icon={speciesIcon} // Use species-specific icon
                >
                  <Popup>
                    <div style={{ padding: '0px', borderRadius: '1px' }}>
                      <strong>{animal.name}</strong><br />
                      Sex: {animal.sex}<br />
                      Age: {animal.age} years<br />
                      Temp: {animal.temp} °C<br />
                      Activity: {animal.activity}
                    </div>
                  </Popup>

                </Marker>
              );
            })}
          </MarkerClusterGroup>
          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>

      <div className={`layer-menu ${isLayerMenuVisible ? 'show' : 'hide'}`}>
        <div className="layer-menu-header">
          <span className="layer-menu-title">Map Layers</span>
          <span className="layer-menu-close" onClick={toggleLayerMenu}>&times;</span>
        </div>
        
        <div className="layer-section">
          <div className="layer-section-title">Base Maps</div>
          <button onClick={() => handleLayerChange('outdoors-v12')}>
            <img src={outdoorsIcon} alt="Outdoors" className="layer-icon" />
            Outdoors
          </button>
          <button onClick={() => handleLayerChange('light-v11')}>
            <img src={lightIcon} alt="Light" className="layer-icon" />
            Light
          </button>
          <button onClick={() => handleLayerChange('dark-v11')}>
            <img src={darkIcon} alt="Dark" className="layer-icon" />
            Dark
          </button>
          <button onClick={() => handleLayerChange('satellite-v9')}>
            <img src={satelliteIcon} alt="Satellite" className="layer-icon" />
            Satellite
          </button>
        </div>

        <div className="layer-section">
          <div className="layer-section-title">Overlays</div>
          <button onClick={() => handleLayerChange('3d')}>
            <img src={threeDIcon} alt="3D" className="layer-icon" />
            3D Buildings
          </button>
          <button onClick={() => handleLayerChange('heatmap')}>
            <img src={heatmapIcon} alt="Heatmap" className="layer-icon" />
            Heatmap
          </button>
        </div>
      </div>

      {renderMenu('reports', reportData)}
      {renderMenu('patrols', patrolData)}
      {renderMenu('animals', animalData)}
      {renderMenu('remoteControl', animalData)}

      {isModalOpen && (
        <ReportModal report={selectedReport} onClose={closeModal} />
      )}

      <div className={`remote-control-menu ${isRemoteControlMenuVisible ? 'show' : 'hide'}`}>
        <div className="remote-control-header">
          <span className="remote-control-title">Remote Control</span>
          <span className="close-sign" onClick={toggleRemoteControlMenu}>&times;</span>
        </div>
        <div className="remote-control-filters">
          <input
            type="text"
            className="search-bar"
            placeholder="Search remote controls..."
            value={remoteControlSearchTerm}
            onChange={(e) => setRemoteControlSearchTerm(e.target.value)}
          />
        </div>
        <div className="remote-control-list">
          {filteredRemoteControls.map((control) => (
            <div key={control.id} className="remote-control-item">
              <span className="entry-number">{control.id}</span>
              <img src={remoteControlIcon} alt="Remote Control" className="remote-control-image" />
              <span className="remote-control-name">{control.name}</span>
              <span className="remote-control-day-time">{control.status}</span>
              <button className="locate-icon" onClick={() => handleLocateClick(control)}>
                <img src={locateIcon} alt="Locate" className="locate-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
