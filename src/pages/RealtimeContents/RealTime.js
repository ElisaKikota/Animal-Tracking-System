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
    const fetchedReports = [];

    reportCategories.forEach((category) => {
      const reportsRef = ref(database, `Reports/${category}`);
      onValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        const reportArray = Object.keys(data).map((key) => {
          const report = data[key];
          return {
            ...report,
            id: key,
            category,

            location: {
              Lat: parseFloat(report.location.Lat),
              Lng: parseFloat(report.location.Long),
            },
            timestamp: report.timestamp
          };
        });
        fetchedReports.push(...reportArray);
        setReportData(fetchedReports);
      }, (error) => {
        console.error('Error fetching report data:', error);
      });
    });
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
          <h2>{report.category.replace(/_/g, ' ')}</h2>
          <p><strong>Reported by:</strong> {report.reported_by}</p>
          <p><strong>Report Time:</strong> {report.time}</p>
          <p><strong>Location:</strong> Lat: {report.location.Lat}, Long: {report.location.Long}</p>
          {report.species && <p><strong>Species:</strong> {report.species}</p>}
          {report.cause_of_injury && <p><strong>Cause of Injury:</strong> {report.cause_of_injury}</p>}
          {report.cause_of_fire && <p><strong>Fire Cause:</strong> {report.cause_of_fire}</p>}
          <p><strong>Action Taken:</strong> {report.action_taken}</p>
          <p><strong>Notes:</strong> {report.notes}</p>
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

  return (
    <div className="realtime-container">
      <div className="fixed-sidebar">
        <button className="sidebar-button" onClick={toggleReportMenu}>
          <img src={reportsIcon} alt="Reports" className="sidebar-icon" />
          <span>Reports</span>
        </button>
        <button className="sidebar-button" onClick={togglePatrolMenu}>
          <img src={patrolsIcon} alt="Patrols" className="sidebar-icon" />
          <span>Patrols</span>
        </button>
        <button className="sidebar-button" onClick={toggleLayerMenu}>
          <img src={layersIcon} alt="Layers" className="sidebar-icon" />
          <span>Layers</span>
        </button>
        <button className="sidebar-button" onClick={toggleAnimalMenu}>
          <img src={animalIcon} alt="Animals" className="sidebar-icon" />
          <span>Animals</span>
        </button>
        <button className="sidebar-button" onClick={toggleRemoteControlMenu}>
          <img src={remoteControlIcon} alt="Remote Control" className="sidebar-icon" />
          <span>Remote<br></br>Control</span>
        </button>
      </div>

      <MapContainer className="map" center={[-1.948, 34.1665]} zoom={16} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkerClusterGroup chunkedLoading>
          {reportData.map(report => {
            const reportIcon = new Icon({
              iconUrl:
                report.category === 'CT_Icon_Sighting' ? CTIcon :
                  report.category === 'Fire' ? fireIcon :
                    report.category === 'Human_Wildlife_Contact' ? humanWildlifeIcon :
                      report.category === 'Injured_Animal' ? injuredAnimalIcon :
                        report.category === 'Invasive_Species_Sighting' ? invasiveSpeciesIcon :
                          report.category === 'Rainfall' ? rainfallIcon :
                            report.category === 'Rhino_Sighting' ? rhinoSightingIcon :
                              wildlifeSightingIcon, // Default icon
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
                    <strong>{report.category.replace(/_/g, ' ')}</strong><br />
                    Location: {report.location.Lat}, {report.location.Long}<br />
                    Timestamp: {report.timestamp}
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

      <div id="layer-menu" className={`layer-menu ${isLayerMenuVisible ? 'show' : 'hide'}`}>
        <button className="btn" onClick={() => handleLayerChange('mapbox/outdoors-v11')}>
          <img src={outdoorsIcon} alt="Outdoors" className="layer-icon" />
          Outdoors
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/light-v10')}>
          <img src={lightIcon} alt="Light" className="layer-icon" />
          Light
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/dark-v10')}>
          <img src={darkIcon} alt="Dark" className="layer-icon" />
          Dark
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/satellite-v9')}>
          <img src={satelliteIcon} alt="Satellite" className="layer-icon" />
          Satellite
        </button>
        <button className="btn" onClick={() => handleLayerChange('elisakikota/clzjmuy7i00jx01r37jx58xy9')}>
          <img src={threeDIcon} alt="3D" className="layer-icon" />
          3D
        </button>
        <button className="btn" onClick={() => handleLayerChange('mapbox/heatmap-v10')}>
          <img src={heatmapIcon} alt="Heatmap" className="layer-icon" />
          Heatmap
        </button>
      </div>

      <ReportMenu
        isReportMenuVisible={isReportMenuVisible}
        toggleReportMenu={toggleReportMenu}
        reportData={reportData}
        openModal={openModal}
      />

      <div id="patrol-menu" className={`patrol-menu ${isPatrolMenuVisible ? 'show' : 'hide'}`}>
        <div className="patrol-header">
          <span className="plus-sign">+</span>
          <span className="report-title">Patrol Officers</span>
          <span className="close-sign" onClick={togglePatrolMenu}>x</span>
        </div>
        <div className="patrol-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="patrol-summary">
          <span>1 results from about <b> {/* time logic here */} ago until now</b></span>
        </div>
        <div className="patrol-list">
          {/* Replace with dynamic data */}
          <div className="patrol-item">
            <img src={patrolsIcon} alt="patrol" className="patrol-image" />
            <span className="entry-number">1</span>
            <span className="report-name">Elisa Kikota</span>
            <span className="report-day-time">
              <div classname="patrol-date">9th Aug 2024</div>
              <div classname="patrol-time">12:30 PM</div>
            </span>
            <button className="locate-icon">{<img src={locationIcon} alt="locationIcon" className="layer-icon" />}</button>
          </div>
          {/* Repeat for other reports */}
        </div>
      </div>

      <div id="animal-menu" className={`animal-menu ${isAnimalMenuVisible ? 'show' : 'hide'}`}>
        <div className="animal-header">
          <span className="plus-sign">+</span>
          <span className="animal-title">Animals</span>
          <span className="close-sign" onClick={() => setIsAnimalMenuVisible(false)}>x</span>
        </div>
        <div className="animal-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="animal-summary">
          <span>{animalData.length} results from about <b>{/* time logic here */} ago until now</b></span>
        </div>
        <div className="animal-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                      animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                        giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />
              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>
              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>
              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>

      </div>

      <div id="remote-control-menu" className={`remote-control-menu ${isRemoteControlMenuVisible ? 'show' : 'hide'}`}>
        <div className="remote-control-header">
          <span className="plus-sign">+</span>
          <span className="remote-control-title">Remote Control Tag</span>
          <span className="close-sign" onClick={toggleReportMenu}>x</span>
        </div>
        <div className="remote-control-filters">
          <input type="text" placeholder="Search..." className="search-bar" />
          <button className="filter-btn">Filters</button>
          <button className="date-btn">Dates</button>
          <button className="date-updated-btn">Date Updated</button>
        </div>
        <div className="remote-control-summary">
          <span>{reportData.length} results from about <b>{/* time logic here */} ago until now</b></span>
        </div>
        <div className="remote-control-list">
          {animalData.map((animal) => (
            <div key={animal.id} className="animal-item">
              <img src={
                animal.species.toLowerCase() === 'elephant' ? elephantIcon :
                  animal.species.toLowerCase() === 'lion' ? lionIcon :
                    animal.species.toLowerCase() === 'rhino' ? rhinoIcon :
                      animal.species.toLowerCase() === 'leopard' ? leopardIcon :
                        giraffeIcon // Default for giraffe and others
              } alt="animal" className="animal-image" />

              <span className="entry-number">{animal.id}</span>
              <span className="animal-name">{animal.name}</span>

              {/* Added text box for upload interval */}
              <span className="animal-upload-interval">
                <input
                  type="number"
                  value={animal.upload_interval}
                  placeholder="Enter Interval"
                  className='interval-input'
                  onChange={(e) => handleIntervalChange(e, animal.id, animal.species)}
                />

              </span>


              <span className="animal-day-time">
                <div className="animal-date">{animal.date}</div>
                <div className="animal-time">{animal.time}</div>
              </span>

              <button className="locate-icon">
                <img src={locationIcon} alt="locationIcon" className="layer-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>



      {isModalOpen && (
        <ReportModal report={selectedReport} onClose={closeModal} />
      )}


    </div>
  );
}
